const {
  StoreError,
  addSensorEvent,
  addStroke,
  findSession,
  getSessionSnapshot,
  getSessionMonitor,
  setStudentConnection,
} = require("../services/sessionStore");
const {
  buildSensorFeedback,
  buildStrokeFeedback,
} = require("../services/assistantService");
const persistence = require("../services/supabasePersistence");

function buildSessionRoom(sessionCode) {
  return `session:${sessionCode}`;
}

function buildScreenRoom(sessionCode) {
  return `session:${sessionCode}:screen`;
}

function emitSocketError(socket, error) {
  const statusCode = error instanceof StoreError ? error.statusCode : 400;
  const code = error instanceof StoreError ? error.code : "SOCKET_ERROR";
  const message =
    error instanceof StoreError ? error.message : "Socket event failed";

  socket.emit("socket-error", {
    error: code,
    message,
    status_code: statusCode,
  });
}

function buildSessionState(session) {
  return {
    session_code: session.session_code,
    status: session.status,
    time_remaining: session.time_remaining,
  };
}

function getSocketPayload(payload) {
  return payload && typeof payload === "object" ? payload : {};
}

function readStudentContext(socket, payload) {
  const safePayload = getSocketPayload(payload);
  const sessionCode = String(
    safePayload.session_code || socket.data.sessionCode || ""
  )
    .trim()
    .toUpperCase();
  const deviceId = String(
    safePayload.device_id || socket.data.deviceId || ""
  ).trim();

  if (!sessionCode) {
    throw new StoreError("SESSION_CODE_REQUIRED", "session_code is required");
  }

  if (!deviceId) {
    throw new StoreError("DEVICE_ID_REQUIRED", "device_id is required");
  }

  return { sessionCode, deviceId };
}

function registerMomoSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-session", async (payload = {}) => {
      try {
        const safePayload = getSocketPayload(payload);
        const sessionCode = String(safePayload.session_code || "")
          .trim()
          .toUpperCase();
        const role = safePayload.role === "screen" ? "screen" : "student";

        if (!sessionCode) {
          throw new StoreError(
            "SESSION_CODE_REQUIRED",
            "session_code is required"
          );
        }

        const session = findSession(sessionCode);

        if (!session) {
          throw new StoreError(
            "SESSION_NOT_FOUND",
            "Session code does not exist",
            404
          );
        }

        socket.data.sessionCode = sessionCode;
        socket.data.role = role;

        if (role === "screen") {
          socket.join(buildScreenRoom(sessionCode));
        } else {
          const deviceId = String(safePayload.device_id || "").trim();

          if (!deviceId) {
            throw new StoreError("DEVICE_ID_REQUIRED", "device_id is required");
          }

          socket.data.deviceId = deviceId;
          socket.join(buildSessionRoom(sessionCode));
          setStudentConnection({ sessionCode, deviceId, connected: true });
          await persistence.saveSession(getSessionSnapshot(sessionCode));
        }

        // El estado inicial permite que el cliente muestre waiting/active.
        socket.emit(
          "session-state",
          buildSessionState(getSessionMonitor(sessionCode))
        );
      } catch (error) {
        emitSocketError(socket, error);
      }
    });

    socket.on("draw", async (payload = {}) => {
      try {
        const safePayload = getSocketPayload(payload);
        const { sessionCode, deviceId } = readStudentContext(
          socket,
          safePayload
        );
        const storedStroke = addStroke(sessionCode, {
          ...safePayload,
          device_id: deviceId,
        });
        const feedback = buildStrokeFeedback(storedStroke);

        await persistence.saveStroke(storedStroke);
        await persistence.saveSession(getSessionSnapshot(sessionCode));
        await persistence.saveAiFeedback(feedback);

        // Se emite tambien al room de estudiantes para probarlo sin proyector.
        io.to(buildSessionRoom(sessionCode)).emit(
          "canvas-broadcast",
          storedStroke
        );
        io.to(buildScreenRoom(sessionCode)).emit(
          "canvas-broadcast",
          storedStroke
        );

        if (feedback) {
          socket.emit("feedback", {
            points: feedback.points,
            message: feedback.message,
          });
        }
      } catch (error) {
        emitSocketError(socket, error);
      }
    });

    socket.on("sensor", async (payload = {}) => {
      try {
        const safePayload = getSocketPayload(payload);
        const { sessionCode, deviceId } = readStudentContext(
          socket,
          safePayload
        );
        const sensorEvent = addSensorEvent(sessionCode, {
          ...safePayload,
          device_id: deviceId,
        });
        const feedback = buildSensorFeedback(sensorEvent);

        await persistence.saveSensorEvent(sensorEvent);
        await persistence.saveAiFeedback(feedback);

        if (feedback) {
          socket.emit("feedback", {
            points: feedback.points,
            message: feedback.message,
          });
        }
      } catch (error) {
        emitSocketError(socket, error);
      }
    });

    socket.on("disconnect", async () => {
      if (socket.data.role === "student" && socket.data.deviceId) {
        try {
          setStudentConnection({
            sessionCode: socket.data.sessionCode,
            deviceId: socket.data.deviceId,
            connected: false,
          });
          await persistence.saveSession(
            getSessionSnapshot(socket.data.sessionCode)
          );
        } catch (error) {
          console.error(error);
        }
      }

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = {
  buildScreenRoom,
  buildSessionRoom,
  registerMomoSocket,
};
