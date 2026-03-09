const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 51214,
  user: 'postgres',
  password: 'postgres',
  database: 'template1',
  ssl: false,
});

const db = {
  // ─── User ───────────────────────────────────────────────────────
  user: {
    findUnique: async ({ where, include } = {}) => {
      let query, params;
      if (where.email) {
        query = 'SELECT * FROM "User" WHERE email = $1 LIMIT 1';
        params = [where.email];
      } else if (where.id) {
        query = 'SELECT * FROM "User" WHERE id = $1 LIMIT 1';
        params = [where.id];
      } else {
        return null;
      }
      const res = await pool.query(query, params);
      return res.rows[0] || null;
    },

    findMany: async ({ where, orderBy, include } = {}) => {
      let query = 'SELECT * FROM "User"';
      const params = [];
      if (where?.role) {
        query += ' WHERE role = $1';
        params.push(where.role);
      }
      query += ' ORDER BY "createdAt" DESC';
      const res = await pool.query(query, params);
      return res.rows;
    },

    create: async ({ data }) => {
      const { email, name, password, role = 'STUDENT', srn, department, phone } = data;
      const res = await pool.query(
        `INSERT INTO "User" (id, email, name, password, role, srn, department, phone, "createdAt", "updatedAt")
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
        [email, name, password, role, srn || null, department || null, phone || null]
      );
      return res.rows[0];
    },

    update: async ({ where, data }) => {
      const setClauses = Object.entries(data).map(([k, v], i) => `"${k}" = $${i + 2}`).join(', ');
      const values = Object.values(data);
      const res = await pool.query(
        `UPDATE "User" SET ${setClauses}, "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
        [where.id, ...values]
      );
      return res.rows[0];
    },

    delete: async ({ where }) => {
      const res = await pool.query('DELETE FROM "User" WHERE id = $1 RETURNING *', [where.id]);
      return res.rows[0];
    },

    count: async ({ where } = {}) => {
      let query = 'SELECT COUNT(*) FROM "User"';
      const params = [];
      if (where?.role) {
        query += ' WHERE role = $1';
        params.push(where.role);
      }
      const res = await pool.query(query, params);
      return parseInt(res.rows[0].count, 10);
    },
  },

  // ─── Event ──────────────────────────────────────────────────────
  event: {
    findMany: async ({ where, include, orderBy, take, skip } = {}) => {
      let query = 'SELECT e.*, c.name as "categoryName", u.name as "organizerName", u.email as "organizerEmail", u.phone as "organizerPhone", (SELECT COUNT(*) FROM "Registration" r WHERE r."eventId" = e.id) as "registrationCount" FROM "Event" e LEFT JOIN "Category" c ON e."categoryId" = c.id LEFT JOIN "User" u ON e."organizerId" = u.id';
      const params = [];
      const conditions = [];
      if (where?.status) { conditions.push(`e.status = $${params.length + 1}`); params.push(where.status); }
      if (where?.organizerId) { conditions.push(`e."organizerId" = $${params.length + 1}`); params.push(where.organizerId); }
      if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
      query += ' ORDER BY e."createdAt" DESC';
      if (take) { query += ` LIMIT $${params.length + 1}`; params.push(take); }
      if (skip) { query += ` OFFSET $${params.length + 1}`; params.push(skip); }
      const res = await pool.query(query, params);
      return res.rows.map(row => ({
        ...row,
        _count: { registrations: parseInt(row.registrationCount, 10) },
        category: { name: row.categoryName },
        organizer: { name: row.organizerName, email: row.organizerEmail, phone: row.organizerPhone },
      }));
    },

    findUnique: async ({ where, include } = {}) => {
      const baseQuery = `SELECT e.*, c.name as "categoryName", u.name as "organizerName", u.email as "organizerEmail", u.phone as "organizerPhone",
        (SELECT COUNT(*) FROM "Registration" r WHERE r."eventId" = e.id) as "registrationCount"
        FROM "Event" e LEFT JOIN "Category" c ON e."categoryId" = c.id LEFT JOIN "User" u ON e."organizerId" = u.id
        WHERE e.id = $1 LIMIT 1`;
      const res = await pool.query(baseQuery, [where.id]);
      if (!res.rows[0]) return null;
      const row = res.rows[0];
      return {
        ...row,
        _count: { registrations: parseInt(row.registrationCount, 10) },
        category: { name: row.categoryName },
        organizer: { name: row.organizerName, email: row.organizerEmail, phone: row.organizerPhone },
      };
    },

    create: async ({ data }) => {
      const { title, description, rules, categoryId, date, time, venue, maxSeats, poster, organizerId, contactName, contactPhone, status = 'PENDING' } = data;
      const res = await pool.query(
        `INSERT INTO "Event" (id, title, description, rules, "categoryId", date, time, venue, "maxSeats", poster, "organizerId", "contactName", "contactPhone", status, "createdAt", "updatedAt")
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()) RETURNING *`,
        [title, description, rules || null, categoryId, new Date(date), time, venue, maxSeats, poster || null, organizerId, contactName, contactPhone, status]
      );
      return res.rows[0];
    },

    update: async ({ where, data }) => {
      const skip = ['id', 'createdAt', '_count', 'category', 'organizer'];
      const entries = Object.entries(data).filter(([k]) => !skip.includes(k));
      const setClauses = entries.map(([k], i) => `"${k}" = $${i + 2}`).join(', ');
      const values = entries.map(([, v]) => v);
      const res = await pool.query(
        `UPDATE "Event" SET ${setClauses}, "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
        [where.id, ...values]
      );
      return res.rows[0];
    },

    delete: async ({ where }) => {
      const res = await pool.query('DELETE FROM "Event" WHERE id = $1 RETURNING *', [where.id]);
      return res.rows[0];
    },

    count: async ({ where } = {}) => {
      let query = 'SELECT COUNT(*) FROM "Event"';
      const params = [];
      const conditions = [];
      if (where?.status) { conditions.push(`status = $${params.length + 1}`); params.push(where.status); }
      if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
      const res = await pool.query(query, params);
      return parseInt(res.rows[0].count, 10);
    },
  },

  // ─── Registration ────────────────────────────────────────────────
  registration: {
    findMany: async ({ where, include } = {}) => {
      let query = `SELECT r.*, u.name as "userName", u.email as "userEmail", u.srn as "userSrn", e.title as "eventTitle"
        FROM "Registration" r LEFT JOIN "User" u ON r."userId" = u.id LEFT JOIN "Event" e ON r."eventId" = e.id`;
      const params = [];
      const conditions = [];
      if (where?.userId) { conditions.push(`r."userId" = $${params.length + 1}`); params.push(where.userId); }
      if (where?.eventId) { conditions.push(`r."eventId" = $${params.length + 1}`); params.push(where.eventId); }
      if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
      query += ' ORDER BY r."createdAt" DESC';
      const res = await pool.query(query, params);
      return res.rows.map(row => ({
        ...row,
        user: { name: row.userName, email: row.userEmail, srn: row.userSrn },
        event: { title: row.eventTitle },
      }));
    },

    findUnique: async ({ where }) => {
      const res = await pool.query('SELECT * FROM "Registration" WHERE "eventId" = $1 AND "userId" = $2 LIMIT 1', [where.eventId_userId?.eventId, where.eventId_userId?.userId]);
      return res.rows[0] || null;
    },

    create: async ({ data }) => {
      const { eventId, userId, qrCode } = data;
      const res = await pool.query(
        `INSERT INTO "Registration" (id, "eventId", "userId", status, "qrCode", "createdAt")
         VALUES (uuid_generate_v4(), $1, $2, 'CONFIRMED', $3, NOW()) RETURNING *`,
        [eventId, userId, qrCode || null]
      );
      return res.rows[0];
    },

    update: async ({ where, data }) => {
      const entries = Object.entries(data);
      const setClauses = entries.map(([k], i) => `"${k}" = $${i + 2}`).join(', ');
      const values = entries.map(([, v]) => v);
      const res = await pool.query(
        `UPDATE "Registration" SET ${setClauses} WHERE id = $1 RETURNING *`,
        [where.id, ...values]
      );
      return res.rows[0];
    },

    count: async ({ where } = {}) => {
      let query = 'SELECT COUNT(*) FROM "Registration"';
      const params = [];
      const conditions = [];
      if (where?.eventId) { conditions.push(`"eventId" = $${params.length + 1}`); params.push(where.eventId); }
      if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
      const res = await pool.query(query, params);
      return parseInt(res.rows[0].count, 10);
    },
  },

  // ─── Category ────────────────────────────────────────────────────
  category: {
    findMany: async () => {
      const res = await pool.query('SELECT * FROM "Category" ORDER BY name ASC');
      return res.rows;
    },
    findUnique: async ({ where }) => {
      const res = await pool.query('SELECT * FROM "Category" WHERE id = $1 LIMIT 1', [where.id]);
      return res.rows[0] || null;
    },
    create: async ({ data }) => {
      const res = await pool.query('INSERT INTO "Category" (id, name) VALUES (uuid_generate_v4(), $1) RETURNING *', [data.name]);
      return res.rows[0];
    },
    upsert: async ({ where, create, update }) => {
      const existing = await db.category.findUnique({ where });
      if (existing) {
        const res = await pool.query('UPDATE "Category" SET name = $1 WHERE id = $2 RETURNING *', [update.name || existing.name, existing.id]);
        return res.rows[0];
      }
      return db.category.create({ data: create });
    },
  },

  // ─── Notification ────────────────────────────────────────────────
  notification: {
    findMany: async ({ where, orderBy } = {}) => {
      let query = 'SELECT * FROM "Notification"';
      const params = [];
      if (where?.userId) {
        query += ' WHERE "userId" = $1';
        params.push(where.userId);
      }
      query += ' ORDER BY "createdAt" DESC';
      const res = await pool.query(query, params);
      return res.rows;
    },

    create: async ({ data }) => {
      const { userId, title, message, type = 'INFO' } = data;
      const res = await pool.query(
        `INSERT INTO "Notification" (id, "userId", title, message, type, "isRead", "createdAt")
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, false, NOW()) RETURNING *`,
        [userId, title, message, type]
      );
      return res.rows[0];
    },

    updateMany: async ({ where, data }) => {
      let query = 'UPDATE "Notification" SET "isRead" = $1';
      const params = [data.isRead];
      if (where?.userId) { query += ` WHERE "userId" = $${params.length + 1}`; params.push(where.userId); }
      if (where?.id) { query += ` WHERE id = $${params.length + 1}`; params.push(where.id); }
      await pool.query(query, params);
    },
  },

  // ─── Update ──────────────────────────────────────────────────────
  update: {
    findMany: async ({ where } = {}) => {
      let query = 'SELECT * FROM "Update"';
      const params = [];
      if (where?.eventId) {
        query += ' WHERE "eventId" = $1';
        params.push(where.eventId);
      }
      query += ' ORDER BY "createdAt" DESC';
      const res = await pool.query(query, params);
      return res.rows;
    },

    create: async ({ data }) => {
      const { eventId, message } = data;
      const res = await pool.query(
        `INSERT INTO "Update" (id, "eventId", message, "createdAt") VALUES (uuid_generate_v4(), $1, $2, NOW()) RETURNING *`,
        [eventId, message]
      );
      return res.rows[0];
    },
  },

  // ─── Raw ─────────────────────────────────────────────────────────
  $queryRaw: async (sql, ...params) => {
    const res = await pool.query(sql, params);
    return res.rows;
  },

  $disconnect: async () => {
    await pool.end();
  },
};

module.exports = db;
