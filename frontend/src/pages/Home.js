import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  SparklesIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import eventService from '../services/eventService';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch featured events
  const { data: featuredEvents, isLoading: featuredLoading } = useQuery(
    'featured-events',
    () => eventService.getFeaturedEvents(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch recent events
  const { data: recentEvents, isLoading: recentLoading } = useQuery(
    'recent-events',
    () => eventService.getEvents({ limit: 6, sort: 'created_at' }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to events page with search query
      window.location.href = `/events?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const features = [
    {
      icon: CalendarIcon,
      title: 'Easy Event Creation',
      description: 'Create and manage events with our intuitive interface. Set up tickets, pricing, and registration in minutes.',
    },
    {
      icon: UsersIcon,
      title: 'Seamless Booking',
      description: 'Simple and secure booking process for attendees. QR code tickets and instant confirmations.',
    },
    {
      icon: SparklesIcon,
      title: 'Real-time Analytics',
      description: 'Track your event performance with detailed analytics, attendee insights, and revenue reports.',
    },
    {
      icon: MapPinIcon,
      title: 'Location Discovery',
      description: 'Find events near you with our location-based search and personalized recommendations.',
    },
  ];

  const stats = [
    { label: 'Events Created', value: '10,000+' },
    { label: 'Happy Attendees', value: '500,000+' },
    { label: 'Event Organizers', value: '5,000+' },
    { label: 'Cities Covered', value: '100+' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Discover Amazing
              <span className="block gradient-text">Events Near You</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              EventHive connects you with incredible experiences. Create, discover, and attend events that matter to you.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for events, categories, or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-xl border-0 shadow-lg focus:ring-2 focus:ring-white focus:ring-opacity-50 placeholder-gray-500"
                  />
                </div>
                <Button 
                  type="submit"
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary-600 hover:bg-gray-50 px-8"
                >
                  Search Events
                </Button>
              </form>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/events">
                <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-50">
                  Browse Events
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                  Start Organizing
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white bg-opacity-10 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover handpicked events that are trending in your area
            </p>
          </div>

          {featuredLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredEvents?.data?.events?.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} featured />
              )) || (
                <div className="col-span-full text-center text-gray-500">
                  No featured events available
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <Link to="/events">
              <Button size="lg" variant="primary">
                View All Events
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EventHive?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create, manage, and attend amazing events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fresh events added by our community of organizers
            </p>
          </div>

          {recentLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentEvents?.data?.events?.map((event) => (
                <EventCard key={event.id} event={event} />
              )) || (
                <div className="col-span-full text-center text-gray-500">
                  No recent events available
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Join thousands of event organizers and attendees who trust EventHive for their event management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-50">
                Create Your First Event
              </Button>
            </Link>
            <Link to="/events">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                Explore Events
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, featured = false }) => {
  const eventDate = new Date(event.eventStart);
  const isUpcoming = eventDate > new Date();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        {event.posterUrl ? (
          <img
            src={event.posterUrl}
            alt={event.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <CalendarIcon className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        {featured && (
          <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <StarIcon className="w-4 h-4 mr-1" />
            Featured
          </div>
        )}
        {!isUpcoming && (
          <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-75 text-white px-3 py-1 rounded-full text-sm font-medium">
            Past Event
          </div>
        )}
      </div>

      <Card.Content className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <CalendarIcon className="w-4 h-4 mr-2" />
          {eventDate.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.name}
        </h3>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPinIcon className="w-4 h-4 mr-2" />
          {event.location}
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {event.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-primary-600">
              {event.ticketTypes?.[0]?.price === 0 ? 'Free' : `$${event.ticketTypes?.[0]?.price}`}
            </span>
          </div>
          <Link to={`/events/${event.id}`}>
            <Button size="sm" variant="primary">
              View Details
            </Button>
          </Link>
        </div>
      </Card.Content>
    </Card>
  );
};

export default Home;

