export const socket = io("http://localhost:5050");

export function joinRoom(code) {
  socket.emit("join-room", code);
}
