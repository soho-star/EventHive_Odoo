const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      category: req.query.category,
      location: req.query.location,
      search: req.query.search,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      latitude: req.query.latitude ? parseFloat(req.query.latitude) : null,
      longitude: req.query.longitude ? parseFloat(req.query.longitude) : null,
      radius: parseInt(req.query.radius) || 50,
      isPublished: true
    };

    const result = await Event.findAll(options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only show published events to public
    if (!event.isPublished && (!req.user || req.user.id !== event.organizerId)) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer/Admin)
const createEvent = async (req, res, next) => {
  try {
    console.log('📝 Create Event Request Body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User:', req.user.id, req.user.role);
    
    const eventData = {
      ...req.body,
      organizerId: req.user.id
    };

    const event = await Event.create(eventData, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error) {
    console.error('❌ Create Event Error:', error.message);
    if (error.details) {
      console.error('🚨 Validation Details:', error.details);
    }
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer/Admin)
const updateEvent = async (req, res, next) => {
  try {
    const organizerId = req.user.role === 'admin' ? null : req.user.id;
    const event = await Event.updateById(req.params.id, req.body, organizerId);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer/Admin)
const deleteEvent = async (req, res, next) => {
  try {
    const organizerId = req.user.role === 'admin' ? null : req.user.id;
    const deleted = await Event.deleteById(req.params.id, organizerId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organizer's events
// @route   GET /api/events/organizer/my-events
// @access  Private (Organizer/Admin)
const getOrganizerEvents = async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      organizerId: req.user.id,
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
};

// @desc    Get featured events
// @route   GET /api/events/featured
// @access  Public
const getFeaturedEvents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const events = await Event.getFeatured(limit);

    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby events
// @route   GET /api/events/nearby
// @access  Public
const getNearbyEvents = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 50, limit = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const events = await Event.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(radius),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search events
// @route   GET /api/events/search
// @access  Public
const searchEvents = async (req, res, next) => {
  try {
    const { q: searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      search: searchTerm,
      category: req.query.category,
      location: req.query.location,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    };

    const result = await Event.search(searchTerm, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events by category
// @route   GET /api/events/category/:category
// @access  Public
const getEventsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      location: req.query.location,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    };

    const result = await Event.findByCategory(category, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event analytics
// @route   GET /api/events/:id/analytics
// @access  Private (Organizer/Admin)
const getEventAnalytics = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const organizerId = req.user.role === 'admin' ? null : req.user.id;

    const analytics = await Event.getAnalytics(eventId, organizerId);

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish/Unpublish event
// @route   PATCH /api/events/:id/publish
// @access  Private (Organizer/Admin)
const toggleEventPublish = async (req, res, next) => {
  try {
    const { isPublished } = req.body;
    const organizerId = req.user.role === 'admin' ? null : req.user.id;

    const event = await Event.updateById(
      req.params.id,
      { isPublished },
      organizerId
    );

    res.json({
      success: true,
      message: `Event ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event categories
// @route   GET /api/events/categories/list
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = [
      { value: 'technology', label: 'Technology' },
      { value: 'music', label: 'Music' },
      { value: 'business', label: 'Business' },
      { value: 'sports', label: 'Sports' },
      { value: 'art', label: 'Art & Culture' },
      { value: 'education', label: 'Education' },
      { value: 'food', label: 'Food & Drink' },
      { value: 'health', label: 'Health & Wellness' },
      { value: 'other', label: 'Other' }
    ];

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event statistics
// @route   GET /api/events/stats/overview
// @access  Private (Admin)
const getEventStats = async (req, res, next) => {
  try {
    const stats = await Event.getStats();

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
