const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getEventAttendees,
  checkInAttendee,
  getBookingStats,
  getBookingByTransaction,
  downloadAttendeeList,
  bulkCheckIn
} = require('../controllers/bookingController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// All booking routes require authentication
router.use(authenticateToken);

// User booking routes
router.post('/', validate(schemas.createBooking), createBooking);
router.get('/my-bookings', validate(schemas.pagination, 'query'), getMyBookings);
router.get('/stats', getBookingStats);
router.get('/transaction/:transactionId', getBookingByTransaction);
router.get('/:bookingId', getBooking);
router.delete('/:bookingId', cancelBooking);

// Organizer/Admin routes for event management
router.get('/events/:eventId/attendees', authorizeRoles('organizer', 'admin'), getEventAttendees);
router.get('/events/:eventId/attendees/download', authorizeRoles('organizer', 'admin'), downloadAttendeeList);
router.post('/events/:eventId/bulk-checkin', authorizeRoles('organizer', 'admin'), bulkCheckIn);

// Check-in routes (organizer/admin)
router.post('/checkin', authorizeRoles('organizer', 'admin'), checkInAttendee);

module.exports = router;
