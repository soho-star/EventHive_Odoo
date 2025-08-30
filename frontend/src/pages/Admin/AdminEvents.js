import React from 'react';
import Card from '../../components/UI/Card';

const AdminEvents = () => {
  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title>Event Management</Card.Title>
          <Card.Description>Manage all events in the system</Card.Description>
        </Card.Header>
        <Card.Content>
          <p className="text-gray-600">Event management functionality coming soon...</p>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminEvents;

