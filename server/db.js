const { Pool } = require('pg');
const dns = require('dns'); // Import the DNS module
require('dotenv').config();

// FIX: Force Node.js to use IPv4 first (Solves ETIMEDOUT on IPv6)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Add a connection timeout to fail faster if it hangs
  connectionTimeoutMillis: 5000,
});

module.exports = pool;