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
        <label className="form-label">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-input ${error ? 'border-danger-500 focus-visible:ring-danger-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

