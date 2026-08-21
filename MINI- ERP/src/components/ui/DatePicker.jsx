import React from 'react';
import Input from './Input';

const DatePicker = ({ label, name, value, onChange, error, required, disabled, min, max, ...props }) => {
  return (
    <Input
      type="date"
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      error={error}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      {...props}
    />
  );
};

export default DatePicker;
