import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: false,
  theme: 'light',
  loading: false,
  notifications: [],
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  search: {
    query: '',
    filters: {
      category: '',
      location: '',
      dateRange: null,
      priceRange: null,
    },
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: null,
      };
    },
    setSearchQuery: (state, action) => {
      state.search.query = action.payload;
    },
    setSearchFilters: (state, action) => {
      state.search.filters = {
        ...state.search.filters,
        ...action.payload,
      };
    },
    clearSearchFilters: (state) => {
      state.search.filters = {
        category: '',
        location: '',
        dateRange: null,
        priceRange: null,
      };
    },
    resetSearch: (state) => {
      state.search = {
        query: '',
        filters: {
          category: '',
          location: '',
          dateRange: null,
          priceRange: null,
        },
      };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  setSearchQuery,
  setSearchFilters,
  clearSearchFilters,
  resetSearch,
} = uiSlice.actions;

export default uiSlice.reducer;

