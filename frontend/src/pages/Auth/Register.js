import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { register as registerUser, reset } from '../../store/slices/authSlice';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import toast from 'react-hot-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success(message || 'Registration successful! Please verify your OTP.');
      navigate('/auth/verify-otp');
    }

    dispatch(reset());
  }, [isError, isSuccess, message, navigate, dispatch]);

  const onSubmit = (data) => {
    const { confirmPassword, ...userData } = data;
    dispatch(registerUser(userData));
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Join EventHive and start your event journey
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Username"
          type="text"
          placeholder="Enter your username"
          required
          error={errors.username?.message}
          {...register('username', {
            required: 'Username is required',
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters',
            },
            pattern: {
              value: /^[a-zA-Z0-9_]+$/,
              message: 'Username can only contain letters, numbers, and underscores',
            },
          })}
        />

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

        <Input
          label="Phone number"
          type="tel"
          placeholder="Enter your phone number"
          required
          error={errors.phone?.message}
          {...register('phone', {
            required: 'Phone number is required',
            pattern: {
              value: /^[+]?[\d\s\-\(\)]+$/,
              message: 'Invalid phone number',
            },
          })}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            required
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
              },
            })}
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === password || 'Passwords do not match',
            })}
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            I want to join as:
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="user"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                {...register('role', { required: 'Please select a role' })}
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-900">
                Attendee - I want to discover and attend events
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="organizer"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                {...register('role', { required: 'Please select a role' })}
              />
              <span className="ml-2 text-sm text-gray-900">
                Organizer - I want to create and manage events
              </span>
            </label>
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="agree-terms"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            {...register('agreeTerms', {
              required: 'You must agree to the terms and conditions',
            })}
          />
          <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <Link to="#" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="#" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.agreeTerms && (
          <p className="text-sm text-red-600">{errors.agreeTerms.message}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          Create account
        </Button>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;

