const Joi = require('joi');

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorDetails
      });
    }

    // Replace the original property with the validated value
    req[property] = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // User registration
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid('user', 'organizer').default('user')
  }),

  // User login
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // OTP verification
  verifyOTP: Joi.object({
    userId: Joi.number().integer().positive().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
    type: Joi.string().valid('registration', 'password_reset').required()
  }),

  // Event creation
  createEvent: Joi.object({
    name: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(5000).allow('').default(''),
    category: Joi.string().valid(
      'technology', 'music', 'business', 'sports', 
      'art', 'education', 'food', 'health', 'other'
    ).required(),
    eventStart: Joi.date().iso().required(),
    eventEnd: Joi.date().iso().greater(Joi.ref('eventStart')).required(),
    registrationStart: Joi.date().iso().required(),
    registrationEnd: Joi.date().iso().greater(Joi.ref('registrationStart')).required(),
    location: Joi.string().min(5).max(300).required(),
    latitude: Joi.number().min(-90).max(90).allow(null).default(null),
    longitude: Joi.number().min(-180).max(180).allow(null).default(null),
    ticketTypes: Joi.array().items(
      Joi.object({
        typeName: Joi.string().min(1).max(100).required(),
        price: Joi.number().min(0).max(999999.99).default(0),
        maxPerUser: Joi.number().integer().min(1).max(100).default(1),
        maxTotal: Joi.number().integer().min(1).max(100000).required(),
        saleStart: Joi.date().iso().allow(null).default(null),
        saleEnd: Joi.date().iso().allow(null).default(null)
      })
    ).min(1).required()
  }),

  // Event update
  updateEvent: Joi.object({
    name: Joi.string().min(3).max(200),
    description: Joi.string().max(5000).allow(''),
    category: Joi.string().valid(
      'technology', 'music', 'business', 'sports', 
      'art', 'education', 'food', 'health', 'other'
    ),
    eventStart: Joi.date().iso().greater('now'),
    eventEnd: Joi.date().iso().greater(Joi.ref('eventStart')),
    registrationStart: Joi.date().iso(),
    registrationEnd: Joi.date().iso().greater(Joi.ref('registrationStart')),
    location: Joi.string().min(5).max(300),
    latitude: Joi.number().min(-90).max(90).allow(null),
    longitude: Joi.number().min(-180).max(180).allow(null),
    isPublished: Joi.boolean()
  }).min(1),

  // Booking creation
  createBooking: Joi.object({
    eventId: Joi.number().integer().positive().required(),
    ticketId: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(1).max(10).default(1),
    attendees: Joi.array().items(
      Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow(''),
        gender: Joi.string().valid('male', 'female', 'other').allow('')
      })
    ).min(1).required()
  }),

  // Profile update
  updateProfile: Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    profileImageUrl: Joi.string().uri().allow('')
  }).min(1),

  // Change password
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required()
  }),

  // Query parameters
  eventQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(12),
    category: Joi.string(),
    location: Joi.string(),
    search: Joi.string().max(100),
    dateFrom: Joi.date().iso(),
    dateTo: Joi.date().iso().greater(Joi.ref('dateFrom')),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    radius: Joi.number().min(1).max(1000).default(50)
  }),

  // Pagination parameters
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),

  // Create event
  createEvent: Joi.object({
    name: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(5000),
    category: Joi.string().valid(
      'technology', 'music', 'business', 'sports', 
      'art', 'education', 'food', 'health', 'other'
    ).required(),
    eventStart: Joi.date().iso().greater('now').required(),
    eventEnd: Joi.date().iso().greater(Joi.ref('eventStart')).required(),
    registrationStart: Joi.date().iso().default(new Date()),
    registrationEnd: Joi.date().iso().less(Joi.ref('eventStart')).required(),
    location: Joi.string().min(5).max(300).required(),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    posterUrl: Joi.string().uri(),
    additionalImages: Joi.array().items(Joi.string().uri()).max(10),
    ticketTypes: Joi.array().items(
      Joi.object({
        typeName: Joi.string().min(1).max(100).required(),
        price: Joi.number().min(0).precision(2).required(),
        maxPerUser: Joi.number().integer().min(1).default(1),
        maxTotal: Joi.number().integer().min(1).required(),
        saleStart: Joi.date().iso(),
        saleEnd: Joi.date().iso()
      })
    ).min(1).required()
  }),

  // Update event
  updateEvent: Joi.object({
    name: Joi.string().min(3).max(200),
    description: Joi.string().max(5000).allow(''),
    category: Joi.string().valid(
      'technology', 'music', 'business', 'sports', 
      'art', 'education', 'food', 'health', 'other'
    ),
    eventStart: Joi.date().iso().greater('now'),
    eventEnd: Joi.date().iso().greater(Joi.ref('eventStart')),
    registrationStart: Joi.date().iso(),
    registrationEnd: Joi.date().iso(),
    location: Joi.string().min(5).max(300),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    posterUrl: Joi.string().uri().allow(''),
    additionalImages: Joi.array().items(Joi.string().uri()).max(10),
    isPublished: Joi.boolean()
  }).min(1)
};

module.exports = {
  validate,
  schemas
};
