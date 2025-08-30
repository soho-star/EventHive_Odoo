import React from 'react';
import Card from '../../components/UI/Card';

const BookingDetails = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <Card.Header>
            <Card.Title>Booking Details</Card.Title>
            <Card.Description>View detailed information about your booking</Card.Description>
          </Card.Header>
          <Card.Content>
            <p className="text-gray-600">Booking details functionality coming soon...</p>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default BookingDetails;

