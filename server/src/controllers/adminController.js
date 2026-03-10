const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

// @desc    Get global stats for admin
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getGlobalStats = async (req, res) => {
  try {
    const [userCount, eventCount, regCount, roleRows, regStatusRows] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM "User"'),
      pool.query('SELECT COUNT(*) FROM "Event"'),
      pool.query('SELECT COUNT(*) FROM "Registration"'),
      pool.query('SELECT role, COUNT(*) as count FROM "User" GROUP BY role'),
      pool.query('SELECT status, COUNT(*) as count FROM "Registration" GROUP BY status'),
    ]);

    res.json({
      totalUsers: parseInt(userCount.rows[0].count, 10),
      totalEvents: parseInt(eventCount.rows[0].count, 10),
      totalRegistrations: parseInt(regCount.rows[0].count, 10),
      roleDistribution: roleRows.rows.map(r => ({ role: r.role, _count: parseInt(r.count, 10) })),
      registrationStats: regStatusRows.rows.map(r => ({ status: r.status, _count: parseInt(r.count, 10) })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching global stats', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.role, u.srn, u.department, u."createdAt",
        COUNT(DISTINCT r.id) as "registrationCount",
        COUNT(DISTINCT e.id) as "eventCount"
      FROM "User" u
      LEFT JOIN "Registration" r ON r."userId" = u.id
      LEFT JOIN "Event" e ON e."organizerId" = u.id
      GROUP BY u.id
      ORDER BY u."createdAt" DESC
    `);

    const users = result.rows.map(u => ({
      ...u,
      _count: {
        registrations: parseInt(u.registrationCount, 10),
        events: parseInt(u.eventCount, 10),
      },
    }));

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching users', error: error.message });
  }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res) => {
  const { role } = req.body;
  try {
    const result = await pool.query(
      'UPDATE "User" SET role = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      [role, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating role', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM "User" WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting user', error: error.message });
  }
};

// @desc    Moderate event (Approve/Reject)
// @route   PATCH /api/admin/events/:id/status
// @access  Private (Admin)
const moderateEvent = async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE "Event" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while moderating event', error: error.message });
  }
};

// @desc    Get all events (for admin listing)
// @route   GET /api/admin/events
// @access  Private (Admin)
const getAllEventsAdmin = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.*,
        c.name as "categoryName",
        u.name as "organizerName",
        u.email as "organizerEmail",
        COUNT(r.id) as "registrationCount"
      FROM "Event" e
      LEFT JOIN "Category" c ON e."categoryId" = c.id
      LEFT JOIN "User" u ON e."organizerId" = u.id
      LEFT JOIN "Registration" r ON r."eventId" = e.id
      GROUP BY e.id, c.name, u.name, u.email
      ORDER BY e."createdAt" DESC
    `);

    const events = result.rows.map(row => ({
      ...row,
      category: { name: row.categoryName },
      organizer: { name: row.organizerName, email: row.organizerEmail },
      _count: { registrations: parseInt(row.registrationCount, 10) },
    }));

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching events', error: error.message });
  }
};

module.exports = {
  getGlobalStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  moderateEvent,
  getAllEventsAdmin
};
