const SESSION_CODE_LENGTH = 6;
const DEFAULT_DURATION_MINUTES = 10;
const CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

class StoreError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.name = "StoreError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// En la Entrega 1 guardamos datos en memoria para evitar complejidad de BD.
const sessions = new Map();

function normalizeSessionCode(sessionCode) {
  return String(sessionCode || "").trim().toUpperCase();
}

function normalizeDeviceId(deviceId) {
  return String(deviceId || "").trim();
}

function createSessionCode() {
  let code = "";

  for (let index = 0; index < SESSION_CODE_LENGTH; index += 1) {
    const randomIndex = Math.floor(Math.random() * CODE_CHARACTERS.length);
    code += CODE_CHARACTERS[randomIndex];
  }

  return code;
}

function generateUniqueSessionCode() {
  let code = createSessionCode();

  while (sessions.has(code)) {
    code = createSessionCode();
  }

  return code;
}

// Centraliza errores de sesion inexistente para REST y sockets.
function getSessionOrThrow(sessionCode) {
  const normalizedCode = normalizeSessionCode(sessionCode);
  const session = sessions.get(normalizedCode);

  if (!session) {
    throw new StoreError(
      "SESSION_NOT_FOUND",
      "Session code does not exist",
      404
    );
  }

  return session;
}

function sanitizeDurationMinutes(durationMinutes) {
  const parsedDuration = Number(durationMinutes) || DEFAULT_DURATION_MINUTES;

  if (parsedDuration <= 0) {
    throw new StoreError(
      "INVALID_DURATION",
      "Session duration must be greater than zero"
    );
  }

  return parsedDuration;
}

function getElapsedSeconds(startedAt) {
  if (!startedAt) {
    return 0;
  }

  return Math.floor((Date.now() - startedAt) / 1000);
}

// El temporizador guarda segundos restantes para soportar pausa y reanudacion.
function getTimeRemaining(session) {
  if (session.status === "ended") {
    return 0;
  }

  if (session.status !== "active") {
    return session.remaining_seconds;
  }

  return Math.max(
    0,
    session.remaining_seconds - getElapsedSeconds(session.started_at)
  );
}

function requireFiniteNumber(value, fieldName) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw new StoreError("INVALID_NUMERIC_FIELD", `${fieldName} must be a number`);
  }

  return parsedValue;
}

// Convierte registros basados en Map a JSON simple antes de responder.
function serializeStudent(student) {
  return {
    student_id: student.student_id,
    device_id: student.device_id,
    nickname: student.nickname,
    status: student.status,
    connected: student.connected,
    joined_at: student.joined_at,
    last_active_at: student.last_active_at,
  };
}

function serializeSession(session) {
  return {
    session_code: session.session_code,
    status: session.status,
    created_at: session.created_at,
    duration_seconds: session.duration_seconds,
    started_at: session.started_at,
    paused_at: session.paused_at,
    ended_at: session.ended_at,
    time_remaining: getTimeRemaining(session),
    students: Array.from(session.students.values()).map(serializeStudent),
    strokes: [...session.strokes],
    sensor_events: [...session.sensor_events],
  };
}

function createSession({ durationMinutes } = {}) {
  const safeDurationMinutes = sanitizeDurationMinutes(durationMinutes);
  const sessionCode = generateUniqueSessionCode();
  const durationSeconds = safeDurationMinutes * 60;

  const session = {
    session_code: sessionCode,
    status: "waiting",
    created_at: Date.now(),
    duration_seconds: durationSeconds,
    remaining_seconds: durationSeconds,
    started_at: null,
    paused_at: null,
    ended_at: null,
    students: new Map(),
    strokes: [],
    sensor_events: [],
  };

  sessions.set(sessionCode, session);

  return serializeSession(session);
}

function findSession(sessionCode) {
  const normalizedCode = normalizeSessionCode(sessionCode);
  const session = sessions.get(normalizedCode);

  return session ? serializeSession(session) : null;
}

function joinSession({ sessionCode, deviceId, nickname }) {
  const session = getSessionOrThrow(sessionCode);
  const normalizedDeviceId = normalizeDeviceId(deviceId);

  if (!normalizedDeviceId) {
    throw new StoreError("DEVICE_ID_REQUIRED", "device_id is required");
  }

  const existingStudent = session.students.get(normalizedDeviceId);
  const now = Date.now();
  const student = {
    student_id: normalizedDeviceId,
    device_id: normalizedDeviceId,
    nickname: String(nickname || "Estudiante").trim() || "Estudiante",
    status: existingStudent?.status || "idle",
    connected: true,
    joined_at: existingStudent?.joined_at || now,
    last_active_at: now,
  };

  session.students.set(normalizedDeviceId, student);

  return {
    student_id: student.student_id,
    session_code: session.session_code,
    status: "joined",
    session_status: session.status,
  };
}

function updateSessionStatus({ sessionCode, action }) {
  const session = getSessionOrThrow(sessionCode);
  const normalizedAction = String(action || "").trim().toLowerCase();

  if (!["start", "pause", "end"].includes(normalizedAction)) {
    throw new StoreError(
      "INVALID_SESSION_ACTION",
      "Action must be start, pause or end"
    );
  }

  if (normalizedAction === "start") {
    session.status = "active";
    session.started_at = Date.now();
    session.paused_at = null;
  }

  if (normalizedAction === "pause") {
    // Congela el contador para que el siguiente start continue desde aqui.
    session.remaining_seconds = getTimeRemaining(session);
    session.status = "paused";
    session.paused_at = Date.now();
    session.started_at = null;
  }

  if (normalizedAction === "end") {
    session.remaining_seconds = 0;
    session.status = "ended";
    session.ended_at = Date.now();
    session.started_at = null;
  }

  return serializeSession(session);
}

function getSessionMonitor(sessionCode) {
  const session = getSessionOrThrow(sessionCode);

  return {
    session_code: session.session_code,
    status: session.status,
    students: Array.from(session.students.values()).map(serializeStudent),
    time_remaining: getTimeRemaining(session),
  };
}

function addStroke(sessionCode, stroke) {
  const session = getSessionOrThrow(sessionCode);
  const safeStroke = stroke || {};
  const deviceId = normalizeDeviceId(safeStroke.device_id);
  const student = session.students.get(deviceId);

  if (!deviceId) {
    throw new StoreError("DEVICE_ID_REQUIRED", "device_id is required");
  }

  if (!student) {
    throw new StoreError("STUDENT_NOT_FOUND", "Student is not in the session", 404);
  }

  const storedStroke = {
    session_code: session.session_code,
    device_id: deviceId,
    x: requireFiniteNumber(safeStroke.x, "x"),
    y: requireFiniteNumber(safeStroke.y, "y"),
    prev_x:
      safeStroke.prev_x === undefined
        ? null
        : requireFiniteNumber(safeStroke.prev_x, "prev_x"),
    prev_y:
      safeStroke.prev_y === undefined
        ? null
        : requireFiniteNumber(safeStroke.prev_y, "prev_y"),
    color: safeStroke.color || "#000000",
    brush_type: safeStroke.brush_type || "medium",
    brush_size: Number(safeStroke.brush_size) || 4,
    tool: safeStroke.tool === "eraser" ? "eraser" : "brush",
    sequence: Number(safeStroke.sequence) || session.strokes.length + 1,
    created_at: Date.now(),
  };

  session.strokes.push(storedStroke);
  // Dibujar tambien actualiza el estado que vera el dashboard del profesor.
  markStudentStatus({
    sessionCode: session.session_code,
    deviceId,
    status: "drawing",
  });

  return storedStroke;
}

function addSensorEvent(sessionCode, sensorEvent) {
  const session = getSessionOrThrow(sessionCode);
  const safeSensorEvent = sensorEvent || {};
  const deviceId = normalizeDeviceId(safeSensorEvent.device_id);
  const student = session.students.get(deviceId);

  if (!deviceId) {
    throw new StoreError("DEVICE_ID_REQUIRED", "device_id is required");
  }

  if (!student) {
    throw new StoreError("STUDENT_NOT_FOUND", "Student is not in the session", 404);
  }

  const storedSensorEvent = {
    session_code: session.session_code,
    device_id: deviceId,
    tilt: safeSensorEvent.tilt || null,
    shake: Boolean(safeSensorEvent.shake),
    orientation: safeSensorEvent.orientation || null,
    created_at: Date.now(),
  };

  session.sensor_events.push(storedSensorEvent);

  return storedSensorEvent;
}

function markStudentStatus({ sessionCode, deviceId, status }) {
  const session = getSessionOrThrow(sessionCode);
  const normalizedDeviceId = normalizeDeviceId(deviceId);
  const student = session.students.get(normalizedDeviceId);

  if (!student) {
    throw new StoreError("STUDENT_NOT_FOUND", "Student is not in the session", 404);
  }

  student.status = status;
  student.last_active_at = Date.now();

  return serializeStudent(student);
}

function setStudentConnection({ sessionCode, deviceId, connected }) {
  const session = getSessionOrThrow(sessionCode);
  const normalizedDeviceId = normalizeDeviceId(deviceId);
  const student = session.students.get(normalizedDeviceId);

  if (!student) {
    throw new StoreError("STUDENT_NOT_FOUND", "Student is not in the session", 404);
  }

  student.connected = Boolean(connected);
  student.last_active_at = Date.now();

  return serializeStudent(student);
}

module.exports = {
  StoreError,
  addSensorEvent,
  addStroke,
  createSession,
  findSession,
  getSessionMonitor,
  joinSession,
  markStudentStatus,
  setStudentConnection,
  updateSessionStatus,
};
