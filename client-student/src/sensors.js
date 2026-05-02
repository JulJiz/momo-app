(function () {
  const SHAKE_THRESHOLD = 18;
  const DEFAULT_THROTTLE_MS = 400;

  let onReading = null;
  let onStatusChange = null;
  let throttleMs = DEFAULT_THROTTLE_MS;
  let isListening = false;
  let permissionGranted = false;
  let lastEmitAt = 0;
  let lastTilt = null;
  let pendingShake = false;

  // Los sensores cambian por navegador, por eso se detectan como mejora progresiva.
  function hasOrientationSupport() {
    return "DeviceOrientationEvent" in window;
  }

  function hasMotionSupport() {
    return "DeviceMotionEvent" in window;
  }

  function needsPermission() {
    // iOS exige pedir permiso desde una accion del usuario.
    const motionNeedsPermission =
      window.DeviceMotionEvent &&
      typeof window.DeviceMotionEvent.requestPermission === "function";
    const orientationNeedsPermission =
      window.DeviceOrientationEvent &&
      typeof window.DeviceOrientationEvent.requestPermission === "function";

    return Boolean(motionNeedsPermission || orientationNeedsPermission);
  }

  function emitStatus(message, options = {}) {
    if (onStatusChange) {
      onStatusChange({
        message,
        needsPermission: Boolean(options.needsPermission),
      });
    }
  }

  function getScreenOrientation() {
    if (window.screen?.orientation?.type) {
      return window.screen.orientation.type.includes("landscape")
        ? "landscape"
        : "portrait";
    }

    return window.innerWidth > window.innerHeight ? "landscape" : "portrait";
  }

  function toSafeNumber(value) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  function emitReading() {
    const now = Date.now();

    // Throttle: enviamos lecturas agrupadas para no saturar Socket.io.
    if (!onReading || now - lastEmitAt < throttleMs) {
      return;
    }

    lastEmitAt = now;
    onReading({
      tilt: lastTilt,
      shake: pendingShake,
      orientation: getScreenOrientation(),
    });
    pendingShake = false;
  }

  function handleOrientation(event) {
    lastTilt = {
      alpha: toSafeNumber(event.alpha),
      beta: toSafeNumber(event.beta),
      gamma: toSafeNumber(event.gamma),
    };

    emitReading();
  }

  function handleMotion(event) {
    const acceleration =
      event.accelerationIncludingGravity || event.acceleration || {};
    const x = toSafeNumber(acceleration.x);
    const y = toSafeNumber(acceleration.y);
    const z = toSafeNumber(acceleration.z);
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // Umbral simple para detectar sacudidas sin dependencias externas.
    if (magnitude >= SHAKE_THRESHOLD) {
      pendingShake = true;
    }

    emitReading();
  }

  function addListeners() {
    if (hasOrientationSupport()) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    if (hasMotionSupport()) {
      window.addEventListener("devicemotion", handleMotion);
    }
  }

  function removeListeners() {
    window.removeEventListener("deviceorientation", handleOrientation);
    window.removeEventListener("devicemotion", handleMotion);
  }

  function init(options = {}) {
    onReading = options.onReading || null;
    onStatusChange = options.onStatusChange || null;
    throttleMs = Number(options.throttleMs) || DEFAULT_THROTTLE_MS;

    if (!hasOrientationSupport() && !hasMotionSupport()) {
      emitStatus("Sensores no disponibles.");
      return;
    }

    emitStatus(
      needsPermission()
        ? "Permiso de sensores pendiente."
        : "Sensores listos.",
      { needsPermission: needsPermission() }
    );
  }

  async function requestPermission() {
    const permissionRequests = [];

    if (
      window.DeviceMotionEvent &&
      typeof window.DeviceMotionEvent.requestPermission === "function"
    ) {
      permissionRequests.push(window.DeviceMotionEvent.requestPermission());
    }

    if (
      window.DeviceOrientationEvent &&
      typeof window.DeviceOrientationEvent.requestPermission === "function"
    ) {
      permissionRequests.push(
        window.DeviceOrientationEvent.requestPermission()
      );
    }

    const results = await Promise.all(permissionRequests);
    const wasDenied = results.some((result) => result !== "granted");
    permissionGranted = !wasDenied;

    emitStatus(
      wasDenied ? "Permiso de sensores denegado." : "Sensores listos.",
      { needsPermission: wasDenied }
    );

    return !wasDenied;
  }

  function start() {
    if (!hasOrientationSupport() && !hasMotionSupport()) {
      emitStatus("Sensores no disponibles.");
      return false;
    }

    if (needsPermission() && !permissionGranted) {
      emitStatus("Permiso de sensores pendiente.", { needsPermission: true });
      return false;
    }

    if (!isListening) {
      // Se agregan listeners solo cuando la actividad esta activa.
      addListeners();
      isListening = true;
    }

    emitStatus("Sensores activos.");
    return true;
  }

  function stop() {
    if (isListening) {
      removeListeners();
      isListening = false;
    }

    pendingShake = false;
    emitStatus("Sensores pausados.");
  }

  window.MomoSensors = {
    init,
    needsPermission,
    requestPermission,
    start,
    stop,
  };
})();
