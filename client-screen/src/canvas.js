const canvasGrid = document.getElementById("canvas-grid");
const studentCanvases = new Map();
const borderColors = [
  "#facc15",
  "#86efac",
  "#fda4af",
  "#93c5fd",
  "#e9d5ff",
  "#fed7aa",
  "#bbf7d0",
  "#f9a8d4",
  "#99f6e4",
];

function getColorForIndex(index) {
  return borderColors[index % borderColors.length];
}

function resizeCanvas(canvas) {
  const context = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.floor(rect.width * pixelRatio));
  const height = Math.max(1, Math.floor(rect.height * pixelRatio));

  if (canvas.width === width && canvas.height === height) {
    return;
  }

  canvas.width = width;
  canvas.height = height;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.lineCap = "round";
  context.lineJoin = "round";
}

function createStudentCanvas(student, index) {
  const deviceId = student.device_id;
  const tile = document.createElement("article");
  const canvas = document.createElement("canvas");
  const name = document.createElement("span");

  tile.className = "student-canvas-tile";
  tile.style.setProperty("--tile-color", getColorForIndex(index));
  canvas.className = "student-canvas";
  name.className = "student-canvas-name";
  name.textContent = student.nickname || deviceId || "Estudiante";

  tile.appendChild(canvas);
  tile.appendChild(name);
  canvasGrid.appendChild(tile);
  resizeCanvas(canvas);

  return {
    canvas,
    context: canvas.getContext("2d"),
    tile,
    name,
  };
}

function syncStudents(students = []) {
  const activeDeviceIds = new Set();

  students.forEach((student, index) => {
    const deviceId = student.device_id;

    if (!deviceId) {
      return;
    }

    activeDeviceIds.add(deviceId);

    if (!studentCanvases.has(deviceId)) {
      studentCanvases.set(deviceId, createStudentCanvas(student, index));
    } else {
      const entry = studentCanvases.get(deviceId);
      entry.name.textContent = student.nickname || deviceId || "Estudiante";
      entry.tile.style.setProperty("--tile-color", getColorForIndex(index));
      resizeCanvas(entry.canvas);
    }
  });

  studentCanvases.forEach((entry, deviceId) => {
    if (!activeDeviceIds.has(deviceId)) {
      entry.tile.remove();
      studentCanvases.delete(deviceId);
    }
  });
}

function drawStroke(stroke) {
  const entry = studentCanvases.get(stroke.device_id);

  if (!entry) {
    return;
  }

  resizeCanvas(entry.canvas);

  const rect = entry.canvas.getBoundingClientRect();
  const currentX = Number(stroke.x) * rect.width;
  const currentY = Number(stroke.y) * rect.height;
  const previousX =
    stroke.prev_x === null || stroke.prev_x === undefined
      ? null
      : Number(stroke.prev_x) * rect.width;
  const previousY =
    stroke.prev_y === null || stroke.prev_y === undefined
      ? null
      : Number(stroke.prev_y) * rect.height;
  const size = Number(stroke.brush_size) || 4;
  const paintColor = stroke.tool === "eraser" ? "#fffdf8" : stroke.color;

  entry.context.strokeStyle = paintColor || "#000000";
  entry.context.fillStyle = paintColor || "#000000";
  entry.context.lineWidth = size;
  entry.context.lineCap = "round";
  entry.context.lineJoin = "round";

  if (previousX !== null && previousY !== null) {
    entry.context.beginPath();
    entry.context.moveTo(previousX, previousY);
    entry.context.lineTo(currentX, currentY);
    entry.context.stroke();
    return;
  }

  entry.context.beginPath();
  entry.context.arc(currentX, currentY, Math.max(1, size / 2), 0, Math.PI * 2);
  entry.context.fill();
}

function clearAllCanvases() {
  studentCanvases.forEach((entry) => {
    entry.context.clearRect(0, 0, entry.canvas.width, entry.canvas.height);
  });
}

export function initCanvas(socket) {
  socket.on("canvas-broadcast", drawStroke);
  socket.on("clear-canvas", clearAllCanvases);

  window.addEventListener("resize", () => {
    studentCanvases.forEach((entry) => resizeCanvas(entry.canvas));
  });
}

export function renderStudents(students = []) {
  syncStudents(students);
}
