'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  label,
  className = '',
  error,
  touched,
  required,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    if (disabled) return;
    onChange(option.value);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full border h-[46px] flex items-center justify-between px-4 rounded-xl transition-all ${
            disabled ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-60' :
            isOpen ? 'bg-white border-teal-700 ring-2 ring-teal-700/10 cursor-pointer' : 
            error && touched ? 'bg-white border-rose-300 cursor-pointer' : 'bg-white border-gray-200 hover:border-gray-300 cursor-pointer'
          }`}
        >
          <span className={`text-sm font-bold truncate ${selectedOption ? 'text-gray-800' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {!disabled && <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-[100] top-full mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 animate-in zoom-in-95 duration-200 max-h-[300px] flex flex-col">
            <div className="px-4 py-2 border-b border-gray-50 flex items-center gap-2">
              <Search size={14} className="text-gray-400" />
              <input
                autoFocus
                type="text"
                className="w-full text-sm font-medium outline-none placeholder:text-gray-300"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <X 
                  size={14} 
                  className="text-gray-400 cursor-pointer hover:text-gray-600" 
                  onClick={() => setSearch('')}
                />
              )}
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`px-4 py-3 text-sm font-bold flex items-center justify-between cursor-pointer transition-colors ${
                      value === option.value ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                    {value === option.value && <Check size={14} />}
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-xs font-black text-gray-300 uppercase tracking-widest">
                  No matches found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && touched && (
        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1">{error}</p>
      )}
    </div>
  );
};

export default SearchableSelect;
