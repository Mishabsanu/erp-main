'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchInputProps {
  initialSearchTerm?: string;
  onSearchChange: (searchTerm: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  initialSearchTerm = '',
  onSearchChange,
  placeholder = 'Search...',
}) => {
  const [inputValue, setInputValue] = useState(initialSearchTerm);
  const debouncedSearchTerm = useDebounce(inputValue, 500); // 500ms debounce

  const onSearchChangeRef = useRef(onSearchChange);
  
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  useEffect(() => {
    if (debouncedSearchTerm !== initialSearchTerm) {
      onSearchChangeRef.current(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, initialSearchTerm]);

  // Update internal input value if initialSearchTerm changes from outside
  useEffect(() => {
    setInputValue(initialSearchTerm);
  }, [initialSearchTerm]);

  return (
    <div className="relative flex items-center w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full shadow-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition duration-150 ease-in-out"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </div>
  );
};
