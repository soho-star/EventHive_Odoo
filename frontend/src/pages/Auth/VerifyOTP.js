import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOTP, reset } from '../../store/slices/authSlice';
import Button from '../../components/UI/Button';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isError, isSuccess, message, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && isAuthenticated) {
      toast.success(message || 'Account verified successfully!');
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [isError, isSuccess, isAuthenticated, message, navigate, dispatch]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    // You would need to get userId from somewhere (maybe localStorage or state)
    const userId = localStorage.getItem('registrationUserId');
    if (!userId) {
      toast.error('Registration session expired. Please register again.');
      navigate('/auth/register');
      return;
    }

    dispatch(verifyOTP({
      userId: parseInt(userId),
      otp: otpString,
      type: 'registration'
    }));
  };

  const handleResendOTP = () => {
    // Implement resend OTP functionality
    toast.success('OTP resent successfully!');
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Verify your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a 6-digit verification code to your email and phone
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Enter verification code
          </label>
          <div className="flex space-x-3 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoComplete="off"
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          Verify Account
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOTP}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Resend OTP
            </button>
          </p>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Need help?</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/auth/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Back to registration
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VerifyOTP;

