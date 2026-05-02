import { joinRoom } from "./socket.js";

const code = localStorage.getItem("code") || prompt("Enter session code");
if (!code) {
  document.body.innerHTML =
    "<p style='color:#fff;padding:24px;'>Session code is required.</p>";
  throw new Error("Session code missing");
}

localStorage.setItem("code", code);
const socket = joinRoom(code);
const title = document.getElementById("code");
const time = document.getElementById("time");
const status = document.getElementById("screen-status");

if (title) {
  title.innerText = code;
}

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

socket.on("session-state", (state) => {
  if (status) {
    status.innerText = state.status || "waiting";
  }

  if (time) {
    time.innerText = formatTime(state.time_remaining);
  }
});

window.addEventListener("beforeunload", () => {
  if (socket && socket.disconnect) {
    socket.disconnect();
  }
});
