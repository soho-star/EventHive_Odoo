import api from './api';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (otpData) => {
    const response = await api.post('/auth/verify-otp', otpData);
    return response.data;
  },

  // Login user
  login: async (userData) => {
    const response = await api.post('/auth/login', userData);
    return response.data;
  },

  // Get current user
  getMe: async (token) => {
    const response = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData, token) => {
    const response = await api.put('/auth/profile', profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Change password
  changePassword: async (passwordData, token) => {
    const response = await api.put('/auth/change-password', passwordData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (resetData) => {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  },

  // Logout user
  logout: async (token) => {
    const response = await api.post('/auth/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default authService;

