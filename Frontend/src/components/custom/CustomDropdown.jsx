import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomDropdown = ({
  options,
  value,
  onChange,
  name,
  placeholder,
  disabled,
  renderLabel, // optional function to customize displayed label
  searchable = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    // If option is an object with a value property, extract it (unless we want to pass the whole object)
    // To match standard HTML select behavior, we pass the option.value if it exists, else the option itself.
    const selectedValue = typeof option === 'object' && option !== null && 'value' in option ? option.value : option;
    onChange({ target: { name, value: selectedValue } });
    setIsOpen(false);
    setSearchTerm('');
  };

  // Helper to get display label for the currently selected value
  const getSelectedLabel = () => {
    if (!value) return placeholder;
    const selectedOpt = options.find(opt => {
      const optValue = typeof opt === 'object' && opt !== null && 'value' in opt ? opt.value : opt;
      return String(optValue) === String(value);
    });
    if (selectedOpt) {
      if (typeof selectedOpt === 'object' && selectedOpt !== null && 'label' in selectedOpt) {
        return selectedOpt.label;
      }
      return selectedOpt;
    }
    return value || placeholder;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
          } ${className}`}
      >
        <span className={`block truncate ${value ? 'text-slate-900' : 'text-slate-500'}`}>
          {getSelectedLabel()}
        </span>
        <ChevronDown size={20} className="text-slate-400 shrink-0" />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 flex flex-col overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-slate-100 bg-white">
              <input
                type="text"
                autoFocus
                className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="overflow-y-auto">
            {options.filter(opt => {
              if (!searchable || !searchTerm) return true;
              const isObj = typeof opt === 'object' && opt !== null;
              const optLabel = isObj && 'label' in opt ? opt.label : opt;
              const displayLabel = renderLabel ? renderLabel(opt) : optLabel;
              return String(displayLabel).toLowerCase().includes(searchTerm.toLowerCase());
            }).map((opt, idx) => {
              const isObj = typeof opt === 'object' && opt !== null;
              const optValue = isObj && 'value' in opt ? opt.value : opt;
              const optLabel = isObj && 'label' in opt ? opt.label : opt;
              const displayLabel = renderLabel ? renderLabel(opt) : optLabel;

              return (
                <div
                  key={optValue || idx}
                  onClick={() => handleSelect(opt)}
                  className="px-4 py-2.5 hover:bg-indigo-50 text-slate-700 cursor-pointer text-sm transition-colors border-b border-slate-50 last:border-0"
                >
                  {displayLabel}
                </div>
              );
            })}
            {options.filter(opt => {
              if (!searchable || !searchTerm) return true;
              const isObj = typeof opt === 'object' && opt !== null;
              const optLabel = isObj && 'label' in opt ? opt.label : opt;
              const displayLabel = renderLabel ? renderLabel(opt) : optLabel;
              return String(displayLabel).toLowerCase().includes(searchTerm.toLowerCase());
            }).length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">No results found</div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;