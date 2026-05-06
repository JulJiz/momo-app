function buildSensorFeedback(sensorEvent) {
  if (!sensorEvent?.shake) {
    return null;
  }

  return {
    feedback_id: `feedback:${sensorEvent.sensor_event_id}`,
    session_code: sensorEvent.session_code,
    device_id: sensorEvent.device_id,
    feedback_type: "movement",
    points: 1,
    message: "MOMO vio tu movimiento",
    metadata: {
      shake: sensorEvent.shake,
      orientation: sensorEvent.orientation,
    },
    created_at: Date.now(),
  };
}

function buildStrokeFeedback(stroke) {
  if (!stroke || stroke.sequence % 12 !== 0) {
    return null;
  }

  return {
    feedback_id: `feedback:${stroke.stroke_id}`,
    session_code: stroke.session_code,
    device_id: stroke.device_id,
    feedback_type: "drawing",
    points: 1,
    message: "MOMO ve que sigues creando",
    metadata: {
      color: stroke.color,
      brush_type: stroke.brush_type,
      sequence: stroke.sequence,
    },
    created_at: Date.now(),
  };
}

module.exports = {
  buildSensorFeedback,
  buildStrokeFeedback,
};
