(function () {
  let socket = null;

  function connectStudentSocket({
    serverUrl,
    sessionCode,
    deviceId,
    onSessionState,
    onFeedback,
    onCanvasBroadcast,
    onError,
  }) {
    if (socket) {
      socket.disconnect();
    }

    socket = window.io(serverUrl, {
      path: "/real-time",
    });

    socket.on("connect", () => {
      // El join por socket mete al estudiante en el room de su sesion.
      socket.emit("join-session", {
        session_code: sessionCode,
        device_id: deviceId,
        role: "student",
      });
    });

    socket.on("session-state", (state) => {
      // El backend controla waiting, active, paused y ended.
      onSessionState(state);
    });

    socket.on("feedback", (feedback) => {
      onFeedback(feedback);
    });

    socket.on("canvas-broadcast", (stroke) => {
      if (onCanvasBroadcast) {
        onCanvasBroadcast(stroke);
      }
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

  function emitDrawSegment(payload) {
    // Evita errores si el estudiante dibuja antes de que el socket conecte.
    if (!socket || !socket.connected) {
      return false;
    }

    socket.emit("draw", payload);
    return true;
  }

  function emitSensorEvent(payload) {
    // Los sensores pueden disparar muchos eventos; app.js ya aplica throttle.
    if (!socket || !socket.connected) {
      return false;
    }

    socket.emit("sensor", payload);
    return true;
  }

  window.MomoSocket = {
    connectStudentSocket,
    disconnectStudentSocket,
    emitDrawSegment,
    emitSensorEvent,
  };
})();
