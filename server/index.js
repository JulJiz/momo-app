const express = require("express");
const cors = require("cors");
const config = require("./src/config/env");

const app = express();

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

app.listen(config.port, () => {
  console.log(`MOMO server running on http://localhost:${config.port}`);
});
