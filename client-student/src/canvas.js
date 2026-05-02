(function () {
  const DEFAULT_TOOL = {
    color: "#202124",
    brushType: "medium",
    brushSize: 4,
    tool: "brush",
  };

  let canvas = null;
  let context = null;
  let enabled = false;
  let isDrawing = false;
  let lastPoint = null;
  let tool = { ...DEFAULT_TOOL };
  let onSegment = null;

  function resizeCanvas() {
    if (!canvas || !context) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    // Ajusta el buffer interno para que el trazo se vea nitido en pantallas HD.
    const pixelRatio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(rect.width * pixelRatio));
    const height = Math.max(1, Math.floor(rect.height * pixelRatio));

    if (canvas.width === width && canvas.height === height) {
      return;
    }

    canvas.width = width;
    canvas.height = height;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.lineCap = "round";
    context.lineJoin = "round";
  }

  function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function drawSegment(previousPoint, currentPoint) {
    context.strokeStyle = tool.color;
    context.lineWidth = tool.brushSize;
    context.beginPath();
    context.moveTo(previousPoint.x, previousPoint.y);
    context.lineTo(currentPoint.x, currentPoint.y);
    context.stroke();

    // app.js decide si este segmento se envia por Socket.io.
    if (onSegment) {
      onSegment({
        x: currentPoint.x,
        y: currentPoint.y,
        prev_x: previousPoint.x,
        prev_y: previousPoint.y,
        color: tool.color,
        brush_type: tool.brushType,
        brush_size: tool.brushSize,
        tool: tool.tool,
      });
    }
  }

  function startDrawing(event) {
    if (!enabled) {
      return;
    }

    event.preventDefault();
    resizeCanvas();
    isDrawing = true;
    lastPoint = getCanvasPoint(event);
    // Captura el puntero para que el trazo no se corte al mover rapido.
    canvas.setPointerCapture(event.pointerId);
  }

  function continueDrawing(event) {
    if (!enabled || !isDrawing || !lastPoint) {
      return;
    }

    event.preventDefault();
    const currentPoint = getCanvasPoint(event);
    drawSegment(lastPoint, currentPoint);
    lastPoint = currentPoint;
  }

  function stopDrawing(event) {
    if (event && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    isDrawing = false;
    lastPoint = null;
  }

  function init(canvasElement) {
    canvas = canvasElement;
    context = canvas.getContext("2d");

    canvas.addEventListener("pointerdown", startDrawing);
    canvas.addEventListener("pointermove", continueDrawing);
    canvas.addEventListener("pointerup", stopDrawing);
    canvas.addEventListener("pointercancel", stopDrawing);
    canvas.addEventListener("pointerleave", stopDrawing);
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  }

  function setEnabled(nextEnabled) {
    enabled = Boolean(nextEnabled);
    isDrawing = false;

    if (canvas) {
      canvas.classList.toggle("is-disabled", !enabled);
      resizeCanvas();
    }
  }

  function setTool(nextTool) {
    // app.js controla la toolbar; este modulo solo aplica la herramienta activa.
    tool = {
      ...tool,
      ...nextTool,
    };
  }

  function setSegmentHandler(handler) {
    onSegment = handler;
  }

  window.MomoCanvas = {
    init,
    resizeCanvas,
    setEnabled,
    setTool,
    setSegmentHandler,
  };
})();
