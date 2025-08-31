import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  TicketIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import adminService from '../../services/adminService';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load statistics');
      console.error('Stats error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
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
      <div>
        <h1 className="text-3xl font-bold text-white">System Statistics</h1>
        <p className="text-gray-300 mt-1">Comprehensive analytics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold">{formatNumber(stats?.users?.total)}</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-300 mr-1" />
                  <span className="text-blue-100 text-sm">
                    +{formatNumber(stats?.users?.newThisMonth || 0)} this month
                  </span>
                </div>
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
                <p className="text-3xl font-bold">{formatNumber(stats?.events?.total)}</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-300 mr-1" />
                  <span className="text-green-100 text-sm">
                    {formatNumber(stats?.events?.published || 0)} published
                  </span>
                </div>
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
                <p className="text-3xl font-bold">{formatNumber(stats?.bookings?.total)}</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-300 mr-1" />
                  <span className="text-purple-100 text-sm">
                    {formatNumber(stats?.bookings?.confirmed || 0)} confirmed
                  </span>
                </div>
              </div>
              <TicketIcon className="w-12 h-12 text-purple-200" />
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(stats?.bookings?.revenue)}</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-300 mr-1" />
                  <span className="text-orange-100 text-sm">
                    This month
                  </span>
                </div>
              </div>
              <CurrencyDollarIcon className="w-12 h-12 text-orange-200" />
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Statistics */}
        <Card className="bg-gray-800/50 border border-gray-700">
          <Card.Header>
            <Card.Title className="text-white">User Statistics</Card.Title>
            <Card.Description className="text-gray-300">Detailed user analytics</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Total Users</span>
                <span className="text-white font-semibold">{formatNumber(stats?.users?.total)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Verified Users</span>
                <span className="text-green-400 font-semibold">{formatNumber(stats?.users?.verified)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Unverified Users</span>
                <span className="text-yellow-400 font-semibold">{formatNumber(stats?.users?.unverified)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Organizers</span>
                <span className="text-blue-400 font-semibold">{formatNumber(stats?.users?.organizers)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Admins</span>
                <span className="text-red-400 font-semibold">{formatNumber(stats?.users?.admins)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">New This Month</span>
                <span className="text-green-400 font-semibold">+{formatNumber(stats?.users?.newThisMonth)}</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Event Statistics */}
        <Card className="bg-gray-800/50 border border-gray-700">
          <Card.Header>
            <Card.Title className="text-white">Event Statistics</Card.Title>
            <Card.Description className="text-gray-300">Event performance metrics</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Total Events</span>
                <span className="text-white font-semibold">{formatNumber(stats?.events?.total)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Published Events</span>
                <span className="text-green-400 font-semibold">{formatNumber(stats?.events?.published)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Draft Events</span>
                <span className="text-yellow-400 font-semibold">{formatNumber(stats?.events?.drafts)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Cancelled Events</span>
                <span className="text-red-400 font-semibold">{formatNumber(stats?.events?.cancelled)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Average Price</span>
                <span className="text-white font-semibold">{formatCurrency(stats?.events?.averagePrice)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Events This Month</span>
                <span className="text-green-400 font-semibold">+{formatNumber(stats?.events?.thisMonth)}</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Booking Statistics */}
      <Card className="bg-gray-800/50 border border-gray-700">
        <Card.Header>
          <Card.Title className="text-white">Booking Statistics</Card.Title>
          <Card.Description className="text-gray-300">Revenue and booking analytics</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4">Booking Status</h4>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Total Bookings</span>
                <span className="text-white font-semibold">{formatNumber(stats?.bookings?.total)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Confirmed</span>
                <span className="text-green-400 font-semibold">{formatNumber(stats?.bookings?.confirmed)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Pending</span>
                <span className="text-yellow-400 font-semibold">{formatNumber(stats?.bookings?.pending)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Cancelled</span>
                <span className="text-red-400 font-semibold">{formatNumber(stats?.bookings?.cancelled)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4">Revenue</h4>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Total Revenue</span>
                <span className="text-white font-semibold">{formatCurrency(stats?.bookings?.revenue)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">This Month</span>
                <span className="text-green-400 font-semibold">{formatCurrency(stats?.bookings?.revenueThisMonth)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Last Month</span>
                <span className="text-blue-400 font-semibold">{formatCurrency(stats?.bookings?.revenueLastMonth)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Average Booking</span>
                <span className="text-white font-semibold">{formatCurrency(stats?.bookings?.averageBooking)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4">Performance</h4>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Conversion Rate</span>
                <span className="text-white font-semibold">
                  {((stats?.bookings?.total / Math.max(stats?.users?.total, 1)) * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Avg. Events/User</span>
                <span className="text-white font-semibold">
                  {(stats?.events?.total / Math.max(stats?.users?.total, 1)).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Avg. Bookings/Event</span>
                <span className="text-white font-semibold">
                  {(stats?.bookings?.total / Math.max(stats?.events?.total, 1)).toFixed(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Success Rate</span>
                <span className="text-green-400 font-semibold">
                  {((stats?.bookings?.confirmed / Math.max(stats?.bookings?.total, 1)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gray-800/50 border border-gray-700">
        <Card.Header>
          <Card.Title className="text-white">Quick Actions</Card.Title>
          <Card.Description className="text-gray-300">Common administrative tasks</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <UsersIcon className="w-5 h-5" />
              <span>Export User Data</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              <CalendarIcon className="w-5 h-5" />
              <span>Export Event Data</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <ChartBarIcon className="w-5 h-5" />
              <span>Generate Report</span>
            </button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminStats;

