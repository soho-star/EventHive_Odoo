import api from './api';

const uploadService = {
  // Upload profile image
  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const response = await api.post('/upload/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload event poster
  uploadEventPoster: async (file) => {
    const formData = new FormData();
    formData.append('eventPoster', file);
    
    const response = await api.post('/upload/event-poster', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload multiple event images
  uploadEventImages: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('eventImages', file);
    });
    
    const response = await api.post('/upload/event-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete uploaded file
  deleteFile: async (filename) => {
    const response = await api.delete(`/upload/${filename}`);
    return response.data;
  },
};

export default uploadService;

