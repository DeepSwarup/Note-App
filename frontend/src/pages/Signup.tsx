import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import signupBg from '../assets/signupBg.jpg';
import logoImage from '../assets/image.png';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);

    if (!name || !dateOfBirth || !email) {
      setError('All fields are required');
      setOtpLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setOtpLoading(false);
      return;
    }

    try {
      const response = await fetch(`${url}/api/get-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, dateOfBirth, email }),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get OTP');

      setShowOtp(true);
      setOtp('');
      setError('OTP sent to your email. Please enter it to sign up.');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const response = await fetch(`${url}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Signup failed');

      navigate('/welcome');
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${url}/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <img src={logoImage} alt="Logo" className="h-8 w-8 mr-2" />
            <span className="text-xl font-semibold text-gray-800">HD</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Sign up</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Sign up to enjoy the feature of HD</p>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={showOtp ? handleSignUp : handleGetOtp} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Full Name"
                disabled={showOtp}
              />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={showOtp}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
                disabled={showOtp}
              />
            </div>
            {showOtp && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter OTP"
                  maxLength={6}
                />
              </div>
            )}
            <button
              type="submit"
              className={`w-full text-white py-2 rounded-md transition-colors ${
                otpLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={
                otpLoading ||
                !name ||
                !dateOfBirth ||
                !email ||
                (showOtp && !otp)
              }
            >
              {otpLoading ? 'Sending OTP...' : showOtp ? 'Sign Up' : 'Get OTP'}
            </button>
          </form>

          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-sm text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            <span className="text-sm text-gray-700 font-medium">Sign up with Google</span>
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right Panel with Image */}
      <div className="hidden md:block md:w-1/2">
        <img
          src={signupBg}
          alt="Sign up visual"
          className="object-cover w-full h-full rounded-r-lg"
        />
      </div>
    </div>
  );
};

export default Signup;
