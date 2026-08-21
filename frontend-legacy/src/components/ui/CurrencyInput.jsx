import React from 'react';
import Input from './Input';

const CurrencyInput = ({ label, name, value, onChange, error, required, disabled, symbol = '₹', ...props }) => {
  
  const handleChange = (e) => {
    // Only allow numbers and one decimal
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      onChange(e);
    }
  };

  return (
    <Input
      type="text"
      label={label}
      name={name}
      value={value}
      onChange={handleChange}
      error={error}
      required={required}
      disabled={disabled}
      prefix={symbol}
      placeholder="0.00"
      {...props}
    />
  );
};

export default CurrencyInput;
