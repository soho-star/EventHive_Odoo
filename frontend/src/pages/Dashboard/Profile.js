import React from 'react';
import Card from '../../components/UI/Card';

const Profile = () => {
  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-white">
          <Card.Header>
            <Card.Title className="text-white">User Profile</Card.Title>
            <Card.Description className="text-gray-300">Manage your account settings and preferences</Card.Description>
          </Card.Header>
          <Card.Content>
            <p className="text-gray-300">Profile management functionality coming soon...</p>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

