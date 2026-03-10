require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

    await client.query(`DROP TABLE IF EXISTS "Registration" CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS "Update" CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS "Event" CASCADE;`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Event" (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        title TEXT NOT NULL UNIQUE,
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
      ON CONFLICT (email) DO UPDATE SET 
        name = EXCLUDED.name,
        password = EXCLUDED.password, 
        role = EXCLUDED.role
    `, ['vikas@reva.edu.in', 'Vikas Admin', hashedPassword, 'ADMIN', 'ADMIN-001']);
    console.log('✅ Admin user seeded: vikas@reva.edu.in / qwertyui');

    // Verify
    const users = await client.query('SELECT id, email, role FROM "User" WHERE email = $1', ['vikas@reva.edu.in']);
    const adminUser = users.rows[0];
    console.log('✅ Verified:', adminUser);

    // Seed Events
    console.log('🔄 Seeding dummy events...');
    const techCategory = await client.query('SELECT id FROM "Category" WHERE name = \'Technical\'');
    const culturalCategory = await client.query('SELECT id FROM "Category" WHERE name = \'Cultural\'');

    if (techCategory.rows[0] && culturalCategory.rows[0]) {
      const events = [
        {
          title: 'Hackathon 2024',
          description: 'A 24-hour coding challenge for innovators and dreamers.',
          rules: '1. Teams of 2-4 members\n2. Bring your own laptops\n3. No pre-built code allowed',
          categoryId: techCategory.rows[0].id,
          date: '2024-10-15',
          time: '10:00 AM',
          venue: 'C-Block Seminar Hall',
          maxSeats: 100,
          poster: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop',
          contactName: 'Tech Coordinator',
          contactPhone: '9876543210'
        },
        {
          title: 'Cultural Night',
          description: 'A night of music, dance, and celebration of diversity.',
          rules: '1. Mandatory ID cards\n2. No outside food\n3. Respect the performers',
          categoryId: culturalCategory.rows[0].id,
          date: '2024-11-20',
          time: '06:00 PM',
          venue: 'Open Air Theater',
          maxSeats: 500,
          poster: 'https://images.unsplash.com/photo-1514525253348-8d9807cc2646?q=80&w=2070&auto=format&fit=crop',
          contactName: 'Cultural Secretary',
          contactPhone: '9123456789'
        }
      ];

      for (const event of events) {
        await client.query(`
          INSERT INTO "Event" (id, title, description, rules, "categoryId", date, time, venue, "maxSeats", poster, "organizerId", "contactName", "contactPhone", status)
          VALUES (uuid_generate_v4()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PUBLISHED')
          ON CONFLICT (title) DO NOTHING
        `, [
          event.title, event.description, event.rules, event.categoryId,
          new Date(event.date), event.time, event.venue, event.maxSeats,
          event.poster, adminUser.id, event.contactName, event.contactPhone
        ]);
      }
      console.log('✅ Events seeded!');
    }

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
