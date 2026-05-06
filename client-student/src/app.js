const SERVER_URL =
  window.location.protocol === "file:" ? "http://localhost:5050" : window.location.origin;

const connectionStatus = document.getElementById("connection-status");
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
const colorButtons = document.querySelectorAll("[data-color]");
const brushButtons = document.querySelectorAll("[data-brush-type]");
const eraserButton = document.getElementById("eraser-button");
const sensorStatus = document.getElementById("sensor-status");
const sensorPermissionButton = document.getElementById(
  "sensor-permission-button"
);
const feedbackMessage = document.getElementById("feedback-message");
const STUDENT_STATE_KEY = "momo_student_state";

const appState = {
  sessionCode: null,
  deviceId: null,
  nickname: null,
  sessionStatus: null,
  socket: null,
};

// Estado local de herramientas; el canvas lo usa para dibujar y emitir trazos.
const drawingTool = {
  color: "#202124",
  brushType: "medium",
  brushSize: 4,
  tool: "brush",
};

let drawSequence = 0;

function setStatus(message) {
  statusMessage.textContent = message;
}

function setConnectionStatus(message, isOnline) {
  connectionStatus.textContent = message;
  connectionStatus.classList.toggle("is-online", isOnline);
  connectionStatus.classList.toggle("is-offline", !isOnline);
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
  drawSequence = 0;

  try {
    window.sessionStorage.setItem(
      STUDENT_STATE_KEY,
      JSON.stringify({
        sessionCode: appState.sessionCode,
        deviceId: appState.deviceId,
        nickname: appState.nickname,
        sessionStatus: appState.sessionStatus,
      })
    );
    window.history.replaceState(
      {},
      "",
      `/student/session/${encodeURIComponent(appState.deviceId)}`
    );
  } catch (error) {
    console.warn("No se pudo guardar el estado local del estudiante.");
  }
}

function restoreStudentState() {
  if (!window.location.pathname.startsWith("/student/session/")) {
    return false;
  }

  try {
    const savedState = JSON.parse(
      window.sessionStorage.getItem(STUDENT_STATE_KEY) || "null"
    );

    if (!savedState?.sessionCode || !savedState?.deviceId) {
      return false;
    }

    appState.sessionCode = savedState.sessionCode;
    appState.deviceId = savedState.deviceId;
    appState.nickname = savedState.nickname || "Estudiante";
    appState.sessionStatus = savedState.sessionStatus || "waiting";
    return true;
  } catch (error) {
    return false;
  }
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

function setSensorStatus({ message, needsPermission }) {
  sensorStatus.textContent = message;
  sensorPermissionButton.hidden = !needsPermission;
  sensorPermissionButton.disabled = !needsPermission;
}

function getCanvasTool() {
  if (drawingTool.tool === "eraser") {
    // En Entrega 1 el borrador viaja como color blanco y tool eraser.
    return {
      color: "#ffffff",
      brushType: drawingTool.brushType,
      brushSize: drawingTool.brushSize,
      tool: "eraser",
    };
  }

  return {
    color: drawingTool.color,
    brushType: drawingTool.brushType,
    brushSize: drawingTool.brushSize,
    tool: "brush",
  };
}

function syncDrawingToolbar() {
  colorButtons.forEach((button) => {
    button.classList.toggle(
      "is-selected",
      drawingTool.tool === "brush" && button.dataset.color === drawingTool.color
    );
  });

  brushButtons.forEach((button) => {
    button.classList.toggle(
      "is-selected",
      button.dataset.brushType === drawingTool.brushType
    );
  });

  eraserButton.classList.toggle("is-selected", drawingTool.tool === "eraser");
  window.MomoCanvas.setTool(getCanvasTool());
}

function setupDrawingToolbar() {
  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      drawingTool.color = button.dataset.color;
      drawingTool.tool = "brush";
      syncDrawingToolbar();
    });
  });

  brushButtons.forEach((button) => {
    button.addEventListener("click", () => {
      drawingTool.brushType = button.dataset.brushType;
      drawingTool.brushSize = Number(button.dataset.brushSize);
      syncDrawingToolbar();
    });
  });

  eraserButton.addEventListener("click", () => {
    // El borrador mantiene el grosor actual y pinta blanco sobre el canvas.
    drawingTool.tool = "eraser";
    syncDrawingToolbar();
  });
}

function emitCanvasSegment(segment) {
  // Solo se emiten trazos cuando la sesion esta activa y ya hay identidad.
  if (appState.sessionStatus !== "active") {
    return;
  }

  if (!appState.sessionCode || !appState.deviceId) {
    return;
  }

  const nextSequence = drawSequence + 1;
  const wasEmitted = window.MomoSocket.emitDrawSegment({
    session_code: appState.sessionCode,
    device_id: appState.deviceId,
    ...segment,
    sequence: nextSequence,
  });

  if (wasEmitted) {
    drawSequence = nextSequence;
  }
}

function emitSensorReading(reading) {
  // Sensores y dibujo comparten el mismo estado de sesion para no enviar ruido.
  if (appState.sessionStatus !== "active") {
    return;
  }

  if (!appState.sessionCode || !appState.deviceId) {
    return;
  }

  window.MomoSocket.emitSensorEvent({
    session_code: appState.sessionCode,
    device_id: appState.deviceId,
    tilt: reading.tilt,
    shake: reading.shake,
    orientation: reading.orientation,
  });
}

function renderSessionState(state) {
  appState.sessionStatus = state.status;

  // El servidor decide el estado; el cliente solo habilita o bloquea UI.
  if (state.status === "waiting") {
    window.MomoCanvas.setEnabled(false);
    window.MomoSensors.stop();
    showWaitingRoom();
    return;
  }

  if (state.status === "active") {
    showActivityView({
      title: "Actividad activa",
      description: "Ya puedes dibujar localmente en tu dispositivo.",
      canDraw: true,
    });
    window.MomoSensors.start();
    return;
  }

  if (state.status === "paused") {
    showActivityView({
      title: "Actividad pausada",
      description: "Espera a que el profesor reactive la sesion.",
      canDraw: false,
    });
    window.MomoSensors.stop();
    return;
  }

  if (state.status === "ended") {
    showActivityView({
      title: "Actividad finalizada",
      description: "Gracias por participar con MOMO.",
      canDraw: false,
    });
    window.MomoSensors.stop();
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
    onTeacherMessage: (message) => {
      setRealtimeMessage(message.message || "Mensaje del profesor.");
    },
    onCanvasBroadcast: (stroke) => {
      // Log temporal para validar que el backend reemite los trazos.
      console.log("canvas-broadcast recibido", stroke);
    },
    onError: (message) => {
      setConnectionStatus("Desconectado", false);
      setRealtimeMessage(message);
    },
    onConnect: () => {
      setConnectionStatus("Conectado", true);
      setStatus("Tiempo real conectado.");
    },
    onDisconnect: () => {
      setConnectionStatus("Desconectado", false);
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
    setConnectionStatus("Conectando...", false);

    const joinResult = await window.MomoApi.joinSession({
      serverUrl: SERVER_URL,
      sessionCode,
      nickname,
    });

    saveClientState(joinResult);
    // REST confirma la union; despues se abre el canal en tiempo real.
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
  window.MomoSensors.stop();
  window.sessionStorage.removeItem(STUDENT_STATE_KEY);
  window.history.replaceState({}, "", "/student");
  setConnectionStatus("Desconectado", false);
  showJoinView();
  setStatus("Puedes ingresar otro codigo de sesion.");
});

sensorPermissionButton.addEventListener("click", async () => {
  sensorPermissionButton.disabled = true;
  setSensorStatus({
    message: "Solicitando permiso de sensores...",
    needsPermission: false,
  });

  try {
    const hasPermission = await window.MomoSensors.requestPermission();

    if (hasPermission && appState.sessionStatus === "active") {
      window.MomoSensors.start();
    }
  } catch (error) {
    setSensorStatus({
      message: "No se pudo activar sensores.",
      needsPermission: true,
    });
  }
});

window.MomoCanvas.init(drawingCanvas);
window.MomoCanvas.setSegmentHandler(emitCanvasSegment);
// Los sensores son progresivos: si el navegador no soporta eventos, no bloquean.
window.MomoSensors.init({
  onReading: emitSensorReading,
  onStatusChange: setSensorStatus,
  throttleMs: 400,
});
setupDrawingToolbar();
syncDrawingToolbar();
window.MomoCanvas.setEnabled(false);
setConnectionStatus("Desconectado", false);

if (restoreStudentState()) {
  connectRealtime();
  renderSessionState({
    session_code: appState.sessionCode,
    status: appState.sessionStatus,
  });
} else {
  showJoinView();
}
