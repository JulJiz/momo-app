const SERVER_URL = "http://localhost:5050";

const joinForm = document.getElementById("join-form");
const sessionCodeInput = document.getElementById("session-code");
const nicknameInput = document.getElementById("nickname");
const statusMessage = document.getElementById("status-message");

function setStatus(message) {
  statusMessage.textContent = message;
}

function normalizeSessionCode(value) {
  return value.trim().toUpperCase();
}

joinForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const sessionCode = normalizeSessionCode(sessionCodeInput.value);
  const nickname = nicknameInput.value.trim() || "Estudiante";

  if (!sessionCode) {
    setStatus("Ingresa un codigo de sesion.");
    return;
  }

  // La conexion real al API se implementa en el commit 3.2.
  setStatus(`Listo para unirse como ${nickname} a ${sessionCode}.`);
});
