const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { executeQuery } = require('../config/database');

// Generate JWT token
const generateToken = (userId, username, email, role) => {
  return jwt.sign(
    { userId, username, email, role },
    process.env.JWT_SECRET || 'fallback-jwt-secret-key-for-development',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate OTP (6-digit number)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in database (in a real app, you might use Redis for this)
const storeOTP = async (userId, otp, type) => {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  // First, delete any existing OTP sessions of the same type for this user
  await executeQuery(
    'DELETE FROM user_sessions WHERE user_id = ? AND device_info = ?', 
    [userId, type]
  );
  
  // Then insert the new OTP session
  const query = `
    INSERT INTO user_sessions (user_id, session_token, expires_at, device_info)
    VALUES (?, ?, ?, ?)
  `;
  
  await executeQuery(query, [userId, `${type}:${otp}`, expiresAt, type]);
};

// Verify OTP
const verifyOTP = async (userId, otp, type) => {
  const query = `
    SELECT * FROM user_sessions 
    WHERE user_id = ? AND session_token = ? AND expires_at > NOW()
  `;
  
  const sessions = await executeQuery(query, [userId, `${type}:${otp}`]);
  
  if (sessions.length > 0) {
    // Delete the OTP session after verification
    await executeQuery('DELETE FROM user_sessions WHERE id = ?', [sessions[0].id]);
    return true;
  }
  
  return false;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { username, email, phone, password, role } = req.body;

    // Check if user already exists
    const [emailExists, usernameExists] = await Promise.all([
      User.emailExists(email),
      User.usernameExists(username)
    ]);

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Create user
    const user = await User.create({ username, email, phone, password, role });

    // Generate and send OTP
    const otp = generateOTP();
    await storeOTP(user.id, otp, 'registration');

    // In a real app, send OTP via email/SMS
    console.log(`Registration OTP for ${email}: ${otp}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your account with the OTP sent to your email.',
      data: {
        userId: user.id,
        email: user.email,
        otpSent: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTPController = async (req, res, next) => {
  try {
    const { userId, otp, type } = req.body;

    // Verify OTP
    const isValid = await verifyOTP(userId, otp, type);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Get user and mark as verified
    const user = await User.updateById(userId, { isVerified: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username, user.email, user.role);

    res.json({
      success: true,
      message: 'Account verified successfully',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Get password hash and verify
    const passwordHash = await User.getPasswordHash(user.id);
    const isPasswordValid = await User.verifyPassword(password, passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate and send new OTP
      const otp = generateOTP();
      await storeOTP(user.id, otp, 'registration');

      console.log(`Verification OTP for ${email}: ${otp}`);

      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please check your email for verification OTP.',
        data: {
          userId: user.id,
          requiresVerification: true
        }
      });
    }

    // Check if admin user is trying to access admin routes
    if (user.role === 'admin') {
      // Additional verification for admin users
      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Admin account must be verified before login. Please contact system administrator.',
          data: {
            userId: user.id,
            requiresVerification: true
          }
        });
      }
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username, user.email, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          profileImageUrl: user.profileImageUrl
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          profileImageUrl: user.profileImageUrl,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { username, phone, profileImageUrl } = req.body;

    // Check if username is taken by another user
    if (username) {
      const usernameExists = await User.usernameExists(username, req.user.id);
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // Update user
    const user = await User.updateById(req.user.id, {
      username,
      phone,
      profileImageUrl
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          profileImageUrl: user.profileImageUrl
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current password hash and verify
    const passwordHash = await User.getPasswordHash(req.user.id);
    const isCurrentPasswordValid = await User.verifyPassword(currentPassword, passwordHash);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await User.changePassword(req.user.id, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Generate and send OTP
    const otp = generateOTP();
    await storeOTP(user.id, otp, 'password_reset');

    // In a real app, send OTP via email
    console.log(`Password reset OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: 'Password reset OTP sent to your email',
      data: {
        userId: user.id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { userId, otp, newPassword } = req.body;

    // Verify OTP
    const isValid = await verifyOTP(userId, otp, 'password_reset');

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update password
    await User.changePassword(userId, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can blacklist the token or clear any server-side sessions
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyOTPController,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
};
