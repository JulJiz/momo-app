const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const config = require("./src/config/env");
const sessionRoutes = require("./src/routes/sessionRoutes");
const { registerMomoSocket } = require("./src/sockets/momoSocket");
const {
  registerSessionControllerSocket,
} = require("./src/controllers/sessionController");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  path: "/real-time",
  cors: {
    origin: config.clientOrigin,
  },
});
registerSessionControllerSocket(io);

app.use(
  cors({
    origin: config.clientOrigin,
  })
);
app.use(express.json());

app.get("/health", (request, response) => {
  response.json({
    ok: true,
    app: "momo",
    status: "running",
  });
});

// API REST de sesiones usada por el MVP estudiante y el futuro dashboard.
app.use("/session", sessionRoutes);

// Los errores del parser JSON deben ser claros durante pruebas manuales.
app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return response.status(400).json({
      error: "INVALID_JSON",
      message: "Request body must be valid JSON",
    });
  }

  return next(error);
});

registerMomoSocket(io);

httpServer.listen(config.port, () => {
  console.log(`MOMO server running on http://localhost:${config.port}`);
});
