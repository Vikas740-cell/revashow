const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getRegistrationById,
  getOrganizerEvents,
  getOrganizerAnalytics,
  updateRegistrationStatus,
  createEventUpdate,
  getEventParticipants,
  getTrendingEvents,
  getPersonalizedRecommendations
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/organizer/analytics', protect, authorize('ORGANIZER', 'ADMIN'), getOrganizerAnalytics);
router.get('/organizer', protect, authorize('ORGANIZER', 'ADMIN'), getOrganizerEvents);
router.get('/trending', getTrendingEvents);
router.get('/recommendations', getPersonalizedRecommendations);
router.get('/:id', getEventById);
router.get('/registrations/:id', protect, getRegistrationById);
router.get('/:id/participants', protect, authorize('ORGANIZER', 'ADMIN'), getEventParticipants);

router.post('/', protect, authorize('ORGANIZER', 'ADMIN'), createEvent);
router.post('/:id/register', protect, authorize('STUDENT'), registerForEvent);
router.post('/:id/updates', protect, authorize('ORGANIZER', 'ADMIN'), createEventUpdate);
router.patch('/registrations/:id/status', protect, authorize('ORGANIZER', 'ADMIN'), updateRegistrationStatus);

module.exports = router;
