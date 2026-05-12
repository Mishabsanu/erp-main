'use client';

import { FilterChip } from '@/components/shared/FilterChip';
import { Select } from '@/components/ui/Select';
import { Filter, ToggleLeft, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const PRIMARY = '#0f766e';

interface RunningOrderFilterBarProps {
  onStatusChange: (status: string | undefined) => void;
  onTransactionTypeChange: (type: string | undefined) => void;
  onClearFilters: () => void;
  initialStatus?: string;
  initialTransactionType?: string;
  hideStatus?: boolean;
}

export const RunningOrderFilterBar: React.FC<RunningOrderFilterBarProps> = ({
  onStatusChange,
  onTransactionTypeChange,
  onClearFilters,
  initialStatus = undefined,
  initialTransactionType = undefined,
  hideStatus = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(initialStatus || '');
  const [selectedType, setSelectedType] = useState(initialTransactionType || '');

  useEffect(() => {
    onStatusChange(selectedStatus === '' ? undefined : selectedStatus);
  }, [selectedStatus, onStatusChange]);

  useEffect(() => {
    onTransactionTypeChange(selectedType === '' ? undefined : selectedType);
  }, [selectedType, onTransactionTypeChange]);

  const handleClear = () => {
    setSelectedStatus('');
    setSelectedType('');
    onClearFilters();
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-2 mb-3 text-gray-700">
        <Filter className="w-5 h-5" />
        <h3 className="text-sm font-semibold">Filters</h3>
      </div>

      {(selectedStatus || selectedType) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedStatus && (
            <FilterChip
              label="Status"
              value={selectedStatus}
              onRemove={() => setSelectedStatus('')}
              color="blue"
            />
          )}
          {selectedType && (
            <FilterChip
              label="Service Type"
              value={selectedType}
              onRemove={() => setSelectedType('')}
              color="purple"
            />
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {!hideStatus && (
            <div className="w-full sm:w-64">
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Order Status
              </label>
              <div className="relative">
                <ToggleLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="pl-9"
                >
                  <option value="">All Status</option>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Partially Completed">Partially Completed</option>
                  <option value="On Hire">On Hire</option>
                  <option value="Partially Returned">Partially Returned</option>
                </Select>
              </div>
            </div>
          )}

          <div className="w-full sm:w-64">
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Service Type
            </label>
            <div className="relative">
              <ToggleLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-9"
              >
                <option value="">All Types</option>
                <option value="Sale">Sale</option>
                <option value="Hire">Hire</option>
                <option value="Contract">Contract</option>
              </Select>
            </div>
          </div>
        </div>

        {(selectedStatus || selectedType) && (
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
