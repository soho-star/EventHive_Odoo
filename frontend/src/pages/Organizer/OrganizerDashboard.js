import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  CalendarIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import AuroraBackground from '../../components/UI/AuroraBackground';
import eventService from '../../services/eventService';
import bookingService from '../../services/bookingService';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const OrganizerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch organizer events
      const eventsResponse = await eventService.getOrganizerEvents({ limit: 5 });
      const events = eventsResponse.data.events || [];
      setRecentEvents(events);

      // Calculate basic stats
      const publishedEvents = events.filter(event => event.isPublished);
      
      // Fetch booking stats
      let totalBookings = 0;
      let totalRevenue = 0;
      
      try {
        const bookingStatsResponse = await bookingService.getBookingStats();
        totalBookings = bookingStatsResponse.data.stats?.totalBookings || 0;
        totalRevenue = bookingStatsResponse.data.stats?.totalSpent || 0;
      } catch (error) {
        console.log('Booking stats not available');
      }

      setStats({
        totalEvents: events.length,
        publishedEvents: publishedEvents.length,
        totalBookings,
        totalRevenue
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (event) => {
    const now = new Date();
    const eventStart = new Date(event.eventStart);
    const eventEnd = new Date(event.eventEnd);

    if (!event.isPublished) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-600 text-gray-200 rounded-full">Draft</span>;
    } else if (now < eventStart) {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">Upcoming</span>;
    } else if (now >= eventStart && now <= eventEnd) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full border border-green-500/30">Live</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">Ended</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section with Aurora */}
      <AuroraBackground 
        variant="accent" 
        className="bg-gradient-to-br from-accent-600 via-primary-600 to-danger-600 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-xl text-white/90">Here's an overview of your events</p>
            </div>
            <Link to="/organizer/events/create">
              <Button className="flex items-center gap-2 bg-white text-primary-600 hover:bg-gray-50">
                <PlusIcon className="w-4 h-4" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </AuroraBackground>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
            <Card.Content className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <CalendarIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Events</p>
                  <p className="text-2xl font-semibold text-white">{stats.totalEvents}</p>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
            <Card.Content className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <EyeIcon className="w-6 h-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Published Events</p>
                  <p className="text-2xl font-semibold text-white">{stats.publishedEvents}</p>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
            <Card.Content className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Bookings</p>
                  <p className="text-2xl font-semibold text-white">{stats.totalBookings}</p>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
            <Card.Content className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Revenue</p>
                  <p className="text-2xl font-semibold text-white">
                    ${stats.totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Events */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title className="text-white">Recent Events</Card.Title>
                <Link to="/organizer/events">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">View All</Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Content>
              {recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No events yet</h3>
                  <p className="text-gray-300 mb-4">Create your first event to get started!</p>
                  <Link to="/organizer/events/create">
                    <Button size="sm">Create Event</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border border-gray-600 bg-gray-700/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-white">{event.name}</h4>
                          {getStatusBadge(event)}
                        </div>
                        <p className="text-sm text-gray-300">
                          {formatDate(event.eventStart)} • {event.category}
                        </p>
                        <p className="text-sm text-gray-400">{event.location}</p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Link to={`/events/${event.id}`}>
                          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/organizer/events/${event.id}/analytics`}>
                          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
                            <ChartBarIcon className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
            <Card.Header>
              <Card.Title className="text-white">Quick Actions</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <Link to="/organizer/events/create" className="block">
                  <div className="p-4 border border-gray-600 bg-gray-700/30 rounded-lg hover:border-primary-500/50 hover:bg-primary-500/10 transition-colors">
                    <div className="flex items-center">
                      <div className="p-2 bg-primary-500/20 rounded-lg">
                        <PlusIcon className="w-6 h-6 text-primary-400" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-white">Create New Event</h4>
                        <p className="text-sm text-gray-300">Set up a new event and start selling tickets</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link to="/organizer/events" className="block">
                  <div className="p-4 border border-gray-600 bg-gray-700/30 rounded-lg hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <CalendarIcon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-white">Manage Events</h4>
                        <p className="text-sm text-gray-300">View and manage all your events</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link to="/dashboard/profile" className="block">
                  <div className="p-4 border border-gray-600 bg-gray-700/30 rounded-lg hover:border-green-500/50 hover:bg-green-500/10 transition-colors">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <UsersIcon className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-white">Update Profile</h4>
                        <p className="text-sm text-gray-300">Manage your organizer profile</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;

