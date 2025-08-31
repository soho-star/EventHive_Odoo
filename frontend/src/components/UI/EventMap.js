import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { 
  MapIcon, 
  ListBulletIcon, 
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import MapComponent from './MapComponent';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import eventService from '../../services/eventService';
import locationService from '../../services/locationService';

const EventMap = ({ 
  initialFilters = {}, 
  height = '500px',
  showControls = true,
  showUserLocation = true,
  className = '',
  events = []
}) => {
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    radius: 25, // km
    ...initialFilters
  });
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Get user location on component mount
  useEffect(() => {
    if (showUserLocation) {
      locationService.getCurrentLocation()
        .then(location => {
          setUserLocation(location);
          setLocationError(null);
        })
        .catch(error => {
          setLocationError(error.message);
          console.warn('Could not get user location:', error);
        });
    }
  }, [showUserLocation]);

  // Fetch events based on filters and user location
  // Use passed events if provided, otherwise fetch them
  const { data: eventsData, isLoading, error, refetch } = useQuery(
    ['events-map', filters, userLocation],
    async () => {
      let params = { ...filters };
      
      // If user location is available and no specific location filter, use nearby search
      if (userLocation && !filters.location) {
        params.latitude = userLocation.latitude;
        params.longitude = userLocation.longitude;
        params.radius = filters.radius;
        return eventService.getNearbyEvents(params);
      } else {
        return eventService.getEvents(params);
      }
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes,
      enabled: events.length === 0 // Only fetch if no events are passed
    }
  );

  const { data: categoriesData } = useQuery(
    'categories',
    () => eventService.getCategories(),
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  // Use passed events if available, otherwise use fetched events
  const finalEvents = events.length > 0 ? events : (eventsData?.data?.events || []);
  const categories = categoriesData?.data?.categories || [];

  // Sort events by distance if user location is available
  const sortedEvents = userLocation 
    ? locationService.sortEventsByDistance(finalEvents, userLocation)
    : finalEvents;

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLocationRequest = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      setLocationError(null);
    } catch (error) {
      setLocationError(error.message);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      radius: 25
    });
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-900/50 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-300 mt-4">Loading events map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-900/50 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">Failed to load events map</p>
          <p className="text-gray-400 text-sm mb-4">Please check your internet connection</p>
          <Button onClick={() => refetch()} className="bg-primary-500 hover:bg-primary-600 mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Controls Header */}
      {showControls && (
        <div className="bg-gray-700/50 border-b border-gray-600 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-800 rounded-lg border border-gray-600 p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Map View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <ListBulletIcon className="w-4 h-4 mr-2" />
                List View
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Location Request */}
              {!userLocation && showUserLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLocationRequest}
                  disabled={!!locationError}
                >
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  Use My Location
                </Button>
              )}

              {/* Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                Filters
              </Button>

              {/* Events Count */}
              <span className="text-sm text-gray-600">
                {events.length} event{events.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Location Error */}
          {locationError && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Location access unavailable</p>
                  <p>{locationError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Radius Filter (only show if user location is available) */}
                {userLocation && !filters.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Radius ({filters.radius}km)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={filters.radius}
                      onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ height }}>
        {viewMode === 'map' ? (
          <MapComponent
            events={sortedEvents}
            center={userLocation ? [userLocation.longitude, userLocation.latitude] : [0, 0]}
            zoom={userLocation ? 12 : 2}
            height={height}
            showUserLocation={showUserLocation}
            className="w-full h-full"
          />
        ) : (
          <div className="h-full overflow-y-auto p-4">
            {sortedEvents.length === 0 ? (
              <div className="text-center py-12">
                <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search in a different area.
                </p>
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedEvents.map((event) => (
                  <EventListItem key={event.id} event={event} showDistance={!!userLocation} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Event List Item Component for List View
const EventListItem = ({ event, showDistance }) => {
  const eventDate = new Date(event.eventStart);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      {/* Event Image */}
      <div className="flex-shrink-0 w-16 h-16 mr-4">
        {event.posterUrl ? (
          <img
            src={event.posterUrl}
            alt={event.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
            <MapIcon className="w-8 h-8 text-white opacity-75" />
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {event.name}
          </h3>
          {showDistance && event.distance !== undefined && event.distance !== Infinity && (
            <span className="text-sm text-gray-500 ml-2">
              {locationService.formatDistance(event.distance)}
            </span>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mt-1">
          <MapPinIcon className="w-4 h-4 mr-1" />
          <span className="truncate">{event.location}</span>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-500">
            {eventDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {event.ticketTypes?.[0]?.price === 0 ? 'Free' : `$${event.ticketTypes?.[0]?.price}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventMap;
