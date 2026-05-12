'use client';

import React, { useState, useEffect } from 'react';
import { Select } from '@/components/ui/Select';
import { RoleFilter } from '@/lib/types';
import { Filter, ToggleLeft, XCircle } from 'lucide-react';
import { FilterChip } from '@/components/shared/FilterChip';

const PRIMARY = '#0f766e';

interface RoleFilterBarProps {
  onStatusChange: (status: RoleFilter['status']) => void;
  onClearFilters: () => void;
  initialStatus?: RoleFilter['status'];
}

export const RoleFilterBar: React.FC<RoleFilterBarProps> = ({
  onStatusChange,
  onClearFilters,
  initialStatus = undefined,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(initialStatus || '');

  useEffect(() => {
    onStatusChange(selectedStatus === '' ? undefined : (selectedStatus as RoleFilter['status']));
  }, [selectedStatus, onStatusChange]);

  const handleClear = () => {
    setSelectedStatus('');
    onClearFilters();
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 text-gray-700">
        <Filter className="w-5 h-5" />
        <h3 className="text-sm font-semibold">Filters</h3>
      </div>

      {/* Active Filter Chips */}
      {selectedStatus && (
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterChip
            label="Status"
            value={selectedStatus}
            onRemove={() => setSelectedStatus('')}
            color="green"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="w-full sm:w-56">
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Status
            </label>
            <div className="relative">
              <ToggleLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-9"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Clear All Button */}
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
