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
  style = {},
  ...props
}, ref) => {
  return (
    <div className={`form-group ${className}`} style={{ width: '100%', marginBottom: '16px', ...style }}>
      {label && (
        <label htmlFor={name} className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
          {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        <select
          ref={ref}
          id={name}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          className={`select ${error ? 'select-error' : ''}`}
          style={{
            width: '100%',
            height: '38px',
            color: value ? 'var(--color-gray-900)' : 'var(--color-gray-500)',
            backgroundColor: disabled ? 'var(--color-gray-100)' : '#FFFFFF',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          {...props}
        >
          {placeholder && <option value="" disabled hidden>{placeholder}</option>}
          {options.map((opt, idx) => {
            const optVal = typeof opt === 'object' ? (opt.value !== undefined ? opt.value : opt.id) : opt;
            const optLabel = typeof opt === 'object' ? (opt.label || opt.name || opt.companyName || opt.title || opt.value || opt.id) : opt;
            return (
              <option key={optVal || idx} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>
      </div>
      {error && <p id={`${name}-error`} style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
      {helpText && !error && <p id={`${name}-help`} style={{ color: 'var(--color-gray-500)', fontSize: '12px', marginTop: '4px' }}>{helpText}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
