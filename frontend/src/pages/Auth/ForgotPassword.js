import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
      toast.success('Password reset link sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
        <p className="text-gray-600 mb-8">
          We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
        </p>
        <div className="space-y-4">
          <Link to="/auth/login">
            <Button className="w-full">
              Back to Sign In
            </Button>
          </Link>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Try different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          to="/auth/login"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to sign in
        </Link>
        <h2 className="text-3xl font-bold text-gray-900">Forgot your password?</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
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

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          Send reset link
        </Button>

        <div className="text-center">
          <Link
            to="/auth/register"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;

