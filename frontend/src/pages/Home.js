import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  SparklesIcon,
  MapIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Button from '../components/UI/Button';
import BlurText from '../components/UI/BlurText';
import EventMap from '../components/UI/EventMap';
import eventService from '../services/eventService';

const Home = () => {
  // Fetch featured events for the map
  const { data: featuredEventsData } = useQuery(
    'featured-events',
    () => eventService.getFeaturedEvents(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const featuredEvents = featuredEventsData?.data?.events || [];

  return (
    <div className="min-h-screen text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-6 pt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* New Background Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
            <SparklesIcon className="w-4 h-4 mr-2" />
            New Event Platform
          </div>

          {/* Main Heading */}
          <div className="mb-8">
            <BlurText
              text="Bring extraordinary events to life,"
              delay={150}
              animateBy="words"
              direction="top"
              className="text-5xl md:text-7xl font-serif font-normal leading-tight text-white"
            />
            <div className="flex justify-center mt-2">
              <BlurText
                text="With "
                delay={150}
                animateBy="words"
                direction="top"
                className="text-5xl md:text-7xl font-serif font-normal leading-tight text-white"
              />
              <BlurText
                text="EventHive"
                delay={300}
                animateBy="words"
                direction="top"
                className="text-5xl md:text-7xl font-serif italic leading-tight text-white"
              />
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-xl text-gray-300 mb-12 leading-relaxed max-w-xl mx-auto">
            Create, discover, and manage unforgettable events with EventHive's powerful and intuitive platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/auth/register">
              <Button 
                size="lg" 
                className="bg-white text-gray-900 hover:bg-gray-100 border-0 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg"
              >
                Get Started
              </Button>
            </Link>
            <Link to="/events">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 bg-transparent text-white hover:bg-white/10 px-8 py-4 text-lg rounded-xl backdrop-blur-sm"
              >
                Learn More
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Trusted by 10,000+ organizers
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              500K+ events created
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
              99.9% uptime guaranteed
            </div>
          </div>
        </div>
      </div>

      {/* Featured Events Map Section */}
      {featuredEvents.length > 0 && (
        <div className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 mb-6 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                <MapIcon className="w-4 h-4 mr-2" />
                Discover Events Near You
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-normal mb-6">
                Featured Events
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Explore popular events happening around the world. Click on any marker to learn more.
              </p>
            </div>

            {/* Map Container */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
                <EventMap
                  initialFilters={{}}
                  height="500px"
                  showControls={true}
                  showUserLocation={true}
                  className="w-full"
                />
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link to="/events">
                  <Button 
                    size="lg" 
                    className="bg-white text-gray-900 hover:bg-gray-100 border-0 px-8 py-3 font-semibold rounded-xl"
                  >
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    View All Events
                  </Button>
                </Link>
                <Link to="/events?view=map">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/30 bg-transparent text-white hover:bg-white/10 px-8 py-3 rounded-xl backdrop-blur-sm"
                  >
                    <MapIcon className="w-5 h-5 mr-2" />
                    Explore Map
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

