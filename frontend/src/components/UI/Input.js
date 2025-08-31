import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  type = 'text',
  placeholder,
  className = '',
  required = false,
  disabled = false,
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${error ? 'border-red-500 focus:ring-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

