'use client';

import React, { useState, useEffect } from 'react';
import { Select } from '@/components/ui/Select';
import { Filter, ToggleLeft, Type, XCircle } from 'lucide-react';
import { FilterChip } from '@/components/shared/FilterChip';

const PRIMARY = '#0f766e';

const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Bank', 'Cash'];

interface AccountFilterBarProps {
  onStatusChange: (status: string | undefined) => void;
  onTypeChange: (type: string | undefined) => void;
  onClearFilters: () => void;
  initialStatus?: string;
  initialType?: string;
}

export const AccountFilterBar: React.FC<AccountFilterBarProps> = ({
  onStatusChange,
  onTypeChange,
  onClearFilters,
  initialStatus = '',
  initialType = '',
}) => {
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedType, setSelectedType] = useState(initialType);

  const handleClear = () => {
    setSelectedStatus('');
    setSelectedType('');
    onClearFilters();
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4 text-gray-700">
        <Filter className="w-5 h-5 text-[#0f766e]" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Filters</h3>
      </div>

      {(selectedStatus || selectedType) && (
        <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
          {selectedStatus && (
            <FilterChip
              label="Status"
              value={selectedStatus}
              onRemove={() => setSelectedStatus('')}
              color="green"
            />
          )}
          {selectedType && (
            <FilterChip
              label="Type"
              value={selectedType}
              onRemove={() => setSelectedType('')}
              color="blue"
            />
          )}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="w-full sm:w-64">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
            Account Status
          </label>
          <div className="relative">
             <ToggleLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <Select
              value={selectedStatus}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedStatus(val);
                onStatusChange(val === '' ? undefined : val);
              }}
              className="pl-9 h-11 rounded-xl"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
            Account Type
          </label>
          <div className="relative">
             <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <Select
              value={selectedType}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedType(val);
                onTypeChange(val === '' ? undefined : val);
              }}
              className="pl-9 h-11 rounded-xl"
            >
              <option value="">All Types</option>
              {accountTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </div>
        </div>

        {(selectedStatus || selectedType) && (
          <div className="flex items-center pb-0.5 ml-auto">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-teal-100 text-teal-700 hover:bg-teal-50 transition-all active:scale-95"
            >
              <XCircle className="w-4 h-4 text-[#0f766e]" />
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
