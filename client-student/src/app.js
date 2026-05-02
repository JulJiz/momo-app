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
const activityView = document.getElementById("activity-view");
const activityState = document.getElementById("activity-state");
const activityTitle = document.getElementById("activity-title");
const activityDescription = document.getElementById("activity-description");
const drawingCanvas = document.getElementById("drawing-canvas");
const feedbackMessage = document.getElementById("feedback-message");

const appState = {
  sessionCode: null,
  deviceId: null,
  nickname: null,
  sessionStatus: null,
  socket: null,
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
  activityView.hidden = true;
  waitingView.hidden = true;
  joinView.hidden = false;
}

function showWaitingRoom() {
  activityView.hidden = true;
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

function showActivityView({ title, description, canDraw }) {
  joinView.hidden = true;
  waitingView.hidden = true;
  activityView.hidden = false;
  activityState.textContent = appState.sessionStatus;
  activityTitle.textContent = title;
  activityDescription.textContent = description;
  window.MomoCanvas.setEnabled(canDraw);
}

function setRealtimeMessage(message) {
  feedbackMessage.textContent = message;
  setStatus(message);
}

function renderSessionState(state) {
  appState.sessionStatus = state.status;

  if (state.status === "waiting") {
    window.MomoCanvas.setEnabled(false);
    showWaitingRoom();
    return;
  }

  if (state.status === "active") {
    showActivityView({
      title: "Actividad activa",
      description: "Ya puedes dibujar localmente en tu dispositivo.",
      canDraw: true,
    });
    return;
  }

  if (state.status === "paused") {
    showActivityView({
      title: "Actividad pausada",
      description: "Espera a que el profesor reactive la sesion.",
      canDraw: false,
    });
    return;
  }

  if (state.status === "ended") {
    showActivityView({
      title: "Actividad finalizada",
      description: "Gracias por participar con MOMO.",
      canDraw: false,
    });
  }
}

function connectRealtime() {
  appState.socket = window.MomoSocket.connectStudentSocket({
    serverUrl: SERVER_URL,
    sessionCode: appState.sessionCode,
    deviceId: appState.deviceId,
    onSessionState: renderSessionState,
    onFeedback: (feedback) => {
      setRealtimeMessage(feedback.message || "Mensaje recibido.");
    },
    onError: (message) => {
      setRealtimeMessage(message);
    },
  });
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
    connectRealtime();
    renderSessionState({
      session_code: appState.sessionCode,
      status: appState.sessionStatus,
    });
  } catch (error) {
    setStatus(getJoinErrorMessage(error));
  } finally {
    setJoinLoading(false);
  }
});

changeSessionButton.addEventListener("click", () => {
  window.MomoSocket.disconnectStudentSocket();
  window.MomoCanvas.setEnabled(false);
  showJoinView();
  setStatus("Puedes ingresar otro codigo de sesion.");
});

window.MomoCanvas.init(drawingCanvas);
window.MomoCanvas.setEnabled(false);
