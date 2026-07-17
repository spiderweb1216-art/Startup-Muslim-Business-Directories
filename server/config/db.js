const mysql = require('mysql2/promise');
const { boolEnv, requireProductionDatabaseConfig } = require('./env');

requireProductionDatabaseConfig();

const baseConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z',
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

if (boolEnv('DB_SSL', false)) {
  baseConfig.ssl = {
    rejectUnauthorized: boolEnv('DB_SSL_REJECT_UNAUTHORIZED', true),
  };
}

const database = process.env.DB_NAME || 'startup_muslim_directory_local_v312';
const pool = mysql.createPool({ ...baseConfig, database });

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}

async function closePool() {
  await pool.end();
}


module.exports = { mysql, baseConfig, database, pool, testConnection, closePool };
