import React from 'react';

const FloatingElements = ({ variant = 'default', className = '' }) => {
  const variants = {
    default: [
      { 
        size: 'w-20 h-20', 
        position: 'top-20 left-10', 
        gradient: 'from-purple-400 to-pink-400', 
        delay: '0s' 
      },
      { 
        size: 'w-16 h-16', 
        position: 'bottom-20 right-10', 
        gradient: 'from-blue-400 to-purple-400', 
        delay: '2s' 
      },
      { 
        size: 'w-12 h-12', 
        position: 'top-1/2 left-1/4', 
        gradient: 'from-pink-400 to-red-400', 
        delay: '4s' 
      }
    ],
    hero: [
      { 
        size: 'w-24 h-24', 
        position: 'top-16 right-16', 
        gradient: 'from-primary-400 to-accent-400', 
        delay: '0s' 
      },
      { 
        size: 'w-20 h-20', 
        position: 'bottom-24 left-16', 
        gradient: 'from-accent-400 to-danger-400', 
        delay: '1.5s' 
      },
      { 
        size: 'w-16 h-16', 
        position: 'top-1/3 left-1/3', 
        gradient: 'from-primary-400 to-danger-400', 
        delay: '3s' 
      },
      { 
        size: 'w-14 h-14', 
        position: 'bottom-1/3 right-1/4', 
        gradient: 'from-danger-400 to-primary-400', 
        delay: '4.5s' 
      }
    ],
    minimal: [
      { 
        size: 'w-8 h-8', 
        position: 'top-10 right-10', 
        gradient: 'from-primary-300 to-accent-300', 
        delay: '0s' 
      },
      { 
        size: 'w-6 h-6', 
        position: 'bottom-10 left-10', 
        gradient: 'from-accent-300 to-primary-300', 
        delay: '2s' 
      }
    ]
  };

  const elements = variants[variant] || variants.default;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {elements.map((element, index) => (
        <div
          key={index}
          className={`absolute ${element.size} ${element.position} bg-gradient-to-r ${element.gradient} rounded-full opacity-20 animate-float blur-xl`}
          style={{ animationDelay: element.delay }}
        />
      ))}
      
      {/* Additional subtle particles for hero variant */}
      {variant === 'hero' && (
        <>
          <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/5 w-3 h-3 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-2/3 right-1/5 w-2 h-2 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
        </>
      )}
    </div>
  );
};

export default FloatingElements;
