//backend/database.js
const { Pool } = require('pg');

console.log('=== Database Pool Configuration ===');


const pool = process.env.DATABASE_URL ? 
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  }) :
  new Pool({
    host: process.env.PGHOST || process.env.DB_HOST,
    port: process.env.PGPORT || process.env.DB_PORT,
    database: process.env.PGDATABASE || process.env.DB_NAME,
    user: process.env.PGUSER || process.env.DB_USER,
    password: process.env.PGPASSWORD || process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  });

console.log('Using DATABASE_URL:', !!process.env.DATABASE_URL);
if (!process.env.DATABASE_URL) {
  console.log('Host:', process.env.PGHOST || process.env.DB_HOST);
  console.log('Port:', process.env.PGPORT || process.env.DB_PORT);
  console.log('Database:', process.env.PGDATABASE || process.env.DB_NAME);
  console.log('User:', process.env.PGUSER || process.env.DB_USER);
}
console.log('===================================\n');

pool.on('connect', () => {
  console.log('✓ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('✗ Database error:', err);
});

module.exports = pool;