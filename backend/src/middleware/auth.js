const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-jwt-secret-key-for-development');
    
    // Get user from database
    const userQuery = 'SELECT id, username, email, role, is_verified FROM users WHERE id = ?';
    const users = await executeQuery(userQuery, [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Add user to request object
    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is verified (especially important for admin access)
    if (!req.user.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please verify your account before accessing this resource.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${roles.join(' or ')} role required.`
      });
    }

    next();
  };
};

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-jwt-secret-key-for-development');
      const userQuery = 'SELECT id, username, email, role, is_verified FROM users WHERE id = ?';
      const users = await executeQuery(userQuery, [decoded.userId]);
      
      if (users.length > 0) {
        req.user = users[0];
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuth
};
