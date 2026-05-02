import { getStudents } from "./api.js";

let intervalId = null;
const studentsContainer = document.getElementById("students");
const countElement = document.getElementById("students-count");
const statusElement = document.getElementById("session-status");
const timeElement = document.getElementById("time-remaining");

function formatTime(seconds) {
  const total = Number(seconds) || 0;
  const minutes = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const secondsLeft = Math.floor(total % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${secondsLeft}`;
}

function renderStudents(students) {
  studentsContainer.innerHTML = "";

  if (!Array.isArray(students) || students.length === 0) {
    countElement.innerText = "0";
    studentsContainer.innerHTML =
      '<p class="empty-state">Aún no hay estudiantes conectados.</p>';
    return;
  }

  countElement.innerText = String(students.length);

  students.forEach((student) => {
    const badge = document.createElement("div");
    badge.className = "student-badge";
    badge.innerHTML = `
      <span class="student-name">${student.nickname || student.device_id || student.id}</span>
      <span class="student-status ${student.status}">${student.status}</span>
    `;
    studentsContainer.appendChild(badge);
  });
}

function updateMonitor(data) {
  if (!data) {
    return;
  }

  statusElement.innerText = data.status || "waiting";
  timeElement.innerText = formatTime(data.time_remaining);
  renderStudents(data.students);
}

async function refreshMonitor(sessionCode) {
  try {
    const data = await getStudents(sessionCode);
    updateMonitor(data);
  } catch (error) {
    console.error("Error al obtener el estado de la sesión:", error);
  }
}

export function startMonitoring(sessionCode) {
  if (!sessionCode) {
    return;
  }

  if (intervalId) {
    clearInterval(intervalId);
  }

  refreshMonitor(sessionCode);
  intervalId = setInterval(() => refreshMonitor(sessionCode), 3000);
}
