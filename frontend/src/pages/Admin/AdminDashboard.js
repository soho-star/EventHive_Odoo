import React from 'react';
import Card from '../../components/UI/Card';

const AdminDashboard = () => {
  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title>Admin Dashboard</Card.Title>
          <Card.Description>System overview and administration</Card.Description>
        </Card.Header>
        <Card.Content>
          <p className="text-gray-600">Admin dashboard functionality coming soon...</p>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminDashboard;

