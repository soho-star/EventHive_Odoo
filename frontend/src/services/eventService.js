import api from './api';

const eventService = {
  // Get all events
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  // Get single event
  getEvent: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Create event (Organizer/Admin)
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  // Update event (Organizer/Admin)
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  // Delete event (Organizer/Admin)
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Get featured events
  getFeaturedEvents: async () => {
    const response = await api.get('/events/featured');
    return response.data;
  },

  // Get nearby events
  getNearbyEvents: async (params = {}) => {
    const response = await api.get('/events/nearby', { params });
    return response.data;
  },

  // Search events
  searchEvents: async (params = {}) => {
    const response = await api.get('/events/search', { params });
    return response.data;
  },

  // Get events by category
  getEventsByCategory: async (category, params = {}) => {
    const response = await api.get(`/events/category/${category}`, { params });
    return response.data;
  },

  // Get organizer events
  getOrganizerEvents: async (params = {}) => {
    const response = await api.get('/events/organizer/my-events', { params });
    return response.data;
  },

  // Get event analytics (Organizer/Admin)
  getEventAnalytics: async (id) => {
    const response = await api.get(`/events/${id}/analytics`);
    return response.data;
  },

  // Toggle event publish status
  toggleEventPublish: async (id) => {
    const response = await api.patch(`/events/${id}/publish`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/events/categories/list');
    return response.data;
  },

  // Get event stats (Admin)
  getEventStats: async () => {
    const response = await api.get('/events/stats/overview');
    return response.data;
  },
};

export default eventService;

