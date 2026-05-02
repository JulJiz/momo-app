(function () {
  let socket = null;

  function connectStudentSocket({
    serverUrl,
    sessionCode,
    deviceId,
    onSessionState,
    onFeedback,
    onError,
  }) {
    if (socket) {
      socket.disconnect();
    }

    socket = window.io(serverUrl, {
      path: "/real-time",
    });

    socket.on("connect", () => {
      socket.emit("join-session", {
        session_code: sessionCode,
        device_id: deviceId,
        role: "student",
      });
    });

    socket.on("session-state", (state) => {
      onSessionState(state);
    });

    socket.on("feedback", (feedback) => {
      onFeedback(feedback);
    });

    socket.on("socket-error", (error) => {
      onError(error.message || "Error de conexion en tiempo real.");
    });

    socket.on("connect_error", () => {
      onError("No se pudo conectar el tiempo real.");
    });

    return socket;
  }

  function disconnectStudentSocket() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  window.MomoSocket = {
    connectStudentSocket,
    disconnectStudentSocket,
  };
})();
