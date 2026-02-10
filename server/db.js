const Pool = require('pg').Pool;
require('dotenv').config();

// 1. Config for Local Development (Your Laptop)
const devConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
};

// 2. Config for Production (Render / Supabase)
const proConfig = {
  connectionString: process.env.DATABASE_URL, // Render provides this
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  }
};

// 3. Logic: If Render provides a URL, use it. Otherwise, use local config.
const pool = new Pool(
  process.env.DATABASE_URL ? proConfig : devConfig
);

module.exports = pool;