import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { login, reset } from '../../store/slices/authSlice';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, isError, isSuccess, message, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }

    if (isError) {
      toast.error(message);
    }

    if (isSuccess && isAuthenticated) {
      toast.success('Login successful!');
      navigate(from, { replace: true });
    }

    dispatch(reset());
  }, [isError, isSuccess, isAuthenticated, message, navigate, dispatch, from]);

  const onSubmit = (data) => {
    dispatch(login(data));
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-300">
          Sign in to your EventHive account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Email address"
          type="email"
          placeholder="Enter your email"
          required
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address',
            },
          })}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            required
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-200"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 bg-gray-700 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-200">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/auth/forgot-password"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          Sign in
        </Button>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-300">New to EventHive?</span>
            </div>
          </div>

          <div className="mt-6 text-center space-y-2">
            <div>
              <Link
                to="/auth/register"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                Create your account
              </Link>
            </div>
            <div>
              <Link
                to="/admin/login"
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                Admin Login →
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;

