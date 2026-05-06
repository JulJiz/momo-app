(function () {
  const DEVICE_ID_KEY = "momo_device_id";

  // Identifica esta pestana. Asi dos estudiantes no comparten identidad.
  function createDeviceId() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }

    return `student-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  function getDeviceId() {
    try {
      const storedDeviceId = window.sessionStorage.getItem(DEVICE_ID_KEY);

      if (storedDeviceId) {
        return storedDeviceId;
      }

      const deviceId = createDeviceId();
      window.sessionStorage.setItem(DEVICE_ID_KEY, deviceId);
      return deviceId;
    } catch (error) {
      return createDeviceId();
    }
  }

  // Algunos errores del backend pueden venir sin JSON; asi evitamos romper la UI.
  async function readJson(response) {
    try {
      return await response.json();
    } catch (error) {
      return {};
    }
  }

  async function joinSession({ serverUrl, sessionCode, nickname }) {
    const deviceId = getDeviceId();
    // Contrato REST: el backend necesita codigo, dispositivo y nombre visible.
    const response = await fetch(`${serverUrl}/session/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_code: sessionCode,
        device_id: deviceId,
        nickname,
      }),
    });
    const data = await readJson(response);

    if (!response.ok) {
      const message = data.message || "No se pudo unir a la sesion";
      const error = new Error(message);
      error.code = data.error || "JOIN_SESSION_FAILED";
      error.status = response.status;
      throw error;
    }

    return {
      ...data,
      device_id: deviceId,
      nickname,
    };
  }

  window.MomoApi = {
    getDeviceId,
    joinSession,
  };
})();
