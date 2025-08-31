import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  UserIcon,
  TicketIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import eventService from '../services/eventService';
import bookingService from '../services/bookingService';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const BookEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [attendees, setAttendees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch event details
  const { data: eventData, isLoading: eventLoading, error: eventError } = useQuery(
    ['event', eventId],
    () => eventService.getEvent(eventId),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  // Create booking mutation
  const createBookingMutation = useMutation(
    (bookingData) => bookingService.createBooking(bookingData),
    {
      onSuccess: (data) => {
        toast.success('Booking created successfully!');
        queryClient.invalidateQueries('my-bookings');
        queryClient.invalidateQueries('booking-stats');
        navigate(`/dashboard/bookings/${data.data.booking.bookingId}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create booking');
      },
    }
  );

  if (eventLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (eventError || !eventData?.data?.event) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <p className="text-gray-300 mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/events')}>
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  const event = eventData.data.event;
  const eventDate = new Date(event.eventStart);
  const isUpcoming = eventDate > new Date();

  if (!isUpcoming) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event has ended</h1>
          <p className="text-gray-300 mb-8">This event has already taken place and bookings are no longer available.</p>
          <Button onClick={() => navigate('/events')}>
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setQuantity(1);
    setAttendees([]);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1 || newQuantity > selectedTicket.maxPerUser) {
      return;
    }
    setQuantity(newQuantity);
    
    // Update attendees array
    const newAttendees = [];
    for (let i = 0; i < newQuantity; i++) {
      newAttendees.push({
        name: '',
        email: '',
        phone: '',
        gender: ''
      });
    }
    setAttendees(newAttendees);
  };

  const handleAttendeeChange = (index, field, value) => {
    const newAttendees = [...attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      [field]: value
    };
    setAttendees(newAttendees);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTicket) {
      toast.error('Please select a ticket type');
      return;
    }

    // Validate attendees
    const isValid = attendees.every((attendee, index) => {
      if (!attendee.name.trim()) {
        toast.error(`Please enter name for attendee ${index + 1}`);
        return false;
      }
      if (!attendee.email.trim()) {
        toast.error(`Please enter email for attendee ${index + 1}`);
        return false;
      }
      if (!attendee.email.includes('@')) {
        toast.error(`Please enter a valid email for attendee ${index + 1}`);
        return false;
      }
      return true;
    });

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const bookingData = {
        eventId: parseInt(eventId),
        ticketId: selectedTicket.id,
        quantity: quantity,
        attendees: attendees
      };

      await createBookingMutation.mutateAsync(bookingData);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = selectedTicket ? selectedTicket.price * quantity : 0;

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Book Your Tickets
            </h1>
            <p className="text-xl text-primary-100">
              {event.name}
            </p>
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
                <Card.Title className="text-white">Event Details</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-300">
                    <CalendarIcon className="w-5 h-5 mr-3 text-gray-400" />
                    {eventDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <ClockIcon className="w-5 h-5 mr-3 text-gray-400" />
                    {eventDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - {new Date(event.eventEnd).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPinIcon className="w-5 h-5 mr-3 text-gray-400" />
                    {event.location}
                  </div>
                  <div className="flex items-start text-gray-300">
                    <UserIcon className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Organized by</p>
                      <p>{event.organizer?.username || 'EventHive'}</p>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Ticket Selection */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white mb-8">
              <Card.Header>
                <Card.Title className="text-white">Select Tickets</Card.Title>
              </Card.Header>
              <Card.Content>
                {event.ticketTypes && event.ticketTypes.length > 0 ? (
                  <div className="space-y-4">
                    {event.ticketTypes.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          selectedTicket?.id === ticket.id
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => handleTicketSelect(ticket)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-white">{ticket.typeName}</h4>
                            <p className="text-sm text-gray-300">
                              {ticket.available || 'Available'} tickets remaining
                            </p>
                          </div>
                          <span className="font-bold text-primary-400">
                            {ticket.price === 0 ? 'Free' : `$${ticket.price}`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          Max {ticket.maxPerUser} per person
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300">No tickets available for this event.</p>
                )}
              </Card.Content>
            </Card>

            {/* Quantity Selection */}
            {selectedTicket && (
              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white mb-8">
                <Card.Header>
                  <Card.Title className="text-white">Quantity</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="border-gray-600 bg-transparent text-white hover:bg-gray-700"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-bold text-white min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= selectedTicket.maxPerUser}
                      className="border-gray-600 bg-transparent text-white hover:bg-gray-700"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </Button>
                    <span className="text-gray-300">
                      Max {selectedTicket.maxPerUser} per person
                    </span>
                  </div>
                </Card.Content>
              </Card>
            )}

            {/* Attendee Information */}
            {selectedTicket && quantity > 0 && (
              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white mb-8">
                <Card.Header>
                  <Card.Title className="text-white">Attendee Information</Card.Title>
                  <Card.Description className="text-gray-300">
                    Please provide details for each attendee
                  </Card.Description>
                </Card.Header>
                <Card.Content>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {attendees.map((attendee, index) => (
                      <div key={index} className="border border-gray-600 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-4">
                          Attendee {index + 1}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">
                              Full Name *
                            </label>
                            <Input
                              type="text"
                              value={attendee.name}
                              onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)}
                              placeholder="Enter full name"
                              required
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">
                              Email *
                            </label>
                            <Input
                              type="email"
                              value={attendee.email}
                              onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                              placeholder="Enter email address"
                              required
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">
                              Phone Number
                            </label>
                            <Input
                              type="tel"
                              value={attendee.phone}
                              onChange={(e) => handleAttendeeChange(index, 'phone', e.target.value)}
                              placeholder="e.g., +1234567890 or 07602596399"
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              Optional - Enter with or without country code
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">
                              Gender
                            </label>
                            <select
                              value={attendee.gender}
                              onChange={(e) => handleAttendeeChange(index, 'gender', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </form>
                </Card.Content>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white sticky top-8">
              <Card.Header>
                <Card.Title className="text-white">Booking Summary</Card.Title>
              </Card.Header>
              <Card.Content>
                {selectedTicket ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Ticket Type:</span>
                      <span className="text-white font-medium">{selectedTicket.typeName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Quantity:</span>
                      <span className="text-white font-medium">{quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Price per ticket:</span>
                      <span className="text-white font-medium">
                        {selectedTicket.price === 0 ? 'Free' : `$${selectedTicket.price}`}
                      </span>
                    </div>
                    <hr className="border-gray-600" />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-white">Total:</span>
                      <span className="text-primary-400">
                        {totalAmount === 0 ? 'Free' : `$${totalAmount.toFixed(2)}`}
                      </span>
                    </div>
                    
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !selectedTicket || attendees.length === 0}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <LoadingSpinner size="sm" className="mr-2" />
                          Processing...
                        </div>
                      ) : (
                        `Book ${quantity} Ticket${quantity > 1 ? 's' : ''}`
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-300">Please select a ticket type to see booking summary.</p>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookEvent;

