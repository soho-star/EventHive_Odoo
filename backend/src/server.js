require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import database connection
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
const uploadDir = process.env.UPLOAD_PATH || 'uploads';
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'EventHive Backend API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      bookings: '/api/bookings',
      admin: '/api/admin',
      upload: '/api/upload'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected' // TODO: Add actual database health check
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// API Documentation route (placeholder)
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'EventHive API Documentation',
    version: '1.0.0',
    endpoints: {
      authentication: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/verify-otp': 'Verify OTP',
        'GET /api/auth/me': 'Get current user',
        'PUT /api/auth/profile': 'Update user profile',
        'PUT /api/auth/change-password': 'Change password',
        'POST /api/auth/forgot-password': 'Request password reset',
        'POST /api/auth/reset-password': 'Reset password',
        'POST /api/auth/logout': 'Logout user'
      },
      events: {
        'GET /api/events': 'Get all events',
        'GET /api/events/:id': 'Get single event',
        'POST /api/events': 'Create event (Organizer/Admin)',
        'PUT /api/events/:id': 'Update event (Organizer/Admin)',
        'DELETE /api/events/:id': 'Delete event (Organizer/Admin)',
        'GET /api/events/featured': 'Get featured events',
        'GET /api/events/nearby': 'Get nearby events',
        'GET /api/events/search': 'Search events',
        'GET /api/events/category/:category': 'Get events by category',
        'GET /api/events/:id/analytics': 'Get event analytics (Organizer/Admin)'
      },
      bookings: {
        'POST /api/bookings': 'Create booking',
        'GET /api/bookings/my-bookings': 'Get user bookings',
        'GET /api/bookings/:bookingId': 'Get booking details',
        'DELETE /api/bookings/:bookingId': 'Cancel booking',
        'GET /api/bookings/events/:eventId/attendees': 'Get event attendees (Organizer/Admin)',
        'POST /api/bookings/checkin': 'Check-in attendee (Organizer/Admin)'
      },
      admin: {
        'GET /api/admin/users': 'Get all users (Admin)',
        'GET /api/admin/events': 'Get all events (Admin)',
        'GET /api/admin/stats': 'Get system statistics (Admin)',
        'PUT /api/admin/users/:id': 'Update user (Admin)',
        'DELETE /api/admin/users/:id': 'Delete user (Admin)'
      },
      upload: {
        'POST /api/upload/profile': 'Upload profile image',
        'POST /api/upload/event-poster': 'Upload event poster',
        'POST /api/upload/event-images': 'Upload event images',
        'DELETE /api/upload/:filename': 'Delete uploaded file'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: [
      '/api/auth',
      '/api/events', 
      '/api/bookings',
      '/api/admin',
      '/api/upload',
      '/api/docs'
    ]
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    console.log('🔄 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      console.log('✅ Database connection successful');
    } else {
      console.log('⚠️  Database connection failed - running in API-only mode');
    }

    app.listen(PORT, () => {
      console.log(`🚀 EventHive Backend Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📋 Available endpoints:');
        console.log('   Authentication: /api/auth');
        console.log('   Events: /api/events');
        console.log('   Bookings: /api/bookings');
        console.log('   Admin: /api/admin');
        console.log('   File Upload: /api/upload');
        console.log('\n🔗 Frontend URL: http://localhost:3000');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();