const dotenv = require("dotenv");

dotenv.config();

const config = {
  port: Number(process.env.PORT) || 5050,
  clientOrigin: process.env.CLIENT_ORIGIN || "*",
};

module.exports = config;
