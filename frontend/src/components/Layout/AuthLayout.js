import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Squares from '../UI/Squares';

const AuthLayout = () => {
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
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex justify-center">
            <img
              src="/EventHive.png"
              alt="EventHive"
              className="h-12 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="text-2xl font-bold text-white hidden">EventHive</span>
          </Link>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-700">
            <Outlet />
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            ← Back to EventHive
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

