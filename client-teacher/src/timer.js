let time = 180; 
let interval = null;

export function startTimer(displayId = "timer") {
const el = document.getElementById(displayId);

interval = setInterval(() => {
    if (time <= 0) {
    clearInterval(interval);
    return;
    }

    time--;

    const min = Math.floor(time / 60);
    const sec = time % 60;

    el.innerText = `${min}:${sec < 10 ? "0" : ""}${sec}`;
}, 1000);
}

export function resetTimer(seconds = 180) {
time = seconds;
clearInterval(interval);
}