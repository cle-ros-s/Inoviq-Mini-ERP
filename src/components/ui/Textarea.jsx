import React from 'react';

const Textarea = React.forwardRef(({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required, 
  disabled, 
  placeholder, 
  rows = 3,
  helpText,
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
      <textarea
        ref={ref}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        className={`input w-full py-2 resize-y ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        {...props}
      />
      {error && <p id={`${name}-error`} className="form-error text-error text-sm mt-1">{error}</p>}
      {helpText && !error && <p id={`${name}-help`} className="form-help text-muted text-sm mt-1">{helpText}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
