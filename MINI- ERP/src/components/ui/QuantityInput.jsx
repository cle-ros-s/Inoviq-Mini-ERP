import React from 'react';
import { Minus, Plus } from 'lucide-react';

const QuantityInput = ({ label, name, value = 0, onChange, error, required, disabled, min = 0, max, step = 1 }) => {
  
  const handleDecrement = () => {
    if (disabled) return;
    const newVal = Math.max(min, Number(value) - step);
    onChange({ target: { name, value: newVal } });
  };

  const handleIncrement = () => {
    if (disabled) return;
    const newVal = max !== undefined ? Math.min(max, Number(value) + step) : Number(value) + step;
    onChange({ target: { name, value: newVal } });
  };

  const handleChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    if (max !== undefined && val > max) return;
    if (val < min) return;
    onChange({ target: { name, value: val } });
  };

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <div className="flex items-center">
        <button 
          type="button" 
          className="btn btn-secondary px-3 rounded-r-none border-r-0"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`input w-24 text-center rounded-none focus:z-10 ${error ? 'border-error' : ''}`}
          min={min}
          max={max}
          step={step}
        />
        <button 
          type="button" 
          className="btn btn-secondary px-3 rounded-l-none border-l-0"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="form-error text-error text-sm mt-1">{error}</p>}
    </div>
  );
};

export default QuantityInput;
