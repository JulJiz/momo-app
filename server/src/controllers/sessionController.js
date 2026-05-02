const {
  StoreError,
  createSession,
  getSessionMonitor,
  joinSession,
  updateSessionStatus,
} = require("../services/sessionStore");

let socketServer = null;

// Mantiene errores predecibles para Postman, estudiante y futuras interfaces.
function sendError(response, error) {
  if (error instanceof StoreError) {
    return response.status(error.statusCode).json({
      error: error.code,
      message: error.message,
    });
  }

  console.error(error);

  return response.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "Unexpected server error",
  });
}

function requireField(value, code, message) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new StoreError(code, message);
  }
}

function registerSessionControllerSocket(io) {
  socketServer = io;
}

function buildSessionState(session) {
  return {
    session_code: session.session_code,
    status: session.status,
    time_remaining: session.time_remaining,
  };
}

function emitSessionState(session) {
  if (!socketServer) {
    return;
  }

  const state = buildSessionState(session);

  // Se envia a estudiantes y a la pantalla futura para mantenerlos sincronizados.
  socketServer
    .to(`session:${session.session_code}`)
    .emit("session-state", state);
  socketServer
    .to(`session:${session.session_code}:screen`)
    .emit("session-state", state);
}

function createSessionHandler(request, response) {
  try {
    const session = createSession({
      durationMinutes: request.body?.duration_minutes,
    });

    return response.status(201).json({
      session_code: session.session_code,
      status: session.status,
      duration_seconds: session.duration_seconds,
    });
  } catch (error) {
    return sendError(response, error);
  }
}

function joinSessionHandler(request, response) {
  try {
    requireField(
      request.body?.session_code,
      "SESSION_CODE_REQUIRED",
      "session_code is required"
    );
    requireField(
      request.body?.device_id,
      "DEVICE_ID_REQUIRED",
      "device_id is required"
    );

    const result = joinSession({
      sessionCode: request.body.session_code,
      deviceId: request.body.device_id,
      nickname: request.body.nickname,
    });

    return response.status(200).json(result);
  } catch (error) {
    return sendError(response, error);
  }
}

function getSessionMonitorHandler(request, response) {
  try {
    requireField(
      request.query?.session_code,
      "SESSION_CODE_REQUIRED",
      "session_code query parameter is required"
    );

    // Esta respuesta sera el contrato que consultara el dashboard del profesor.
    const monitor = getSessionMonitor(request.query.session_code);

    return response.status(200).json(monitor);
  } catch (error) {
    return sendError(response, error);
  }
}

function controlSessionHandler(request, response) {
  try {
    requireField(
      request.body?.session_code,
      "SESSION_CODE_REQUIRED",
      "session_code is required"
    );
    requireField(request.body?.action, "ACTION_REQUIRED", "action is required");

    // Start, pause y end se exponen por REST para facilitar la demo.
    const session = updateSessionStatus({
      sessionCode: request.body.session_code,
      action: request.body.action,
    });

    emitSessionState(session);

    return response.status(200).json({
      session_code: session.session_code,
      status: session.status,
      time_remaining: session.time_remaining,
    });
  } catch (error) {
    return sendError(response, error);
  }
}

module.exports = {
  controlSessionHandler,
  createSessionHandler,
  getSessionMonitorHandler,
  joinSessionHandler,
  registerSessionControllerSocket,
};
