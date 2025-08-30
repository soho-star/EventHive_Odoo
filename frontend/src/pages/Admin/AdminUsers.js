import React from 'react';
import Card from '../../components/UI/Card';

const AdminUsers = () => {
  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title>User Management</Card.Title>
          <Card.Description>Manage system users and permissions</Card.Description>
        </Card.Header>
        <Card.Content>
          <p className="text-gray-600">User management functionality coming soon...</p>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminUsers;

