import React from 'react';

const Input = React.forwardRef(({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  required, 
  disabled, 
  placeholder, 
  helpText, 
  prefix, 
  suffix,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <div className="input-wrapper relative flex items-center">
        {prefix && <div className="input-prefix absolute left-3 text-gray-500">{prefix}</div>}
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`input w-full ${error ? 'input-error' : ''} ${prefix ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          {...props}
        />
        {suffix && <div className="input-suffix absolute right-3 text-gray-500">{suffix}</div>}
      </div>
      {error && <p id={`${name}-error`} className="form-error text-error text-sm mt-1">{error}</p>}
      {helpText && !error && <p id={`${name}-help`} className="form-help text-muted text-sm mt-1">{helpText}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
