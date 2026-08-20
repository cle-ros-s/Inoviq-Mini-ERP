import React from 'react';

const Select = React.forwardRef(({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required,
  disabled,
  placeholder = "Select an option",
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
      <div className="relative">
        <select
          ref={ref}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`select w-full ${error ? 'input-error' : ''} ${!value ? 'text-gray-500' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          {...props}
        >
          {placeholder && <option value="" disabled hidden>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {error && <p id={`${name}-error`} className="form-error text-error text-sm mt-1">{error}</p>}
      {helpText && !error && <p id={`${name}-help`} className="form-help text-muted text-sm mt-1">{helpText}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
