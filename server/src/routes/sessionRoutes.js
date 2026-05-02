const express = require("express");
const {
  controlSessionHandler,
  createSessionHandler,
  getSessionMonitorHandler,
  joinSessionHandler,
} = require("../controllers/sessionController");

const router = express.Router();

// Las rutas se mantienen pequenas; validacion y respuestas viven en el controller.
router.post("/create", createSessionHandler);
router.post("/join", joinSessionHandler);
router.get("/monitor", getSessionMonitorHandler);
router.post("/control", controlSessionHandler);

module.exports = router;
