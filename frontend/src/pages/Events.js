import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CalendarIcon, 
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import eventService from '../services/eventService';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EventMap from '../components/UI/EventMap';


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
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'search'); // 'search', 'map'

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
    // Update URL params when filters or view mode change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && key !== 'limit') {
        params.set(key, value.toString());
      }
    });
    if (viewMode !== 'search') {
      params.set('view', viewMode);
    }
    setSearchParams(params);
  }, [filters, viewMode, setSearchParams]);

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



  // Event Card Component
  const EventCard = ({ event }) => {
    const eventDate = new Date(event.eventStart);
    const isUpcoming = eventDate > new Date();

    return (
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-gray-800/50 backdrop-blur-sm border-gray-700 group">
        <div className="aspect-video relative overflow-hidden">
          {event.posterUrl ? (
            <img
              src={event.posterUrl}
              alt={event.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {event.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              isUpcoming 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              {isUpcoming ? 'Upcoming' : 'Past'}
            </span>
          </div>
        </div>

        <Card.Content className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
              {event.name}
            </h3>
            <p className="text-sm text-gray-300 capitalize">
              {event.category}
            </p>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center text-sm text-gray-300">
              <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
              {eventDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
              {event.location}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {event.ticketTypes && event.ticketTypes.length > 0 ? (
                <span className="text-lg font-bold text-primary-400">
                  {Math.min(...event.ticketTypes.map(t => t.price)) === 0 
                    ? 'Free' 
                    : `From $${Math.min(...event.ticketTypes.map(t => t.price))}`
                  }
                </span>
              ) : (
                <span className="text-gray-400">No tickets</span>
              )}
            </div>
            <Link to={`/events/${event.id}`}>
              <Button size="sm" className="bg-primary-500 hover:bg-primary-600 text-white">
                View Details
              </Button>
            </Link>
          </div>
        </Card.Content>
      </Card>
    );
  };

  return (
    <div className="min-h-screen text-white">

      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Discover Events
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-12">
              Find amazing events happening around you. From concerts to conferences, we have it all.
            </p>
            
            {/* Search/Map Mode Toggle */}
            <div className="max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('search')}
                    className={`flex items-center justify-center px-8 py-4 rounded-full transition-all duration-300 font-medium ${
                      viewMode === 'search'
                        ? 'bg-white text-primary-600 shadow-lg'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                    Search Events
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('map')}
                    className={`flex items-center justify-center px-8 py-4 rounded-full transition-all duration-300 font-medium ${
                      viewMode === 'map'
                        ? 'bg-white text-primary-600 shadow-lg'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <MapIcon className="w-5 h-5 mr-2" />
                    Map View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {viewMode === 'search' ? (
          <>
            {/* Search Interface */}
            <div className="mb-8">
              <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search events, categories, or locations..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white placeholder-gray-400 focus:border-primary-500 h-12 text-base"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
                        showFilters 
                          ? 'bg-primary-500 text-white shadow-lg'
                          : 'bg-gray-800/50 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <FunnelIcon className="w-5 h-5 mr-2" />
                      Filters
                    </button>
                    <Button 
                      type="submit" 
                      className="px-6 py-3 bg-primary-500 text-white hover:bg-primary-600 font-medium rounded-lg transition-all duration-200"
                    >
                      <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-600 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter location"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFilters({
                          search: '',
                          category: '',
                          location: '',
                          page: 1,
                          limit: 12,
                        });
                        setShowFilters(false);
                      }}
                      className="w-full border-gray-600 bg-transparent text-white hover:bg-gray-700"
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
                <h2 className="text-2xl font-bold text-white">
                  {filters.search ? `Search results for "${filters.search}"` : 'All Events'}
                </h2>
                {pagination.totalEvents && (
                  <p className="text-gray-300 mt-1">
                    {pagination.totalEvents} events found
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                <span>Sort by: Latest</span>
              </div>
            </div>

            {/* Events Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="text-gray-300 mt-4">Loading events...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">Error loading events: {error.message}</p>
                <p className="text-gray-300 mb-4">Please check your connection and try again.</p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No events found</h3>
                <p className="text-gray-300 mb-6">
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
                      className="border-gray-600 bg-transparent text-white hover:bg-gray-700 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === pagination.totalPages || 
                          Math.abs(page - pagination.currentPage) <= 2
                        )
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 py-1 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 rounded transition-colors ${
                                page === pagination.currentPage
                                  ? 'bg-primary-500 text-white'
                                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        ))}
                    </div>

                    <Button
                      variant="outline"
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      className="border-gray-600 bg-transparent text-white hover:bg-gray-700 disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* Map View */
          <div className="h-[600px] rounded-xl overflow-hidden border border-gray-600">
            <EventMap
              initialFilters={filters}
              height="600px"
              showControls={true}
              showUserLocation={true}
              className="w-full h-full"
              events={events}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;