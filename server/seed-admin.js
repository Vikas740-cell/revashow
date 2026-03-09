require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'localhost',
  port: 51214,
  user: 'postgres',
  password: 'postgres',
  database: 'template1',
  ssl: false,
});

async function seed() {
  try {
    // Check tables
    const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
    console.log('Available tables:', tables.rows.map(r => r.tablename).join(', '));

    // Check if User table exists
    const hasUserTable = tables.rows.some(r => r.tablename === 'User');
    if (!hasUserTable) {
      console.error('❌ User table does not exist!');
      console.log('Run: npx prisma migrate dev (with Prisma dev server running)');
      return;
    }

    // Check if user exists
    const existing = await pool.query('SELECT id, email, role FROM "User" WHERE email = $1', ['vikas@reva.edu.in']);
    
    if (existing.rows.length > 0) {
      console.log('✅ User already exists:', existing.rows[0]);
      // Update password just in case
      const hashedPassword = await bcrypt.hash('qwertyui', 10);
      await pool.query('UPDATE "User" SET password = $1, role = $2 WHERE email = $3', [hashedPassword, 'ADMIN', 'vikas@reva.edu.in']);
      console.log('✅ Password and role updated to ADMIN.');
    } else {
      // Create admin
      const hashedPassword = await bcrypt.hash('qwertyui', 10);
      const result = await pool.query(
        `INSERT INTO "User" (id, email, name, password, role, srn, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email, role`,
        ['vikas@reva.edu.in', 'Vikas Admin', hashedPassword, 'ADMIN', 'ADMIN-001']
      );
      console.log('✅ Admin created:', result.rows[0]);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('relation "User" does not exist')) {
      console.log('\n⚠️  The database tables do not exist yet.');
      console.log('Please run: npx prisma migrate dev --name init');
      console.log('(Make sure the Prisma dev server is running first)');
    }
  } finally {
    await pool.end();
  }
}

seed();
