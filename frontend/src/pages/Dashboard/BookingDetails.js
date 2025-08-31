import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  UserIcon,
  TicketIcon,
  ArrowLeftIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import bookingService from '../../services/bookingService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: bookingData, isLoading, error } = useQuery(
    ['booking', bookingId],
    () => bookingService.getBooking(bookingId),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const cancelBookingMutation = useMutation(
    (bookingId) => bookingService.cancelBooking(bookingId),
    {
      onSuccess: () => {
        toast.success('Booking cancelled successfully');
        queryClient.invalidateQueries('my-bookings');
        queryClient.invalidateQueries('booking-stats');
        navigate('/dashboard/bookings');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to cancel booking');
      },
    }
  );

  const handleCancelBooking = () => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !bookingData?.data?.booking) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Booking not found</h1>
          <p className="text-gray-300 mb-8">The booking you're looking for doesn't exist or has been removed.</p>
          <Link to="/dashboard/bookings">
            <Button>Back to My Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const booking = bookingData.data.booking;
  const event = booking.event;
  const eventDate = new Date(event.eventStart);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-4 h-4 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/dashboard/bookings" className="inline-flex items-center text-primary-100 hover:text-white mb-4">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to My Bookings
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Booking Details
              </h1>
              <p className="text-xl text-primary-100">
                {event.name}
              </p>
            </div>
            <div className="text-right">
              {getStatusBadge(booking.paymentStatus)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white mb-8">
              <Card.Header>
                <Card.Title className="text-white">Event Information</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-6">
                  <div className="flex items-center text-gray-300">
                    <CalendarIcon className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium text-white">Date & Time</p>
                      <p>{eventDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                      <p>{eventDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(event.eventEnd).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-300">
                    <MapPinIcon className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium text-white">Location</p>
                      <p>{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start text-gray-300">
                    <UserIcon className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Organizer</p>
                      <p>{event.organizer?.username || 'EventHive'}</p>
                    </div>
                  </div>

                  {event.description && (
                    <div>
                      <p className="font-medium text-white mb-2">Description</p>
                      <p className="text-gray-300">{event.description}</p>
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>

            {/* Booking Information */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white mb-8">
              <Card.Header>
                <Card.Title className="text-white">Booking Information</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm">Booking ID</p>
                    <p className="text-white font-mono text-lg">{booking.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Transaction ID</p>
                    <p className="text-white font-mono text-lg">{booking.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Ticket Type</p>
                    <p className="text-white text-lg">{booking.ticket?.typeName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Quantity</p>
                    <p className="text-white text-lg">{booking.attendees.length} ticket{booking.attendees.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Amount</p>
                    <p className="text-white text-lg font-semibold">
                      {booking.amount === 0 ? 'Free' : `$${booking.amount}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Booking Date</p>
                    <p className="text-white text-lg">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Attendees */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
              <Card.Header>
                <Card.Title className="text-white">Attendees</Card.Title>
                <Card.Description className="text-gray-300">
                  {booking.attendees.length} attendee{booking.attendees.length !== 1 ? 's' : ''}
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  {booking.attendees.map((attendee, index) => (
                    <div key={index} className="border border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-2">
                            Attendee {index + 1}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Name:</span>
                              <p className="text-white">{attendee.name}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Email:</span>
                              <p className="text-white">{attendee.email}</p>
                            </div>
                            {attendee.phone && (
                              <div>
                                <span className="text-gray-400">Phone:</span>
                                <p className="text-white">{attendee.phone}</p>
                              </div>
                            )}
                            {attendee.gender && (
                              <div>
                                <span className="text-gray-400">Gender:</span>
                                <p className="text-white capitalize">{attendee.gender}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {attendee.qrCode && (
                          <div className="text-center">
                            <QrCodeIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-400 font-mono">{attendee.qrCode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white sticky top-8">
              <Card.Header>
                <Card.Title className="text-white">Actions</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  {booking.paymentStatus === 'completed' && (
                    <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white">
                      <TicketIcon className="w-4 h-4 mr-2" />
                      Download Tickets
                    </Button>
                  )}
                  
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                    <QrCodeIcon className="w-4 h-4 mr-2" />
                    View QR Codes
                  </Button>

                  {booking.paymentStatus !== 'cancelled' && (
                    <Button
                      variant="outline"
                      onClick={handleCancelBooking}
                      disabled={cancelBookingMutation.isLoading}
                      className="w-full border-red-600 bg-transparent text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      {cancelBookingMutation.isLoading ? 'Cancelling...' : 'Cancel Booking'}
                    </Button>
                  )}

                  <Link to="/events">
                    <Button variant="outline" className="w-full border-gray-600 bg-transparent text-white hover:bg-gray-700">
                      Browse More Events
                    </Button>
                  </Link>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;

