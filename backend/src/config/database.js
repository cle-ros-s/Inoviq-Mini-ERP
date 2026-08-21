require('dotenv').config();
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ FATAL: DATABASE_URL environment variable is missing in backend/.env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('⚠️ Unexpected PostgreSQL pool error on idle client:', err.message);
});

/**
 * Executes a parameterized SQL query on the PostgreSQL pool
 * @param {string} text - SQL Query statement with placeholders ($1, $2, ...)
 * @param {Array} params - Array of parameter values
 */
const query = (text, params) => pool.query(text, params);

/**
 * Tests database connectivity by running a lightweight query (SELECT 1)
 * @returns {Promise<boolean>} - true if connected, false if connection fails
 */
const testConnection = async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ PostgreSQL Connection Check Failed:', err.message);
    return false;
  }
};

/**
 * Gracefully shuts down the PostgreSQL connection pool
 */
const closePool = async () => {
  try {
    await pool.end();
    console.log('PostgreSQL connection pool closed.');
  } catch (err) {
    console.error('Error closing PostgreSQL connection pool:', err.message);
  }
};

module.exports = {
  pool,
  query,
  testConnection,
  closePool
};
