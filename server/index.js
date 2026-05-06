const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const path = require("path");
const { Server } = require("socket.io");
const config = require("./src/config/env");
const sessionRoutes = require("./src/routes/sessionRoutes");
const { hydrateSessions } = require("./src/services/sessionStore");
const persistence = require("./src/services/supabasePersistence");
const { registerMomoSocket } = require("./src/sockets/momoSocket");
const {
  registerSessionControllerSocket,
} = require("./src/controllers/sessionController");

const app = express();
const httpServer = createServer(app);
const clients = {
  student: path.join(__dirname, "../client-student"),
  teacher: path.join(__dirname, "../client-teacher"),
  screen: path.join(__dirname, "../client-screen"),
  assets: path.join(__dirname, "../assets"),
};
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

function serveClient(route, directory) {
  const staticOptions = {
    etag: false,
    maxAge: 0,
    redirect: false,
    setHeaders(response) {
      response.setHeader("Cache-Control", "no-store");
    },
  };

  app.use(`/${route}`, express.static(directory, staticOptions));
  app.get([`/${route}`, `/${route}/`], (request, response) => {
    response.sendFile(path.join(directory, "index.html"));
  });
}

serveClient("student", clients.student);
serveClient("teacher", clients.teacher);
serveClient("screen", clients.screen);
app.use("/assets", express.static(clients.assets));

app.get("/health", (request, response) => {
  response.json({
    ok: true,
    app: "momo",
    status: "running",
  });
});

app.get("/", (request, response) => {
  response.redirect("/teacher");
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

async function startServer() {
  if (persistence.isEnabled()) {
    try {
      const snapshot = await persistence.loadSnapshot();
      hydrateSessions(snapshot);
      console.log("Supabase persistence loaded.");
    } catch (error) {
      persistence.logPersistenceError(error);
    }
  } else {
    console.log("Supabase persistence disabled. Using memory store.");
  }

  httpServer.listen(config.port, () => {
    console.log(`MOMO server running on http://localhost:${config.port}`);
  });
}

startServer();
