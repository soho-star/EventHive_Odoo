import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserIcon, 
  CalendarIcon, 
  ArrowRightOnRectangleIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import toast from 'react-hot-toast';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
    { name: 'My Bookings', href: '/dashboard/bookings', icon: CalendarIcon },
    { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
  ];

  const organizerNavigation = [
    { name: 'Organizer Dashboard', href: '/organizer', icon: ChartBarIcon },
    { name: 'My Events', href: '/organizer/events', icon: CalendarIcon },
    { name: 'Create Event', href: '/organizer/events/create', icon: PlusIcon },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: ChartBarIcon },
    { name: 'Manage Users', href: '/admin/users', icon: UserIcon },
    { name: 'Manage Events', href: '/admin/events', icon: CalendarIcon },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EventHive</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                  location.pathname === item.href
                    ? 'text-primary-600'
                    : 'text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg p-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <span className="hidden md:block font-medium">
                    {user?.username}
                  </span>
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {/* User Navigation */}
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              to={item.href}
                              className={`${
                                active ? 'bg-gray-50' : ''
                              } flex items-center px-4 py-2 text-sm text-gray-700`}
                            >
                              <item.icon className="w-4 h-4 mr-3" />
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}

                      {/* Organizer Navigation */}
                      {(user?.role === 'organizer' || user?.role === 'admin') && (
                        <>
                          <div className="border-t border-gray-100 my-1" />
                          {organizerNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  to={item.href}
                                  className={`${
                                    active ? 'bg-gray-50' : ''
                                  } flex items-center px-4 py-2 text-sm text-gray-700`}
                                >
                                  <item.icon className="w-4 h-4 mr-3" />
                                  {item.name}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                        </>
                      )}

                      {/* Admin Navigation */}
                      {user?.role === 'admin' && (
                        <>
                          <div className="border-t border-gray-100 my-1" />
                          {adminNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  to={item.href}
                                  className={`${
                                    active ? 'bg-gray-50' : ''
                                  } flex items-center px-4 py-2 text-sm text-gray-700`}
                                >
                                  <item.icon className="w-4 h-4 mr-3" />
                                  {item.name}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                        </>
                      )}

                      <div className="border-t border-gray-100 my-1" />
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth/register"
                  className="btn btn-primary btn-sm"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <Transition
          show={mobileMenuOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 -translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-1"
        >
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                    location.pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="space-y-1">
                    <Link
                      to="/auth/login"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/auth/register"
                      className="block px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Transition>
      </nav>
    </header>
  );
};

export default Header;

