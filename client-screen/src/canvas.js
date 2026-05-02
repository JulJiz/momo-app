const canvas = document.getElementById("canvas");
if (!canvas) {
  throw new Error("Canvas element not found.");
}

const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 140;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function draw(stroke) {
  if (!stroke || typeof stroke.x !== "number" || typeof stroke.y !== "number") {
    return;
  }

  const x = stroke.x;
  const y = stroke.y;
  const prevX = typeof stroke.prev_x === "number" ? stroke.prev_x : x;
  const prevY = typeof stroke.prev_y === "number" ? stroke.prev_y : y;
  const color = stroke.color || "#2c5282";
  const size = stroke.size || 12;

  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(x, y);
  ctx.stroke();

  if (prevX === x && prevY === y) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

const attachSocket = setInterval(() => {
  const socket = window.socket;
  if (socket && socket.on) {
    socket.on("canvas-broadcast", draw);
    clearInterval(attachSocket);
  }
}, 50);
