import React from 'react';
import { Link } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '#' },
      { name: 'Blog', href: '#' },
    ],
    services: [
      { name: 'Event Management', href: '/events' },
      { name: 'Ticket Booking', href: '/events' },
      { name: 'Event Analytics', href: '#' },
      { name: 'Custom Solutions', href: '#' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Privacy Policy', href: '#' },
    ],
    social: [
      { name: 'Facebook', href: '#', icon: 'facebook' },
      { name: 'Twitter', href: '#', icon: 'twitter' },
      { name: 'Instagram', href: '#', icon: 'instagram' },
      { name: 'LinkedIn', href: '#', icon: 'linkedin' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img
                  src="/EventHive.png"
                  alt="EventHive"
                  className="h-8 w-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="text-xl font-bold hidden">EventHive</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Your comprehensive event management platform. Create, discover, and manage events with ease.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>support@eventhive.com</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <PhoneIcon className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <MapPinIcon className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wider mb-4">
                Services
              </h3>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">
                Stay updated with EventHive
              </h3>
              <p className="text-sm text-gray-300">
                Get the latest news, updates, and exclusive offers delivered to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="btn btn-primary btn-md whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-gray-300">
              <span>© {currentYear} EventHive. Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>by EventHive Team. All rights reserved.</span>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {footerLinks.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={item.name}
                >
                  <span className="sr-only">{item.name}</span>
                  {/* Social icons would go here */}
                  <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs font-semibold">
                    {item.name.charAt(0)}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

