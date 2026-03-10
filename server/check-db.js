const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function main() {
  try {
    const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
    console.log('Tables:', JSON.stringify(tables.rows));

    // Try to query User table
    try {
      const users = await pool.query('SELECT id, email, role FROM "User" LIMIT 5');
      console.log('Users:', JSON.stringify(users.rows));
    } catch (e) {
      console.error('User table error:', e.message);
    }

  } catch (e) {
    console.error('Connection error:', e.message);
  } finally {
    await pool.end();
  }
}

main();
