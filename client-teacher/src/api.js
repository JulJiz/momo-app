const API = window.location.origin;

export async function createSession() {
  const res = await fetch(`${API}/session/create`, { method: "POST" });
  return res.json();
}

export async function controlSession(code, action) {
  const res = await fetch(`${API}/session/control`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_code: code, action }),
  });
  return res.json();
}

export async function getStudents(code) {
  const res = await fetch(
    `${API}/session/monitor?session_code=${encodeURIComponent(code)}`,
  );
  return res.json();
}

export async function sendSessionMessage(code, message) {
  const res = await fetch(`${API}/session/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_code: code, message }),
  });

  return res.json();
}
