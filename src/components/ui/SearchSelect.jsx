import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, Plus, Check, Loader2, AlertCircle } from 'lucide-react';

export default function SearchSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required,
  disabled,
  placeholder = "Search and select...",
  searchPlaceholder = "Type to filter...",
  onCreateNew,
  className = '',
  loading = false,
  loadingText = "Loading...",
  emptyText = "No options available.",
  renderOption,
  renderSelected,
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const selectedOption = options.find(o => String(o.value) === String(value));
  
  const filteredOptions = options.filter(o => {
    const s = (search || '').toLowerCase().trim();
    if (!s) return true;
    const labelMatch = (o.label || '').toLowerCase().includes(s);
    const subMatch = (o.subLabel || '').toLowerCase().includes(s);
    const skuMatch = (o.sku || '').toLowerCase().includes(s);
    return labelMatch || subMatch || skuMatch;
  });

  const handleSelect = (optValue) => {
    if (onChange) {
      onChange({ target: { name, value: optValue } });
    }
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div 
      className={`form-group search-select-container ${className}`} 
      ref={wrapperRef} 
      style={{ position: 'relative', width: '100%', zIndex: isOpen ? 1200 : 'auto', ...style }}
    >
      {label && (
        <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
        </label>
      )}

      {/* Trigger Box */}
      <div 
        className={`select-trigger ${disabled ? 'disabled' : ''} ${error ? 'error' : ''} ${isOpen ? 'focused' : ''}`}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (!disabled) setIsOpen(true);
          } else if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '38px',
          padding: '6px 12px',
          backgroundColor: disabled ? 'var(--color-gray-100)' : '#FFFFFF',
          border: error ? '1px solid var(--color-error)' : isOpen ? '1px solid var(--color-primary)' : '1px solid var(--color-border-strong)',
          borderRadius: 'var(--radius-md)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: selectedOption ? 'var(--color-gray-900)' : 'var(--color-gray-500)',
          fontSize: 'var(--font-size-sm)',
          boxShadow: isOpen ? '0 0 0 3px rgba(166, 124, 82, 0.15)' : 'none',
          transition: 'all 0.15s ease',
          userSelect: 'none'
        }}
      >
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
          {renderSelected && selectedOption ? (
            renderSelected(selectedOption)
          ) : selectedOption ? (
            <span>{selectedOption.label} {selectedOption.subLabel && <span style={{ color: 'var(--color-gray-500)', fontSize: '12px' }}>({selectedOption.subLabel})</span>}</span>
          ) : (
            <span>{loading ? loadingText : placeholder}</span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px', flexShrink: 0 }}>
          {loading && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-primary)' }} />}
          <ChevronDown 
            size={16} 
            style={{ 
              color: 'var(--color-gray-500)', 
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }} 
          />
        </div>
      </div>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div 
          className="search-select-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 12px 32px rgba(32, 28, 25, 0.2)',
            maxHeight: '280px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Search Bar - Fixed at top with clear padding and search icon */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#FAFAFA' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--color-gray-500)', pointerEvents: 'none' }} />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsOpen(false);
                  if (e.key === 'Enter' && filteredOptions.length > 0) {
                    e.preventDefault();
                    handleSelect(filteredOptions[0].value);
                  }
                }}
                style={{
                  width: '100%',
                  height: '34px',
                  paddingLeft: '32px',
                  paddingRight: '10px',
                  fontSize: '13px',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: '4px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-gray-900)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Options List with Vertical Scrolling */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 size={16} className="animate-spin" /> {loadingText}
              </div>
            ) : options.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--color-gray-500)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={20} style={{ color: 'var(--color-warning)' }} />
                <span>{emptyText}</span>
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(value) === String(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      fontSize: '13px',
                      color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-gray-800)',
                      backgroundColor: isSelected ? 'var(--color-primary-surface)' : 'transparent',
                      fontWeight: isSelected ? 600 : 400,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.1s ease',
                      marginBottom: '2px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {renderOption ? (
                      renderOption(opt, isSelected)
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span>{opt.label}</span>
                        {opt.subLabel && <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>{opt.subLabel}</span>}
                      </div>
                    )}
                    {isSelected && <Check size={14} style={{ color: 'var(--color-primary)', flexShrink: 0, marginLeft: '8px' }} />}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--color-gray-500)' }}>
                No matches found for "{search}"
              </div>
            )}

            {/* Optional Create New Item Action */}
            {onCreateNew && search.trim() && (
              <div 
                onClick={() => {
                  onCreateNew(search.trim());
                  setIsOpen(false);
                  setSearch('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  borderTop: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  backgroundColor: '#FAFAFA',
                  borderRadius: '0 0 4px 4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-surface)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
              >
                <Plus size={14} /> Create new "{search.trim()}"
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="form-error text-error text-sm mt-1" style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
    </div>
  );
}
