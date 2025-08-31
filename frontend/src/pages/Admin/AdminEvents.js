import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import adminService from '../../services/adminService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentPage, categoryFilter, statusFilter]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        category: categoryFilter || undefined,
        published: statusFilter || undefined
      };
      
      const response = await adminService.getEvents(params);
      setEvents(response.data.events);
      setTotalPages(Math.ceil(response.data.total / 12));
    } catch (error) {
      toast.error('Failed to load events');
      console.error('Fetch events error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents();
  };

  const handleDeleteEvent = async () => {
    try {
      await adminService.deleteEvent(selectedEvent.id);
      toast.success('Event deleted successfully');
      setIsDeleteModalOpen(false);
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
      console.error('Delete event error:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-800', text: 'Published' },
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      music: { color: 'bg-purple-100 text-purple-800', text: 'Music' },
      sports: { color: 'bg-blue-100 text-blue-800', text: 'Sports' },
      technology: { color: 'bg-green-100 text-green-800', text: 'Technology' },
      business: { color: 'bg-yellow-100 text-yellow-800', text: 'Business' },
      education: { color: 'bg-indigo-100 text-indigo-800', text: 'Education' },
      entertainment: { color: 'bg-pink-100 text-pink-800', text: 'Entertainment' }
    };

    const config = categoryConfig[category] || { color: 'bg-gray-100 text-gray-800', text: category };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Event Management</h1>
          <p className="text-gray-300 mt-1">Manage all events in the system</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <CalendarIcon className="w-5 h-5 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-800/50 border border-gray-700">
        <Card.Content className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search events by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </form>
            
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="music">Music</option>
                <option value="sports">Sports</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="education">Education</option>
                <option value="entertainment">Entertainment</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors">
            <Card.Content className="p-0">
              {/* Event Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CalendarIcon className="w-16 h-16 text-white/50" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(event.is_published ? 'published' : 'draft')}
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white line-clamp-2">
                    {event.title}
                  </h3>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                {/* Event Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <UserIcon className="w-4 h-4 mr-2" />
                    {event.organizer_name || 'Unknown Organizer'}
                  </div>
                </div>

                {/* Category and Price */}
                <div className="flex items-center justify-between mb-4">
                  {getCategoryBadge(event.category)}
                  <span className="text-lg font-bold text-white">
                    ${event.price || 0}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      as="a"
                      href={`/events/${event.id}`}
                      target="_blank"
                      className="text-gray-400 hover:text-white"
                      title="View Event"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      as="a"
                      href={`/organizer/events/${event.id}/edit`}
                      className="text-gray-400 hover:text-blue-400"
                      title="Edit Event"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-gray-400 hover:text-red-400"
                    title="Delete Event"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* No Events Message */}
      {filteredEvents.length === 0 && (
        <Card className="bg-gray-800/50 border border-gray-700">
          <Card.Content className="p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-gray-400">
              {searchTerm || categoryFilter || statusFilter 
                ? 'Try adjusting your search criteria or filters.'
                : 'There are no events in the system yet.'
              }
            </p>
          </Card.Content>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Event Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Event"
      >
        <div className="text-gray-300">
          <p>Are you sure you want to delete the event "{selectedEvent?.title}"?</p>
          <p className="text-sm text-gray-400 mt-2">
            This action cannot be undone. All event data, bookings, and related information will be permanently removed.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteEvent}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Event
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminEvents;

