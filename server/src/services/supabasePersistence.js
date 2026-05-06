const config = require("../config/env");

const REST_PREFIX = "/rest/v1";

function isEnabled() {
  return Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);
}

function buildUrl(path) {
  return `${config.supabaseUrl}${REST_PREFIX}${path}`;
}

async function request(path, options = {}) {
  if (!isEnabled()) {
    return null;
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${message}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  return text ? JSON.parse(text) : null;
}

function upsert(path, rows) {
  const safeRows = Array.isArray(rows) ? rows : [rows];

  if (safeRows.length === 0) {
    return Promise.resolve(null);
  }

  return request(path, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(safeRows),
  });
}

function toSessionRow(session) {
  return {
    session_code: session.session_code,
    status: session.status,
    created_at: session.created_at,
    duration_seconds: session.duration_seconds,
    remaining_seconds: session.remaining_seconds,
    started_at: session.started_at,
    paused_at: session.paused_at,
    ended_at: session.ended_at,
    updated_at: Date.now(),
  };
}

function toStudentRows(session) {
  return (session.students || []).map((student) => ({
    session_code: session.session_code,
    student_id: student.student_id,
    device_id: student.device_id,
    nickname: student.nickname,
    status: student.status,
    connected: student.connected,
    joined_at: student.joined_at,
    last_active_at: student.last_active_at,
  }));
}

async function saveSession(session) {
  await upsert("/sessions?on_conflict=session_code", toSessionRow(session));
  await upsert("/students?on_conflict=session_code,device_id", toStudentRows(session));
}

async function saveStroke(stroke) {
  await upsert("/strokes?on_conflict=stroke_id", stroke);
}

async function saveSensorEvent(sensorEvent) {
  await upsert("/sensor_events?on_conflict=sensor_event_id", sensorEvent);
}

async function saveAiFeedback(feedback) {
  if (!feedback) {
    return null;
  }

  return upsert("/ai_feedback?on_conflict=feedback_id", feedback);
}

async function loadSnapshot() {
  if (!isEnabled()) {
    return null;
  }

  const [sessions, students, strokes, sensorEvents] = await Promise.all([
    request("/sessions?select=*"),
    request("/students?select=*"),
    request("/strokes?select=*&order=sequence.asc"),
    request("/sensor_events?select=*&order=created_at.asc"),
  ]);

  return {
    sessions: sessions || [],
    students: students || [],
    strokes: strokes || [],
    sensorEvents: sensorEvents || [],
  };
}

function logPersistenceError(error) {
  console.error("Supabase persistence error:", error.message);
}

module.exports = {
  isEnabled,
  loadSnapshot,
  logPersistenceError,
  saveAiFeedback,
  saveSensorEvent,
  saveSession,
  saveStroke,
};
