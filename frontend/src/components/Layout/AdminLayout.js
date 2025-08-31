import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Squares from '../UI/Squares';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Events', href: '/admin/events', icon: CalendarIcon },
    { name: 'Statistics', href: '/admin/stats', icon: ChartBarIcon },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Squares Background */}
      <div className="fixed inset-0 z-0">
        <Squares 
          speed={0.5} 
          squareSize={40}
          direction="diagonal"
          borderColor="rgba(255, 255, 255, 0.1)"
          hoverFillColor="rgba(255, 255, 255, 0.05)"
        />
      </div>
      
      <div className="relative z-10 min-h-screen">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800/90 backdrop-blur-sm border-r border-gray-700 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <Link to="/" className="flex items-center">
            <img
              src="/EventHive.png"
              alt="EventHive"
              className="h-8 w-auto"
            />
          </Link>
          <button
            className="lg:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-white bg-blue-600'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.username}</p>
              <p className="text-xs text-gray-300 capitalize">{user?.role}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Link
              to="/dashboard/profile"
              className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <CogIcon className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-300 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors w-full text-left"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              className="lg:hidden p-2 text-gray-300 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 text-white">
          <Outlet />
        </main>
      </div>
      </div>
    </div>
  );
};

export default AdminLayout;

