import React from 'react';
import Card from '../../components/UI/Card';

const AdminStats = () => {
  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title>System Statistics</Card.Title>
          <Card.Description>View system-wide statistics and analytics</Card.Description>
        </Card.Header>
        <Card.Content>
          <p className="text-gray-600">System statistics functionality coming soon...</p>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminStats;

