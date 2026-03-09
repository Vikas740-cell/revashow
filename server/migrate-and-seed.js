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

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Creating database schema...');

    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
          CREATE TYPE "Role" AS ENUM ('STUDENT', 'ORGANIZER', 'ADMIN');
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EventStatus') THEN
          CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RegistrationStatus') THEN
          CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED');
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role "Role" NOT NULL DEFAULT 'STUDENT',
        srn TEXT UNIQUE,
        department TEXT,
        phone TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Category" (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        name TEXT NOT NULL UNIQUE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Event" (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        rules TEXT,
        "categoryId" TEXT NOT NULL REFERENCES "Category"(id),
        date TIMESTAMP NOT NULL,
        time TEXT NOT NULL,
        venue TEXT NOT NULL,
        "maxSeats" INTEGER NOT NULL,
        poster TEXT,
        "organizerId" TEXT NOT NULL REFERENCES "User"(id),
        "contactName" TEXT NOT NULL,
        "contactPhone" TEXT NOT NULL,
        status "EventStatus" NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Registration" (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
        "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        status "RegistrationStatus" NOT NULL DEFAULT 'CONFIRMED',
        "qrCode" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE("eventId", "userId")
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Update" (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'INFO',
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('✅ Schema created successfully!');

    // Seed default categories
    const categories = ['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Seminar'];
    for (const cat of categories) {
      await client.query('INSERT INTO "Category" (id, name) VALUES (uuid_generate_v4()::text, $1) ON CONFLICT (name) DO NOTHING', [cat]);
    }
    console.log('✅ Categories seeded!');

    // Seed admin user
    const hashedPassword = await bcrypt.hash('qwertyui', 10);
    await client.query(`
      INSERT INTO "User" (id, email, name, password, role, srn, "createdAt", "updatedAt")
      VALUES (uuid_generate_v4()::text, $1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role
    `, ['vikas@reva.edu.in', 'Vikas Admin', hashedPassword, 'ADMIN', 'ADMIN-001']);
    console.log('✅ Admin user seeded: vikas@reva.edu.in / qwertyui');

    // Verify
    const users = await client.query('SELECT id, email, role FROM "User" WHERE email = $1', ['vikas@reva.edu.in']);
    console.log('✅ Verified:', users.rows[0]);

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
