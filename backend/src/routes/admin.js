const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// @desc    Admin health check
// @route   GET /api/admin/health
// @access  Private (Admin)
router.get('/health', async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Admin authentication successful',
      data: {
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
          isVerified: req.user.is_verified
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', validate(schemas.pagination, 'query'), async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      role: req.query.role
    };

    const result = await User.findAll(options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
router.put('/users/:id', async (req, res, next) => {
  try {
    const { username, phone, role, isVerified } = req.body;

    const user = await User.updateById(req.params.id, {
      username,
      phone,
      role,
      isVerified
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
router.delete('/users/:id', async (req, res, next) => {
  try {
    const deleted = await User.deleteById(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all events (including unpublished)
// @route   GET /api/admin/events
// @access  Private (Admin)
router.get('/events', validate(schemas.pagination, 'query'), async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      category: req.query.category,
      isPublished: req.query.published ? req.query.published === 'true' : null
    };

    const result = await Event.findAll(options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
router.get('/stats', async (req, res, next) => {
  try {
    const [userStats, eventStats, bookingStats] = await Promise.all([
      User.getStats(),
      Event.getStats(),
      Booking.getStats()
    ]);

    res.json({
      success: true,
      data: {
        users: userStats,
        events: eventStats,
        bookings: bookingStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get system overview
// @route   GET /api/admin/overview
// @access  Private (Admin)
router.get('/overview', async (req, res, next) => {
  try {
    // Get recent activities, stats, etc.
    const recentUsers = await User.findAll({ limit: 5 });
    const recentEvents = await Event.findAll({ limit: 5 });
    const recentBookings = await Booking.findAll({ limit: 5 });

    res.json({
      success: true,
      data: {
        recentUsers: recentUsers.users,
        recentEvents: recentEvents.events,
        recentBookings: recentBookings.bookings
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Promote user to organizer
// @route   PATCH /api/admin/users/:id/promote
// @access  Private (Admin)
router.patch('/users/:id/promote', async (req, res, next) => {
  try {
    const user = await User.updateById(req.params.id, { role: 'organizer' });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User promoted to organizer successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify user account
// @route   PATCH /api/admin/users/:id/verify
// @access  Private (Admin)
router.patch('/users/:id/verify', async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    
    const user = await User.updateById(req.params.id, { isVerified });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete event
// @route   DELETE /api/admin/events/:id
// @access  Private (Admin)
router.delete('/events/:id', async (req, res, next) => {
  try {
    const deleted = await Event.deleteById(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
