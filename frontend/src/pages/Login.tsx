import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/image.png';
import sideImage from '../assets/signupBg.jpg';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL;

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);

    if (!email) {
      setError('Please enter an email');
      setOtpLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setOtpLoading(false);
      return;
    }

    try {
      const response = await fetch(`${url}/api/login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get OTP');

      setShowOtp(true);
      setOtp('');
      setError('OTP sent to your email. Please enter it to sign in.');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const response = await fetch(`${url}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      navigate('/welcome');
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${url}/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 md:px-16 py-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center md:justify-start items-center gap-2 mb-6">
            <img src={logo} alt="HD Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold text-gray-800">HD</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center md:text-left mb-1">
            Sign In
          </h1>
          <p className="text-sm text-gray-500 text-center md:text-left mb-6">
            Sign in to access your notes
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={showOtp ? handleSignIn : handleGetOtp}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
                disabled={showOtp}
              />
            </div>

            {showOtp && (
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700"
                >
                  OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter OTP received via email"
                  maxLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              className={`w-full bg-blue-600 text-white py-2 rounded-md transition-colors ${
                otpLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
              disabled={otpLoading || !email || (showOtp && !otp)}
            >
              {otpLoading
                ? 'Sending OTP...'
                : showOtp
                ? 'Sign In'
                : 'Get OTP'}
            </button>
          </form>

          {/* Google Sign In */}
          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-sm text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            <span className="text-sm text-gray-700 font-medium">
              Sign up with Google
            </span>
          </button>

          {/* Redirect */}
          <p className="mt-4 text-center text-sm text-gray-600">
            Don’t have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="hidden md:block w-1/2 h-screen overflow-hidden">
        <img
          src={sideImage}
          alt="Side visual"
          className="w-full h-full object-cover rounded-l-xl"
        />
      </div>
    </div>
  );
};

export default Login;
