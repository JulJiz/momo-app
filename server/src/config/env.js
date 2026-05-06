const dotenv = require("dotenv");

dotenv.config();

const config = {
  port: Number(process.env.PORT) || 5050,
  clientOrigin: process.env.CLIENT_ORIGIN || "*",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

module.exports = config;
