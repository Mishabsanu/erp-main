'use client';

import { FilterChip } from '@/components/shared/FilterChip';
import { Select } from '@/components/ui/Select';
import { Filter, ToggleLeft, XCircle, Layers } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const PRIMARY = '#0f766e';

interface UtilityFilterBarProps {
  onCategoryChange: (category: string | undefined) => void;
  onClearFilters: () => void;
  initialCategory?: string;
}

export const UtilityFilterBar: React.FC<UtilityFilterBarProps> = ({
  onCategoryChange,
  onClearFilters,
  initialCategory = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    onCategoryChange(selectedCategory === '' ? undefined : selectedCategory);
  }, [selectedCategory, onCategoryChange]);

  const handleClear = () => {
    setSelectedCategory('');
    onClearFilters();
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-2 mb-3 text-gray-700">
        <Filter className="w-5 h-5 text-[#0f766e]" />
        <h3 className="text-sm font-semibold">Utility Filters</h3>
      </div>

      {selectedCategory && (
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterChip
            label="Category"
            value={selectedCategory}
            onRemove={() => setSelectedCategory('')}
            color="purple"
          />
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64">
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Asset Category
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-9"
              >
                <option value="">All Categories</option>
                <option value="Safety Gear">Safety Gear</option>
                <option value="Uniform">Uniform</option>
                <option value="Tools">Tools</option>
                <option value="Industrial Gear">Industrial Gear</option>
                <option value="Other">Other</option>
              </Select>
            </div>
          </div>
        </div>

        {selectedCategory && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition hover:bg-gray-50"
            style={{ borderColor: PRIMARY, color: PRIMARY }}
          >
            <XCircle className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};
