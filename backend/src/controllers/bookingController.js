const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const booking = await Booking.create(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status
    };

    const result = await Booking.findByUserId(req.user.id, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by booking ID
// @route   GET /api/bookings/:bookingId
// @access  Private
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByBookingId(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:bookingId
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const cancelled = await Booking.cancel(req.params.bookingId, userId);

    if (!cancelled) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or cannot be cancelled'
      });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event attendees (for organizers)
// @route   GET /api/bookings/events/:eventId/attendees
// @access  Private (Organizer/Admin)
const getEventAttendees = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;

    // Verify organizer access (unless admin)
    if (req.user.role !== 'admin') {
      const event = await Event.findById(eventId, false);
      if (!event || event.organizerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - you are not the organizer of this event'
        });
      }
    }

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      search: req.query.search,
      attended: req.query.attended ? req.query.attended === 'true' : null
    };

    const result = await Booking.getEventAttendees(eventId, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-in attendee
// @route   POST /api/bookings/checkin
// @access  Private (Organizer/Admin)
const checkInAttendee = async (req, res, next) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: 'QR code is required'
      });
    }

    const result = await Booking.checkIn(qrCode);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: { attendee: result.attendee }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        data: { attendee: result.attendee }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private
const getBookingStats = async (req, res, next) => {
  try {
    let stats;

    if (req.query.eventId) {
      // Event-specific stats (for organizers)
      const eventId = req.query.eventId;
      
      if (req.user.role !== 'admin') {
        const event = await Event.findById(eventId, false);
        if (!event || event.organizerId !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }

      stats = await Booking.getStats(eventId);
    } else if (req.user.role === 'admin') {
      // Global stats (admin only)
      stats = await Booking.getStats();
    } else {
      // User-specific stats
      stats = await Booking.getStats(null, req.user.id);
    }

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by transaction ID
// @route   GET /api/bookings/transaction/:transactionId
// @access  Private
const getBookingByTransaction = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.transactionId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download attendee list (CSV)
// @route   GET /api/bookings/events/:eventId/attendees/download
// @access  Private (Organizer/Admin)
const downloadAttendeeList = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;

    // Verify organizer access (unless admin)
    if (req.user.role !== 'admin') {
      const event = await Event.findById(eventId, false);
      if (!event || event.organizerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - you are not the organizer of this event'
        });
      }
    }

    // Get all attendees for the event
    const result = await Booking.getEventAttendees(eventId, { limit: 10000 });

    // Create CSV content
    const csvHeader = 'Name,Email,Phone,Gender,Ticket Type,Booking Date,Check-in Status,Check-in Time\n';
    const csvRows = result.attendees.map(attendee => {
      return [
        `"${attendee.name || ''}"`,
        `"${attendee.email || ''}"`,
        `"${attendee.phone || ''}"`,
        `"${attendee.gender || ''}"`,
        `"${attendee.ticket_type || ''}"`,
        `"${attendee.booking_date || ''}"`,
        `"${attendee.has_attended ? 'Checked In' : 'Not Checked In'}"`,
        `"${attendee.check_in_time || ''}"`
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendees-event-${eventId}.csv"`);
    
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk check-in attendees
// @route   POST /api/bookings/events/:eventId/bulk-checkin
// @access  Private (Organizer/Admin)
const bulkCheckIn = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const { qrCodes } = req.body;

    if (!Array.isArray(qrCodes) || qrCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'QR codes array is required'
      });
    }

    // Verify organizer access (unless admin)
    if (req.user.role !== 'admin') {
      const event = await Event.findById(eventId, false);
      if (!event || event.organizerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - you are not the organizer of this event'
        });
      }
    }

    const results = [];
    
    for (const qrCode of qrCodes) {
      try {
        const result = await Booking.checkIn(qrCode);
        results.push({
          qrCode,
          success: result.success,
          message: result.message,
          attendee: result.attendee
        });
      } catch (error) {
        results.push({
          qrCode,
          success: false,
          message: error.message,
          attendee: null
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      message: `Bulk check-in completed: ${successCount} successful, ${failureCount} failed`,
      data: {
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
