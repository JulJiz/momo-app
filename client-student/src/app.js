const SERVER_URL = "http://localhost:5050";

const joinForm = document.getElementById("join-form");
const sessionCodeInput = document.getElementById("session-code");
const nicknameInput = document.getElementById("nickname");
const statusMessage = document.getElementById("status-message");
const joinView = document.querySelector('[data-view="join"]');
const waitingView = document.getElementById("waiting-view");
const waitingCode = document.getElementById("waiting-code");
const waitingName = document.getElementById("waiting-name");
const waitingStatus = document.getElementById("waiting-status");
const changeSessionButton = document.getElementById("change-session-button");

const appState = {
  sessionCode: null,
  deviceId: null,
  nickname: null,
  sessionStatus: null,
};

function setStatus(message) {
  statusMessage.textContent = message;
}

function normalizeSessionCode(value) {
  return value.trim().toUpperCase();
}

function setJoinLoading(isLoading) {
  const submitButton = joinForm.querySelector('button[type="submit"]');
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Uniendo..." : "Unirme";
}

function showJoinView() {
  waitingView.hidden = true;
  joinView.hidden = false;
}

function showWaitingRoom() {
  joinView.hidden = true;
  waitingView.hidden = false;
  waitingCode.textContent = appState.sessionCode;
  waitingName.textContent = appState.nickname;
  waitingStatus.textContent = appState.sessionStatus;
}

function saveClientState(joinResult) {
  appState.sessionCode = joinResult.session_code;
  appState.deviceId = joinResult.device_id;
  appState.nickname = joinResult.nickname;
  appState.sessionStatus = joinResult.session_status;
}

function getJoinErrorMessage(error) {
  if (error.code === "SESSION_NOT_FOUND") {
    return "Codigo de sesion no encontrado.";
  }

  if (error.name === "TypeError") {
    return "No se pudo conectar con el servidor.";
  }

  return error.message || "No se pudo unir a la sesion.";
}

joinForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const sessionCode = normalizeSessionCode(sessionCodeInput.value);
  const nickname = nicknameInput.value.trim() || "Estudiante";

  if (!sessionCode) {
    setStatus("Ingresa un codigo de sesion.");
    return;
  }

  try {
    setJoinLoading(true);
    setStatus("Conectando con la sesion...");

    const joinResult = await window.MomoApi.joinSession({
      serverUrl: SERVER_URL,
      sessionCode,
      nickname,
    });

    saveClientState(joinResult);

    if (appState.sessionStatus === "waiting") {
      showWaitingRoom();
      return;
    }

    setStatus(`Sesion ${appState.sessionStatus}. Preparando actividad.`);
  } catch (error) {
    setStatus(getJoinErrorMessage(error));
  } finally {
    setJoinLoading(false);
  }
});

changeSessionButton.addEventListener("click", () => {
  showJoinView();
  setStatus("Puedes ingresar otro codigo de sesion.");
});
