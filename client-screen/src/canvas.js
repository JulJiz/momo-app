const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = Math.max(1, Math.floor(rect.width * pixelRatio));
  canvas.height = Math.max(1, Math.floor(rect.height * pixelRatio));
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

function draw({ x, y, prev_x, prev_y, color, brush_size, tool }) {
  const rect = canvas.getBoundingClientRect();
  const currentX = Number(x) * rect.width;
  const currentY = Number(y) * rect.height;
  const previousX = prev_x === null ? null : Number(prev_x) * rect.width;
  const previousY = prev_y === null ? null : Number(prev_y) * rect.height;
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
    previousX !== undefined &&
    previousY !== undefined &&
    previousX !== null &&
    previousY !== null
  ) {
    ctx.beginPath();
    ctx.moveTo(previousX, previousY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(currentX, currentY, Math.max(1, size / 2), 0, Math.PI * 2);
    ctx.fill();
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function initCanvas(socket) {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  socket.on("canvas-broadcast", draw);
  socket.on("clear-canvas", clearCanvas);
}
