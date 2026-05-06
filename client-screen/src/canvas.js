import { socket } from "./socket.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

socket.on("canvas-broadcast", (data) => {
  draw(data);
});

function draw({ x, y, prev_x, prev_y, color, brush_size, tool }) {
  const strokeColor = color || "#000000";
  const size = Number(brush_size) || 4;
  const isEraser = tool === "eraser";
  const paintColor = isEraser ? "#ffffff" : strokeColor;

  ctx.strokeStyle = paintColor;
  ctx.fillStyle = paintColor;
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (
    prev_x !== undefined &&
    prev_y !== undefined &&
    prev_x !== null &&
    prev_y !== null
  ) {
    ctx.beginPath();
    ctx.moveTo(prev_x, prev_y);
    ctx.lineTo(x, y);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1, size / 2), 0, Math.PI * 2);
    ctx.fill();
  }
}

// limpiar canvas
socket.on("clear-canvas", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
