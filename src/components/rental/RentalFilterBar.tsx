'use client';

import { FilterChip } from '@/components/shared/FilterChip';
import { Select } from '@/components/ui/Select';
import { Filter, ToggleLeft, XCircle, Calendar } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const PRIMARY = '#0f766e';

interface RentalFilterBarProps {
  onStatusChange: (status: string | undefined) => void;
  onClearFilters: () => void;
  initialStatus?: string;
}

export const RentalFilterBar: React.FC<RentalFilterBarProps> = ({
  onStatusChange,
  onClearFilters,
  initialStatus = '',
}) => {
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);

  useEffect(() => {
    onStatusChange(selectedStatus === '' ? undefined : selectedStatus);
  }, [selectedStatus, onStatusChange]);

  const handleClear = () => {
    setSelectedStatus('');
    onClearFilters();
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-2 mb-3 text-gray-700">
        <Filter className="w-5 h-5 text-[#0f766e]" />
        <h3 className="text-sm font-semibold">Rental Filters</h3>
      </div>

      {selectedStatus && (
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterChip
            label="Status"
            value={selectedStatus}
            onRemove={() => setSelectedStatus('')}
            color="blue"
          />
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64">
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Contract Status
            </label>
            <div className="relative">
              <ToggleLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-9"
              >
                <option value="">All Contracts</option>
                <option value="Active">Active (Items at Site)</option>
                <option value="Closed">Closed (Fully Recovered)</option>
              </Select>
            </div>
          </div>
        </div>

        {selectedStatus && (
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
