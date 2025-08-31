import React from 'react';
import Aurora from './Aurora';
import FloatingElements from './FloatingElements';

// Aurora Background component with predefined variants
const AuroraBackground = ({ 
  variant = 'hero', 
  className = '', 
  children, 
  showFloatingElements = true,
  floatingVariant,
  ...props 
}) => {
  const variants = {
    hero: {
      colorStops: ["#3A29FF", "#FF94B4", "#FF3232"],
      amplitude: 1.2,
      blend: 0.5,
      speed: 0.5,
      opacity: 1.0
    },
    subtle: {
      colorStops: ["#3A29FF", "#FF94B4", "#FF3232"],
      amplitude: 0.6,
      blend: 0.3,
      speed: 0.3,
      opacity: 0.6
    },
    auth: {
      colorStops: ["#3A29FF", "#FF94B4", "#FF3232"],
      amplitude: 0.8,
      blend: 0.4,
      speed: 0.4,
      opacity: 0.8
    },
    dashboard: {
      colorStops: ["#3A29FF", "#FF94B4", "#FF3232"],
      amplitude: 0.5,
      blend: 0.2,
      speed: 0.2,
      opacity: 0.4
    },
    accent: {
      colorStops: ["#FF94B4", "#3A29FF", "#FF3232"],
      amplitude: 1.0,
      blend: 0.6,
      speed: 0.6,
      opacity: 0.9
    },
    minimal: {
      colorStops: ["#3A29FF", "#FF94B4", "#3A29FF"],
      amplitude: 0.3,
      blend: 0.2,
      speed: 0.1,
      opacity: 0.3
    }
  };

  const variantProps = variants[variant] || variants.hero;
  const combinedProps = { ...variantProps, ...props };

  return (
    <div className={`relative ${className}`}>
      {/* Aurora Background */}
      <div className="absolute inset-0 overflow-hidden">
        <Aurora {...combinedProps} />
      </div>
      
      {/* Floating Elements */}
      {showFloatingElements && (
        <FloatingElements variant={floatingVariant || variant} />
      )}
      
      {/* Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
};

export default AuroraBackground;
