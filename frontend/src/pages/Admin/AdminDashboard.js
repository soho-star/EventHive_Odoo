import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  CalendarIcon, 
  TicketIcon, 
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import adminService from '../../services/adminService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, overviewData] = await Promise.all([
        adminService.getStats(),
        adminService.getOverview()
      ]);
      
      setStats(statsData.data);
      setOverview(overviewData.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      inactive: { color: 'bg-red-100 text-red-800', text: 'Inactive' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      published: { color: 'bg-green-100 text-green-800', text: 'Published' },
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-300 mt-1">System overview and administration</p>
        </div>
        <div className="flex space-x-3">
          <Button
            as={Link}
            to="/admin/users"
            variant="outline"
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            Manage Users
          </Button>
          <Button
            as={Link}
            to="/admin/events"
            variant="outline"
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            Manage Events
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold">{stats?.users?.total || 0}</p>
                <p className="text-blue-100 text-sm mt-1">
                  {stats?.users?.verified || 0} verified
                </p>
              </div>
              <UsersIcon className="w-12 h-12 text-blue-200" />
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold">{stats?.events?.total || 0}</p>
                <p className="text-green-100 text-sm mt-1">
                  {stats?.events?.published || 0} published
                </p>
              </div>
              <CalendarIcon className="w-12 h-12 text-green-200" />
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold">{stats?.bookings?.total || 0}</p>
                <p className="text-purple-100 text-sm mt-1">
                  {stats?.bookings?.confirmed || 0} confirmed
                </p>
              </div>
              <TicketIcon className="w-12 h-12 text-purple-200" />
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Revenue</p>
                <p className="text-3xl font-bold">${stats?.bookings?.revenue || 0}</p>
                <p className="text-orange-100 text-sm mt-1">
                  This month
                </p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-orange-200" />
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="bg-gray-800/50 border border-gray-700">
          <Card.Header>
            <Card.Title className="text-white">Recent Users</Card.Title>
            <Card.Description className="text-gray-300">Latest registered users</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {overview?.recentUsers?.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.username?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-gray-300 text-sm">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(user.is_verified ? 'active' : 'pending')}
                    <span className="text-gray-400 text-sm capitalize">{user.role}</span>
                  </div>
                </div>
              ))}
              {(!overview?.recentUsers || overview.recentUsers.length === 0) && (
                <p className="text-gray-400 text-center py-4">No recent users</p>
              )}
            </div>
            <div className="mt-4">
              <Button
                as={Link}
                to="/admin/users"
                variant="outline"
                size="sm"
                className="w-full text-white border-gray-600 hover:bg-gray-700"
              >
                View All Users
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* Recent Events */}
        <Card className="bg-gray-800/50 border border-gray-700">
          <Card.Header>
            <Card.Title className="text-white">Recent Events</Card.Title>
            <Card.Description className="text-gray-300">Latest created events</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {overview?.recentEvents?.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{event.title}</p>
                      <p className="text-gray-300 text-sm">{event.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(event.is_published ? 'published' : 'draft')}
                    <div className="flex space-x-1">
                      <Button
                        as={Link}
                        to={`/events/${event.id}`}
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-white"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        as={Link}
                        to={`/admin/events/${event.id}/edit`}
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-blue-400"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {(!overview?.recentEvents || overview.recentEvents.length === 0) && (
                <p className="text-gray-400 text-center py-4">No recent events</p>
              )}
            </div>
            <div className="mt-4">
              <Button
                as={Link}
                to="/admin/events"
                variant="outline"
                size="sm"
                className="w-full text-white border-gray-600 hover:bg-gray-700"
              >
                View All Events
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800/50 border border-gray-700">
        <Card.Header>
          <Card.Title className="text-white">Quick Actions</Card.Title>
          <Card.Description className="text-gray-300">Common administrative tasks</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              as={Link}
              to="/admin/users"
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UsersIcon className="w-5 h-5" />
              <span>Manage Users</span>
            </Button>
            <Button
              as={Link}
              to="/admin/events"
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <CalendarIcon className="w-5 h-5" />
              <span>Manage Events</span>
            </Button>
            <Button
              as={Link}
              to="/admin/stats"
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>View Statistics</span>
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminDashboard;

