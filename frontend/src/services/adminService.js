import api from './api';

const adminService = {
  // Get all users
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Get user by ID
  getUser: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Get all events (including unpublished)
  getEvents: async (params = {}) => {
    const response = await api.get('/admin/events', { params });
    return response.data;
  },

  // Get system statistics
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get system overview
  getOverview: async () => {
    const response = await api.get('/admin/overview');
    return response.data;
  },

  // Promote user to organizer
  promoteUser: async (id) => {
    const response = await api.patch(`/admin/users/${id}/promote`);
    return response.data;
  },

  // Verify user account
  verifyUser: async (id, isVerified) => {
    const response = await api.patch(`/admin/users/${id}/verify`, { isVerified });
    return response.data;
  },
};

export default adminService;

