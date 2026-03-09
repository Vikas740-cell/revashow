const express = require('express');
const router = express.Router();
const {
  getGlobalStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  moderateEvent,
  getAllEventsAdmin
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are admin-only
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', getGlobalStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/events', getAllEventsAdmin);
router.patch('/events/:id/status', moderateEvent);

module.exports = router;
