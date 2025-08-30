import React from 'react';
import { 
  CalendarIcon, 
  UsersIcon, 
  SparklesIcon, 
  MapPinIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const About = () => {
  const features = [
    {
      icon: CalendarIcon,
      title: 'Easy Event Creation',
      description: 'Create and manage events with our intuitive interface. Set up tickets, pricing, and registration in minutes.',
    },
    {
      icon: UsersIcon,
      title: 'Seamless Booking',
      description: 'Simple and secure booking process for attendees. QR code tickets and instant confirmations.',
    },
    {
      icon: SparklesIcon,
      title: 'Real-time Analytics',
      description: 'Track your event performance with detailed analytics, attendee insights, and revenue reports.',
    },
    {
      icon: MapPinIcon,
      title: 'Location Discovery',
      description: 'Find events near you with our location-based search and personalized recommendations.',
    },
  ];

  const stats = [
    { label: 'Events Created', value: '10,000+' },
    { label: 'Happy Attendees', value: '500,000+' },
    { label: 'Event Organizers', value: '5,000+' },
    { label: 'Cities Covered', value: '100+' },
  ];

  const values = [
    'Simplicity in event management',
    'Seamless user experience',
    'Reliable and secure platform',
    'Community-driven approach',
    'Innovation in event technology',
    'Exceptional customer support',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About EventHive
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to make event management simple, accessible, and enjoyable for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                EventHive was born from the belief that organizing and attending events should be effortless and enjoyable. We've experienced the frustration of complex event management systems and wanted to create something better.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our platform connects event organizers with attendees through a seamless, intuitive interface that handles everything from event creation to ticket sales and analytics.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What We Believe</h3>
              <ul className="space-y-3">
                {values.map((value, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              EventHive by the Numbers
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands who trust EventHive for their events
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EventHive?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create, manage, and attend amazing events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built by Event Enthusiasts
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our team combines years of experience in event management, technology, and user experience design
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of event organizers and attendees who trust EventHive for their event management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register"
                className="btn btn-primary btn-lg"
              >
                Start Creating Events
              </a>
              <a
                href="/events"
                className="btn btn-outline btn-lg"
              >
                Browse Events
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

