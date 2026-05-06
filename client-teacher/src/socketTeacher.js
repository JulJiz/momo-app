export const socket = io(window.location.origin, {
  path: "/real-time",
});

export function joinRoom(code) {
  socket.emit("join-room", code);
}
