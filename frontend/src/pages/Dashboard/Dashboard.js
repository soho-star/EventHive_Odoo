import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { 
  CalendarIcon, 
  TicketIcon, 
  ChartBarIcon, 
  UserIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import bookingService from '../../services/bookingService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const { data: bookingsData, isLoading } = useQuery(
    'my-bookings',
    () => bookingService.getMyBookings({ limit: 5 }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: statsData } = useQuery(
    'booking-stats',
    () => bookingService.getBookingStats(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const recentBookings = bookingsData?.data?.bookings || [];
  const stats = statsData?.data || {};

  const dashboardCards = [
    {
      title: 'My Bookings',
      value: stats.totalBookings || 0,
      icon: TicketIcon,
      href: '/dashboard/bookings',
      color: 'bg-blue-500',
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents || 0,
      icon: CalendarIcon,
      href: '/dashboard/bookings',
      color: 'bg-green-500',
    },
    {
      title: 'Past Events',
      value: stats.pastEvents || 0,
      icon: ChartBarIcon,
      href: '/dashboard/bookings',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your events and bookings.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <Link key={index} to={card.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Card.Content className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {card.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title>Recent Bookings</Card.Title>
                <Link to="/dashboard/bookings">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card.Header>
            
            <Card.Content>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <TicketIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No bookings yet</p>
                  <Link to="/events">
                    <Button size="sm">
                      Browse Events
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.bookingId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {booking.event.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.event.eventStart).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {booking.attendees.length} ticket{booking.attendees.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-gray-600">
                          ${booking.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Quick Actions */}
          <Card>
            <Card.Header>
              <Card.Title>Quick Actions</Card.Title>
              <Card.Description>
                Common tasks and shortcuts
              </Card.Description>
            </Card.Header>
            
            <Card.Content>
              <div className="space-y-4">
                <Link to="/events">
                  <div className="flex items-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors cursor-pointer">
                    <CalendarIcon className="w-8 h-8 text-primary-600 mr-4" />
                    <div>
                      <h4 className="font-medium text-primary-900">Browse Events</h4>
                      <p className="text-sm text-primary-700">Discover new events in your area</p>
                    </div>
                  </div>
                </Link>

                <Link to="/dashboard/profile">
                  <div className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <UserIcon className="w-8 h-8 text-gray-600 mr-4" />
                    <div>
                      <h4 className="font-medium text-gray-900">Update Profile</h4>
                      <p className="text-sm text-gray-600">Manage your account settings</p>
                    </div>
                  </div>
                </Link>

                {(user?.role === 'organizer' || user?.role === 'admin') && (
                  <Link to="/organizer/events/create">
                    <div className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer">
                      <PlusIcon className="w-8 h-8 text-green-600 mr-4" />
                      <div>
                        <h4 className="font-medium text-green-900">Create Event</h4>
                        <p className="text-sm text-green-700">Start organizing your next event</p>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Organizer Section */}
        {(user?.role === 'organizer' || user?.role === 'admin') && (
          <div className="mt-8">
            <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <Card.Content className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Ready to create your next event?
                    </h3>
                    <p className="text-primary-100">
                      Use our powerful event management tools to create and manage amazing events.
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <Link to="/organizer">
                      <Button variant="secondary" className="bg-white text-primary-600 hover:bg-gray-50">
                        Organizer Dashboard
                      </Button>
                    </Link>
                    <Link to="/organizer/events/create">
                      <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                        Create Event
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

