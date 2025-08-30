const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents,
  getFeaturedEvents,
  getNearbyEvents,
  searchEvents,
  getEventsByCategory,
  getEventAnalytics,
  toggleEventPublish,
  getCategories,
  getEventStats
} = require('../controllers/eventController');

const { authenticateToken, authorizeRoles, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, validate(schemas.eventQuery, 'query'), getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/nearby', getNearbyEvents);
router.get('/search', validate(schemas.eventQuery, 'query'), searchEvents);
router.get('/categories/list', getCategories);
router.get('/category/:category', validate(schemas.eventQuery, 'query'), getEventsByCategory);
router.get('/:id', optionalAuth, getEvent);

// Protected routes - Organizer/Admin only
router.use(authenticateToken);

// Organizer routes
router.post('/', authorizeRoles('organizer', 'admin'), validate(schemas.createEvent), createEvent);
router.put('/:id', authorizeRoles('organizer', 'admin'), validate(schemas.updateEvent), updateEvent);
router.delete('/:id', authorizeRoles('organizer', 'admin'), deleteEvent);
router.patch('/:id/publish', authorizeRoles('organizer', 'admin'), toggleEventPublish);

// Organizer dashboard routes
router.get('/organizer/my-events', authorizeRoles('organizer', 'admin'), validate(schemas.pagination, 'query'), getOrganizerEvents);
router.get('/:id/analytics', authorizeRoles('organizer', 'admin'), getEventAnalytics);

// Admin only routes
router.get('/stats/overview', authorizeRoles('admin'), getEventStats);

module.exports = router;
