import React from 'react';
import AuroraBackground from './AuroraBackground';
import Card from './Card';

const AuroraShowcase = () => {
  const variants = [
    {
      name: 'Hero',
      variant: 'hero',
      description: 'Bold and vibrant for main landing sections',
      className: 'h-64 text-white'
    },
    {
      name: 'Subtle',
      variant: 'subtle', 
      description: 'Gentle background for content sections',
      className: 'h-48 text-white'
    },
    {
      name: 'Auth',
      variant: 'auth',
      description: 'Elegant backdrop for authentication pages',
      className: 'h-48 text-white'
    },
    {
      name: 'Dashboard',
      variant: 'dashboard',
      description: 'Minimal accent for dashboard headers',
      className: 'h-40 text-white'
    },
    {
      name: 'Accent',
      variant: 'accent',
      description: 'Dynamic colors for special sections',
      className: 'h-48 text-white'
    },
    {
      name: 'Minimal',
      variant: 'minimal',
      description: 'Ultra-subtle for admin interfaces',
      className: 'h-32 text-gray-700'
    }
  ];

  return (
    <div className="space-y-8 p-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Aurora Background Variants
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore the different Aurora background variants used throughout EventHive, 
          each designed for specific UI contexts with the brand color palette.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {variants.map((variant) => (
          <Card key={variant.name} className="overflow-hidden">
            <AuroraBackground 
              variant={variant.variant}
              className={`${variant.className} flex items-center justify-center`}
              showFloatingElements={variant.variant === 'hero'}
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{variant.name}</h3>
                <p className="opacity-90">{variant.description}</p>
              </div>
            </AuroraBackground>
            
            <Card.Content className="p-4">
              <div className="text-sm text-gray-600">
                <strong>Usage:</strong> {variant.description}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Variant: <code className="bg-gray-100 px-2 py-1 rounded">{variant.variant}</code>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AuroraShowcase;
