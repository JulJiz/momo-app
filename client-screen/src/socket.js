export function joinRoom(sessionCode) {
  const socket = window.io("http://localhost:5050", {
    path: "/real-time",
  });

  socket.on("connect", () => {
    socket.emit("join-session", {
      session_code: sessionCode,
      role: "screen",
    });
  });

  socket.on("socket-error", (error) => {
    console.warn("Socket error:", error?.message || error);
  });

  socket.on("connect_error", () => {
    console.warn("Realtime connection failed.");
  });

  window.socket = socket;
  return socket;
}
