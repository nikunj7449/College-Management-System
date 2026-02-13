import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const MultiSelectDropdown = ({ 
  options, 
  value = [], 
  onChange, 
  name, 
  placeholder, 
  disabled 
}) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const toggleOption = (option) => {
    const newValue = value.includes(option)
      ? value.filter(item => item !== option)
      : [...value, option];
    onChange({ target: { name, value: newValue } });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
          disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <span className={`block truncate ${value.length > 0 ? 'text-slate-900' : 'text-slate-500'}`}>
          {value.length > 0 ? `${value.length} selected` : placeholder}
        </span>
        <ChevronDown size={20} className="text-slate-400 shrink-0" />
      </button>
      
      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => toggleOption(opt)}
              className="px-4 py-2.5 hover:bg-indigo-50 text-slate-700 cursor-pointer text-sm transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between"
            >
              <span>{opt}</span>
              {value.includes(opt) && <Check size={16} className="text-indigo-600" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;