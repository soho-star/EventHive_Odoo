import React from 'react';
import Card from '../components/UI/Card';

const BookEvent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <Card.Header>
            <Card.Title>Book Event</Card.Title>
            <Card.Description>Complete your event booking</Card.Description>
          </Card.Header>
          <Card.Content>
            <p className="text-gray-600">Event booking functionality coming soon...</p>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default BookEvent;

