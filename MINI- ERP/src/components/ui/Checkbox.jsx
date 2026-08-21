import React from 'react';
import { Check } from 'lucide-react';

const Checkbox = ({ label, name, checked, onChange, disabled, helpText }) => {
  return (
    <div className="flex items-start gap-2">
      <div className="relative flex items-center pt-1">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer appearance-none w-5 h-5 border-2 border-border rounded-sm bg-white checked:bg-primary checked:border-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        />
        <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
      </div>
      {(label || helpText) && (
        <label htmlFor={name} className={`text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          {label && <div className="font-medium text-gray-800">{label}</div>}
          {helpText && <div className="text-muted mt-0.5">{helpText}</div>}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
