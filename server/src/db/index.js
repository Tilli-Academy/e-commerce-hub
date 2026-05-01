const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./schema');

let db = null;
let pool = null;

const initDB = async (databaseUrl) => {
  pool = new Pool({ connectionString: databaseUrl });

  // Test connection
  const client = await pool.connect();
  client.release();

  db = drizzle(pool, { schema });
  return db;
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDB() first.');
  }
  return pool;
};

const closeDB = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
};

module.exports = { initDB, getDB, getPool, closeDB };
