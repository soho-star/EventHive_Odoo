import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Clear any existing tokens when component loads to prevent conflicts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Check if token is expired by trying to decode it
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          // Token is expired, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        // Invalid token, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await dispatch(login(formData)).unwrap();
      
      if (result.user.role === 'admin') {
        toast.success('Admin login successful');
        navigate('/admin');
      } else {
        toast.error('Access denied. Admin privileges required.');
        // Clear the token since it's not an admin
        dispatch({ type: 'auth/logout' });
      }
    } catch (error) {
      // Handle specific error cases for better user experience
      if (error.includes('Invalid credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else if (error.includes('Account not verified')) {
        toast.error('Account not verified. Please check your email for verification OTP.');
      } else if (error.includes('Too many requests')) {
        toast.error('Too many login attempts. Please wait before trying again.');
      } else {
        toast.error(error || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
          <Card.Header className="text-center">
            <div className="flex justify-center mb-4">
              <img
                src="/EventHive.png"
                alt="EventHive"
                className="h-12 w-auto"
              />
            </div>
            <Card.Title className="text-2xl font-bold text-white">
              Admin Login
            </Card.Title>
            <Card.Description className="text-gray-300">
              Access the admin panel to manage events and users
            </Card.Description>
          </Card.Header>
          
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@eventhive.com"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In as Admin'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/auth/login"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                ← Back to regular login
              </Link>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
