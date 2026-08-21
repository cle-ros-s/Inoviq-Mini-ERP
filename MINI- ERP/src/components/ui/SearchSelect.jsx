import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Plus } from 'lucide-react';

const SearchSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required,
  disabled,
  placeholder = "Search and select...",
  onCreateNew
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);
  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="form-group relative" ref={wrapperRef}>
      {label && (
        <label className="form-label">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <div 
        className={`input w-full flex justify-between items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''} ${error ? 'border-error' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-white p-2 border-b border-border">
            <div className="relative">
              <input
                type="text"
                className="input w-full px-3 py-1.5 text-sm"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>
          <div className="p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-primary hover:text-white rounded-sm ${value === opt.value ? 'bg-primary-surface text-primary font-medium' : ''}`}
                  onClick={() => {
                    onChange({ target: { name, value: opt.value } });
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-center text-gray-500">
                No options found
              </div>
            )}
            
            {onCreateNew && (
              <div 
                className="px-3 py-2 mt-1 text-sm text-primary font-medium border-t border-border cursor-pointer hover:bg-gray-50 flex items-center gap-2"
                onClick={() => {
                  onCreateNew(search);
                  setIsOpen(false);
                }}
              >
                <Plus className="w-4 h-4" /> Create new "{search}"
              </div>
            )}
          </div>
        </div>
      )}
      {error && <p className="form-error text-error text-sm mt-1">{error}</p>}
    </div>
  );
};

export default SearchSelect;
