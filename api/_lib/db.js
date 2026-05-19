import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (globalThis.__OPTIMALL_TEST_MOCK_POOL) {
    return globalThis.__OPTIMALL_TEST_MOCK_POOL;
  }

  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10
    });
  }
  return pool;
}
