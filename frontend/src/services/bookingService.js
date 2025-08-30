import api from './api';

const bookingService = {
  // Create booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Get user bookings
  getMyBookings: async (params = {}) => {
    const response = await api.get('/bookings/my-bookings', { params });
    return response.data;
  },

  // Get booking details
  getBooking: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  },

  // Get booking stats
  getBookingStats: async () => {
    const response = await api.get('/bookings/stats');
    return response.data;
  },

  // Get booking by transaction ID
  getBookingByTransaction: async (transactionId) => {
    const response = await api.get(`/bookings/transaction/${transactionId}`);
    return response.data;
  },

  // Get event attendees (Organizer/Admin)
  getEventAttendees: async (eventId, params = {}) => {
    const response = await api.get(`/bookings/events/${eventId}/attendees`, { params });
    return response.data;
  },

  // Download attendee list (Organizer/Admin)
  downloadAttendeeList: async (eventId) => {
    const response = await api.get(`/bookings/events/${eventId}/attendees/download`, {
      responseType: 'blob',
    });
    return response;
  },

  // Bulk check-in (Organizer/Admin)
  bulkCheckIn: async (eventId, attendeeIds) => {
    const response = await api.post(`/bookings/events/${eventId}/bulk-checkin`, {
      attendeeIds,
    });
    return response.data;
  },

  // Check-in attendee (Organizer/Admin)
  checkInAttendee: async (qrCode) => {
    const response = await api.post('/bookings/checkin', { qrCode });
    return response.data;
  },
};

export default bookingService;

