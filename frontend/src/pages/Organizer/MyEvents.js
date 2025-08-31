import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import eventService from '../../services/eventService';
import toast from 'react-hot-toast';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, unpublished

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') {
        params.published = filter === 'published';
      }
      
      const response = await eventService.getOrganizerEvents(params);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventService.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      fetchEvents(); // Refresh the list
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleTogglePublish = async (eventId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await eventService.toggleEventPublish(eventId, newStatus);
      toast.success(`Event ${newStatus ? 'published' : 'unpublished'} successfully`);
      fetchEvents(); // Refresh the list
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Failed to update event status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Events</h1>
            <p className="mt-2 text-gray-300">Manage your events and track their performance</p>
          </div>
          <Link to="/organizer/events/create">
            <Button className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'all'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'published'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter('unpublished')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'unpublished'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Drafts
            </button>
          </div>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
            <Card.Content className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M5 7h14l-1 12H6L5 7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No events found</h3>
                <p className="text-gray-300 mb-4">
                  {filter === 'all' 
                    ? "You haven't created any events yet. Start by creating your first event!"
                    : `No ${filter} events found.`
                  }
                </p>
                <Link to="/organizer/events/create">
                  <Button>Create Your First Event</Button>
                </Link>
              </div>
            </Card.Content>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
                <div className="aspect-video bg-gradient-to-r from-primary-500 to-primary-600 relative">
                  {event.posterUrl ? (
                    <img
                      src={event.posterUrl}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-white text-lg font-medium">
                        {event.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(event)}
                  </div>
                </div>

                <Card.Content className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-300 capitalize">
                      {event.category} • {event.location}
                    </p>
                  </div>

                  <div className="mb-4 text-sm text-gray-300">
                    <p>📅 {formatDate(event.eventStart)}</p>
                    {event.ticketTypes && event.ticketTypes.length > 0 && (
                      <p>🎫 {event.ticketTypes.length} ticket type(s)</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Link to={`/events/${event.id}`}>
                        <Button variant="ghost" size="sm" title="View Event" className="text-gray-300 hover:text-white hover:bg-gray-700">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/organizer/events/${event.id}/edit`}>
                        <Button variant="ghost" size="sm" title="Edit Event" className="text-gray-300 hover:text-white hover:bg-gray-700">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/organizer/events/${event.id}/analytics`}>
                        <Button variant="ghost" size="sm" title="View Analytics" className="text-gray-300 hover:text-white hover:bg-gray-700">
                          <ChartBarIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        title="Delete Event"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      variant={event.isPublished ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleTogglePublish(event.id, event.isPublished)}
                      className={event.isPublished ? 'border-gray-600 bg-transparent text-white hover:bg-gray-700' : ''}
                    >
                      {event.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;

