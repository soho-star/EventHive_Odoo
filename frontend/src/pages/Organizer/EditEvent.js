import React from 'react';
import Card from '../../components/UI/Card';

const EditEvent = () => {
  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
          <Card.Header>
            <Card.Title className="text-white">Edit Event</Card.Title>
            <Card.Description className="text-gray-300">Update your event details and settings</Card.Description>
          </Card.Header>
          <Card.Content>
            <p className="text-gray-300">Event editing functionality coming soon...</p>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default EditEvent;

