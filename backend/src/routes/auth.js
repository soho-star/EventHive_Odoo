const express = require('express');
const {
  register,
  verifyOTPController,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');

const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validate(schemas.register), register);
router.post('/verify-otp', validate(schemas.verifyOTP), verifyOTPController);
router.post('/login', validate(schemas.login), login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(authenticateToken);

router.get('/me', getMe);
router.put('/profile', validate(schemas.updateProfile), updateProfile);
router.put('/change-password', validate(schemas.changePassword), changePassword);
router.post('/logout', logout);

module.exports = router;
