import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';

// Layout Components
import Layout from './components/Layout/Layout';
import AuthLayout from './components/Layout/AuthLayout';
import AdminLayout from './components/Layout/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import About from './pages/About';
import Contact from './pages/Contact';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyOTP from './pages/Auth/VerifyOTP';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// User Dashboard Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Dashboard/Profile';
import MyBookings from './pages/Dashboard/MyBookings';
import BookingDetails from './pages/Dashboard/BookingDetails';

// Organizer Pages
import OrganizerDashboard from './pages/Organizer/OrganizerDashboard';
import CreateEvent from './pages/Organizer/CreateEvent';
import EditEvent from './pages/Organizer/EditEvent';
import MyEvents from './pages/Organizer/MyEvents';
import EventAnalytics from './pages/Organizer/EventAnalytics';
import EventAttendees from './pages/Organizer/EventAttendees';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminEvents from './pages/Admin/AdminEvents';
import AdminStats from './pages/Admin/AdminStats';

// Booking Pages
import BookEvent from './pages/BookEvent';

// Components
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';
import NotFound from './pages/NotFound';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is authenticated and token exists
    if (token && isAuthenticated) {
      dispatch(getMe());
    }
  }, [dispatch, token, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-otp" element={<VerifyOTP />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Booking Routes */}
        <Route 
          path="/book/:eventId" 
          element={
            <ProtectedRoute>
              <Layout>
                <BookEvent />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* User Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="bookings/:bookingId" element={<BookingDetails />} />
        </Route>

        {/* Organizer Routes */}
        <Route 
          path="/organizer" 
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OrganizerDashboard />} />
          <Route path="events" element={<MyEvents />} />
          <Route path="events/create" element={<CreateEvent />} />
          <Route path="events/:id/edit" element={<EditEvent />} />
          <Route path="events/:id/analytics" element={<EventAnalytics />} />
          <Route path="events/:id/attendees" element={<EventAttendees />} />
        </Route>

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="stats" element={<AdminStats />} />
        </Route>

        {/* Redirect /auth to /auth/login */}
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;

