import { createSession, controlSession, sendSessionMessage } from "./api.js";
import { startMonitoring } from "./dashboard.js";

const codeView = document.getElementById("code-view");
const waitingView = document.getElementById("waiting-view");
const controlView = document.getElementById("control-view");
const sessionCodeElement = document.getElementById("session-code");
const waitingCodeElement = document.getElementById("waiting-code");
const waitingCountElement = document.getElementById("waiting-count");
const waitingStudents = document.getElementById("waiting-students");
const studentsCountElement = document.getElementById("students-count");
const studentsListElement = document.getElementById("students");
const canvasPreviewGrid = document.getElementById("canvas-preview-grid");
const timerProgress = document.getElementById("timer-progress");
const timeRemainingElement = document.getElementById("time-remaining");
const copyButton = document.getElementById("copy-btn");
const refreshButton = document.getElementById("refresh-btn");
const nextButton = document.getElementById("next-btn");
const startButton = document.getElementById("start-btn");
const endButton = document.getElementById("end-btn");
const addMinuteButton = document.getElementById("add-minute-btn");
const sendButton = document.getElementById("send-btn");
const messageInput = document.getElementById("message-input");
const codeBackButton = document.getElementById("code-back");
const waitingBackButton = document.getElementById("waiting-back");
const controlBackButton = document.getElementById("control-back");

let sessionCode = localStorage.getItem("code") || "";
let sessionDurationSeconds = 600;
let extraSeconds = 0;
let currentStatus = "waiting";
let monitorInterval = null;

function showView(view) {
  codeView.classList.toggle("hidden", view !== "code");
  waitingView.classList.toggle("hidden", view !== "waiting");
  controlView.classList.toggle("hidden", view !== "control");
}

function setSessionCode(code, durationSeconds = 600) {
  sessionCode = code;
  sessionDurationSeconds = durationSeconds;
  localStorage.setItem("code", code);

  if (sessionCodeElement) {
    sessionCodeElement.innerText = code;
  }

  if (waitingCodeElement) {
    waitingCodeElement.innerText = code;
  }
}

function renderStudentChips(students = []) {
  if (!waitingStudents) {
    return;
  }

  waitingStudents.innerHTML = "";

  if (!students.length) {
    waitingStudents.innerHTML =
      '<span class="student-chip">No students yet</span>';
    return;
  }

  students.forEach((student) => {
    const chip = document.createElement("span");
    chip.className = "student-chip";
    chip.textContent = student.nickname || student.device_id || "Alumno";
    waitingStudents.appendChild(chip);
  });
}

function renderStudentsList(students = []) {
  if (!studentsListElement) {
    return;
  }

  studentsListElement.innerHTML = "";

  if (!students.length) {
    studentsListElement.innerHTML =
      '<p class="empty-state">Aun no hay estudiantes conectados.</p>';
    return;
  }

  students.forEach((student) => {
    const badge = document.createElement("div");
    badge.className = "student-badge";
    badge.innerHTML = `
      <span class="student-name">${student.nickname || student.device_id || "Estudiante"}</span>
      <span class="student-status ${student.status}">${student.status}</span>
    `;
    studentsListElement.appendChild(badge);
  });
}

function renderCanvasPreview(students = []) {
  if (!canvasPreviewGrid) {
    return;
  }

  canvasPreviewGrid.innerHTML = "";

  const previewItems = Array.from({ length: 9 }, (_, index) => students[index]);

  previewItems.forEach((student) => {
    const cell = document.createElement("div");
    cell.className = "preview-cell";

    if (student) {
      cell.innerHTML = `
        <span class="preview-dot"></span>
        <strong>${student.nickname || student.device_id || "Estudiante"}</strong>
      `;
    } else {
      cell.innerHTML = `<span class="preview-dot"></span>`;
    }

    canvasPreviewGrid.appendChild(cell);
  });
}

function updateTimer(seconds) {
  const totalSeconds = Number(sessionDurationSeconds) || 600;
  const currentSeconds = Math.max(0, Number(seconds) + extraSeconds);
  const percentage = totalSeconds
    ? Math.min((currentSeconds / totalSeconds) * 100, 100)
    : 0;

  if (timeRemainingElement) {
    timeRemainingElement.textContent = formatTime(currentSeconds);
  }

  if (timerProgress) {
    timerProgress.style.width = `${percentage}%`;
  }
}

function formatTime(seconds) {
  const total = Number(seconds) || 0;
  const minutes = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const remaining = Math.floor(total % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function updateMonitor(data) {
  if (!data) {
    return;
  }

  currentStatus = data.status || "waiting";
  const students = Array.isArray(data.students) ? data.students : [];
  const count = students.length;

  if (waitingCountElement) {
    waitingCountElement.textContent = String(count);
  }

  if (studentsCountElement) {
    studentsCountElement.textContent = String(count);
  }

  renderStudentChips(students);
  renderStudentsList(students);
  renderCanvasPreview(students);
  updateTimer(data.time_remaining);

  if (currentStatus === "active") {
    showView("control");
  }
}

async function startMonitoringSession(code) {
  if (monitorInterval) {
    clearInterval(monitorInterval);
  }

  await startMonitoring(code, updateMonitor);
}

async function loadSession() {
  if (!sessionCode) {
    const data = await createSession();
    setSessionCode(data.session_code, data.duration_seconds);
    startMonitoringSession(data.session_code);
    return;
  }

  setSessionCode(sessionCode, sessionDurationSeconds);
  startMonitoringSession(sessionCode);
}

async function refreshSession() {
  refreshButton.disabled = true;
  try {
    const data = await createSession();
    setSessionCode(data.session_code, data.duration_seconds);
    startMonitoringSession(data.session_code);
  } catch (error) {
    console.error(error);
  } finally {
    refreshButton.disabled = false;
  }
}

async function handleControl(action) {
  if (!sessionCode) {
    return;
  }

  try {
    await controlSession(sessionCode, action);
    if (action === "start") {
      showView("control");
    }
  } catch (error) {
    console.error(error);
  }
}

function copyCode() {
  if (!sessionCode) {
    return;
  }

  navigator.clipboard.writeText(sessionCode).catch(() => {
    console.warn("No se pudo copiar el codigo de sesion.");
  });
}

async function handleSendMessage() {
  const message = messageInput.value.trim();

  if (!sessionCode || !message) {
    return;
  }

  sendButton.disabled = true;
  try {
    await sendSessionMessage(sessionCode, message);
    messageInput.value = "";
  } catch (error) {
    console.error(error);
  } finally {
    sendButton.disabled = false;
  }
}

function resetView() {
  showView("code");
}

window.addEventListener("DOMContentLoaded", () => {
  showView("code");
  loadSession();

  copyButton.addEventListener("click", copyCode);
  refreshButton.addEventListener("click", refreshSession);
  nextButton.addEventListener("click", () => showView("control"));
  startButton.addEventListener("click", () => handleControl("start"));
  endButton.addEventListener("click", () => handleControl("end"));
  addMinuteButton.addEventListener("click", () => {
    extraSeconds += 60;
    updateTimer(
      parseInt(timeRemainingElement.textContent.split(":")[0], 10) * 60 +
        parseInt(timeRemainingElement.textContent.split(":")[1], 10) +
        60,
    );
  });
  sendButton.addEventListener("click", handleSendMessage);
  messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  });
  codeBackButton.addEventListener("click", resetView);
  waitingBackButton.addEventListener("click", resetView);
  controlBackButton.addEventListener("click", resetView);
});
