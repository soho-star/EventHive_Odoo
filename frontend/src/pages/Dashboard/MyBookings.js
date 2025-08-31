import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  UserIcon,
  TicketIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import bookingService from '../../services/bookingService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: ''
  });

  const { data: bookingsData, isLoading, error } = useQuery(
    ['my-bookings', filters],
    () => bookingService.getMyBookings(filters),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const bookings = bookingsData?.data?.bookings || [];
  const pagination = bookingsData?.data?.pagination || {};

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({
      ...prev,
      status: status,
      page: 1,
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading bookings</h1>
          <p className="text-gray-300 mb-8">Failed to load your bookings. Please try again.</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              My Bookings
            </h1>
            <p className="text-xl text-primary-100">
              View and manage your event bookings
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white mb-8">
          <Card.Content>
            <div className="flex flex-wrap gap-4">
              <Button
                variant={filters.status === '' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('')}
                className={filters.status === '' ? 'bg-primary-500 text-white' : 'border-gray-600 bg-transparent text-white hover:bg-gray-700'}
              >
                All Bookings
              </Button>
              <Button
                variant={filters.status === 'completed' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('completed')}
                className={filters.status === 'completed' ? 'bg-primary-500 text-white' : 'border-gray-600 bg-transparent text-white hover:bg-gray-700'}
              >
                Confirmed
              </Button>
              <Button
                variant={filters.status === 'pending' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('pending')}
                className={filters.status === 'pending' ? 'bg-primary-500 text-white' : 'border-gray-600 bg-transparent text-white hover:bg-gray-700'}
              >
                Pending
              </Button>
              <Button
                variant={filters.status === 'cancelled' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('cancelled')}
                className={filters.status === 'cancelled' ? 'bg-primary-500 text-white' : 'border-gray-600 bg-transparent text-white hover:bg-gray-700'}
              >
                Cancelled
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
            <Card.Content>
              <div className="text-center py-12">
                <TicketIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No bookings found</h3>
                <p className="text-gray-300 mb-6">
                  {filters.status ? `You don't have any ${filters.status} bookings.` : "You haven't made any bookings yet."}
                </p>
                <Link to="/events">
                  <Button>
                    Browse Events
                  </Button>
                </Link>
              </div>
            </Card.Content>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.bookingId} className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
                <Card.Content>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {booking.event.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-300">
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {new Date(booking.event.eventStart).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {new Date(booking.event.eventStart).toLocaleTimeString()}
                            </div>
                            <div className="flex items-center">
                              <MapPinIcon className="w-4 h-4 mr-1" />
                              {booking.event.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(booking.paymentStatus)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Booking ID:</span>
                          <p className="text-white font-mono">{booking.bookingId}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Tickets:</span>
                          <p className="text-white">{booking.attendees.length} ticket{booking.attendees.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Total Amount:</span>
                          <p className="text-white font-semibold">
                            {booking.amount === 0 ? 'Free' : `$${booking.amount}`}
                          </p>
                        </div>
                      </div>

                      {booking.attendees && booking.attendees.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Attendees:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {booking.attendees.map((attendee, index) => (
                              <div key={index} className="text-sm text-gray-300">
                                <span className="font-medium">{attendee.name}</span>
                                {attendee.qrCode && (
                                  <span className="ml-2 text-xs text-gray-400">
                                    QR: {attendee.qrCode}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0 lg:ml-6">
                      <Link to={`/dashboard/bookings/${booking.bookingId}`}>
                        <Button size="sm" className="bg-primary-500 hover:bg-primary-600 text-white">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                      {booking.paymentStatus === 'completed' && (
                        <Button size="sm" variant="outline" className="border-gray-600 bg-transparent text-white hover:bg-gray-700">
                          <TicketIcon className="w-4 h-4 mr-1" />
                          Download Tickets
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
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
      </div>
    </div>
  );
};

export default MyBookings;

