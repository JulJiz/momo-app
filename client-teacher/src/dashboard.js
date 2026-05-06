import { getStudents } from "./api.js";

let intervalId = null;

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

async function refreshMonitor(sessionCode) {
  try {
    const data = await getStudents(sessionCode);
    return data;
  } catch (error) {
    console.error("Error al obtener el estado de la sesión:", error);
    throw error;
  }
}

export async function startMonitoring(sessionCode, onUpdate) {
  if (!sessionCode) {
    throw new Error("Session code is required");
  }

  if (intervalId) {
    clearInterval(intervalId);
  }

  const poll = async () => {
    try {
      const data = await refreshMonitor(sessionCode);
      if (typeof onUpdate === "function") {
        onUpdate(data);
      }
    } catch (error) {
      console.warn("Error refreshing session monitor", error);
    }
  };

  await poll();
  intervalId = setInterval(poll, 3000);

  return null;
}
