import React from 'react';
import Card from '../../components/UI/Card';

const EditEvent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <Card.Header>
            <Card.Title>Edit Event</Card.Title>
            <Card.Description>Update your event details and settings</Card.Description>
          </Card.Header>
          <Card.Content>
            <p className="text-gray-600">Event editing functionality coming soon...</p>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default EditEvent;

