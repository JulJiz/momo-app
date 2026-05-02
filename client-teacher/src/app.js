import { createSession, controlSession } from "./api.js";
import { startMonitoring } from "./dashboard.js";

let sessionCode = localStorage.getItem("code") || "";
const codeElement = document.getElementById("session-code");
const copyButton = document.getElementById("copy-btn");
const createButton = document.getElementById("create");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const endButton = document.getElementById("end");

function setSessionCode(code) {
  sessionCode = code;
  localStorage.setItem("code", code);
  codeElement.innerText = code;
  startMonitoring(code);
  updateButtons();
}

function updateButtons() {
  const hasCode = Boolean(sessionCode);
  copyButton.disabled = !hasCode;
  startButton.disabled = !hasCode;
  pauseButton.disabled = !hasCode;
  endButton.disabled = !hasCode;
}

async function handleCreate() {
  createButton.disabled = true;
  try {
    const data = await createSession();
    if (data?.session_code) {
      setSessionCode(data.session_code);
    }
  } catch (error) {
    console.error(error);
  } finally {
    createButton.disabled = false;
  }
}

async function handleControl(action) {
  if (!sessionCode) {
    return;
  }

  try {
    await controlSession(sessionCode, action);
  } catch (error) {
    console.error(error);
  }
}

function copyCode() {
  if (!sessionCode) {
    return;
  }

  navigator.clipboard.writeText(sessionCode).catch(() => {
    console.warn("No se pudo copiar el código de sesión.");
  });
}

window.addEventListener("DOMContentLoaded", () => {
  copyButton.addEventListener("click", copyCode);
  createButton.addEventListener("click", handleCreate);
  startButton.addEventListener("click", () => handleControl("start"));
  pauseButton.addEventListener("click", () => handleControl("pause"));
  endButton.addEventListener("click", () => handleControl("end"));

  if (sessionCode) {
    codeElement.innerText = sessionCode;
    startMonitoring(sessionCode);
  }

  updateButtons();
});
