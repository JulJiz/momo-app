export const socket = io("http://localhost:3000");

export function joinRoom(code) {
  socket.emit("join-room", code);
}