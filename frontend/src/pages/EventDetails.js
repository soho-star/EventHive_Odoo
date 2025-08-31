import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  UserIcon,
  TicketIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import eventService from '../services/eventService';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import MapComponent from '../components/UI/MapComponent';

const EventDetails = () => {
  const { id } = useParams();

  const { data: eventData, isLoading, error } = useQuery(
    ['event', id],
    () => eventService.getEvent(id),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !eventData?.data?.event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h1>
          <p className="text-gray-600 mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const event = eventData.data.event;
  const eventDate = new Date(event.eventStart);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900">
        {event.posterUrl ? (
          <img
            src={event.posterUrl}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
            <CalendarIcon className="w-24 h-24 text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {event.name}
            </h1>
            <div className="flex items-center space-x-6 text-white">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                {eventDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2" />
                {event.location}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
              <Card.Header>
                <Card.Title className="text-white">About This Event</Card.Title>
              </Card.Header>
              <Card.Content>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </Card.Content>
            </Card>

            {/* Event Details */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
              <Card.Header>
                <Card.Title className="text-white">Event Details</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-white">Date & Time</h4>
                      <p className="text-gray-300">
                        {eventDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-300">
                        {eventDate.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-white">Location</h4>
                      <p className="text-gray-300">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-white">Organizer</h4>
                      <p className="text-gray-300">{event.organizer?.username}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <TicketIcon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-white">Category</h4>
                      <p className="text-gray-300 capitalize">{event.category}</p>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Location Map */}
            {event.latitude && event.longitude && (
              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
                <Card.Header>
                  <Card.Title className="text-white">Location</Card.Title>
                </Card.Header>
                <Card.Content className="p-0">
                  <MapComponent
                    events={[event]}
                    center={[event.longitude, event.latitude]}
                    zoom={15}
                    height="300px"
                    showUserLocation={false}
                    className="w-full"
                  />
                  <div className="p-6 pt-4">
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Venue</h4>
                        <p className="text-gray-300">{event.location}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3 border-gray-600 bg-transparent text-white hover:bg-gray-700"
                          onClick={() => {
                            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
                            window.open(googleMapsUrl, '_blank');
                          }}
                        >
                          Get Directions
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
              <Card.Header>
                <Card.Title className="text-white">Get Your Tickets</Card.Title>
              </Card.Header>
              <Card.Content>
                {event.ticketTypes && event.ticketTypes.length > 0 ? (
                  <div className="space-y-4">
                    {event.ticketTypes.map((ticket) => (
                      <div key={ticket.id} className="border border-gray-600 bg-gray-700/30 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-white">{ticket.typeName}</h4>
                          <span className="font-bold text-primary-400">
                            {ticket.price === 0 ? 'Free' : `$${ticket.price}`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">
                          {ticket.available || 'Available'} tickets remaining
                        </p>
                        {isUpcoming ? (
                          <Link to={`/book/${event.id}`}>
                            <Button className="w-full">
                              Book Now
                            </Button>
                          </Link>
                        ) : (
                          <Button disabled className="w-full">
                            Event Ended
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-300 mb-4">No tickets available</p>
                    <Button disabled className="w-full">
                      Not Available
                    </Button>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Share Card */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
              <Card.Header>
                <Card.Title className="text-white">Share This Event</Card.Title>
              </Card.Header>
              <Card.Content>
                <Button variant="outline" className="w-full border-gray-600 bg-transparent text-white hover:bg-gray-700">
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share Event
                </Button>
              </Card.Content>
            </Card>

            {/* Event Stats */}
            <Card>
              <Card.Header>
                <Card.Title>Event Stats</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tickets</span>
                    <span className="font-medium">
                      {event.ticketTypes?.reduce((sum, ticket) => sum + (ticket.maxTotal || 0), 0) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tickets Sold</span>
                    <span className="font-medium">
                      {event.ticketTypes?.reduce((sum, ticket) => sum + (ticket.soldCount || 0), 0) || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event Status</span>
                    <span className={`font-medium ${isUpcoming ? 'text-green-600' : 'text-gray-600'}`}>
                      {isUpcoming ? 'Upcoming' : 'Past Event'}
                    </span>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

