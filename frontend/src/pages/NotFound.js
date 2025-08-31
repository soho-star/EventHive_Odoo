import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Button from '../components/UI/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-primary-500/20 border border-primary-500/30 rounded-full flex items-center justify-center mb-8">
            <span className="text-4xl font-bold text-primary-400">404</span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Page Not Found
          </h1>
          
          <p className="text-gray-300 mb-8 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you might have entered the wrong URL.
          </p>
          
          <div className="space-y-4">
            <Link to="/">
              <Button className="w-full">
                <HomeIcon className="w-5 h-5 mr-2" />
                Go Home
              </Button>
            </Link>
            
            <Link to="/events">
              <Button variant="outline" className="w-full border-gray-600 bg-transparent text-white hover:bg-gray-800">
                <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                Browse Events
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-400">
            <p>
              Need help? <Link to="/contact" className="text-primary-400 hover:text-primary-300">Contact us</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

