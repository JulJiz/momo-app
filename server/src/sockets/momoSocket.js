const {
  StoreError,
  findSession,
  getSessionMonitor,
  setStudentConnection,
} = require("../services/sessionStore");

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

function registerMomoSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-session", (payload = {}) => {
      try {
        const sessionCode = String(payload.session_code || "")
          .trim()
          .toUpperCase();
        const role = payload.role === "screen" ? "screen" : "student";
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
          const deviceId = String(payload.device_id || "").trim();

          if (!deviceId) {
            throw new StoreError("DEVICE_ID_REQUIRED", "device_id is required");
          }

          socket.data.deviceId = deviceId;
          socket.join(buildSessionRoom(sessionCode));
          setStudentConnection({ sessionCode, deviceId, connected: true });
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

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = {
  buildScreenRoom,
  buildSessionRoom,
  registerMomoSocket,
};
