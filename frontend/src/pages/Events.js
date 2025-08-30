import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CalendarIcon, 
  MapPinIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import eventService from '../services/eventService';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: eventsData, isLoading, error } = useQuery(
    ['events', filters],
    () => eventService.getEvents(filters),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: categoriesData } = useQuery(
    'categories',
    () => eventService.getCategories(),
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && key !== 'limit') {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by the filter change
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const events = eventsData?.data?.events || [];
  const pagination = eventsData?.data?.pagination || {};
  const categories = categoriesData?.data?.categories || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Events
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Find amazing events happening around you. From concerts to conferences, we have it all.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events, categories, or locations..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg border-0 shadow-lg focus:ring-2 focus:ring-white focus:ring-opacity-50 placeholder-gray-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-6 py-4 bg-primary-500 hover:bg-primary-400 text-white rounded-lg transition-colors"
                >
                  <FunnelIcon className="w-5 h-5 mr-2" />
                  Filters
                </button>
                <Button type="submit" variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-50">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => setFilters({
                    search: '',
                    category: '',
                    location: '',
                    page: 1,
                    limit: 12,
                  })}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filters.search ? `Search results for "${filters.search}"` : 'All Events'}
            </h2>
            {pagination.totalEvents && (
              <p className="text-gray-600 mt-1">
                {pagination.totalEvents} events found
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            <span>Sort by: Latest</span>
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Something went wrong. Please try again.</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search criteria or browse all events.
            </p>
            <Button onClick={() => setFilters({
              search: '',
              category: '',
              location: '',
              page: 1,
              limit: 12,
            })}>
              Show All Events
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={pagination.currentPage === page ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-10 h-10"
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event }) => {
  const eventDate = new Date(event.eventStart);
  const isUpcoming = eventDate > new Date();
  const isPastEvent = eventDate < new Date();

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
        {isPastEvent && (
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
          <div className="text-sm">
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

export default Events;

