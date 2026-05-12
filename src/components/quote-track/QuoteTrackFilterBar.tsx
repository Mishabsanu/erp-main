'use client';

import React, { useState, useEffect } from 'react';
import { Select } from '@/components/ui/Select';
import { QuoteTrackFilter } from '@/lib/types';
import { Filter, ToggleLeft, CircleDollarSign, XCircle } from 'lucide-react';
import { FilterChip } from '@/components/shared/FilterChip';

const PRIMARY = '#0f766e';

const statuses = ['Pending', 'Quoted', 'Accepted', 'Rejected'];
const currencies = ['INR', 'USD'];

interface QuoteTrackFilterBarProps {
  onStatusChange: (status: QuoteTrackFilter['status'] | undefined) => void;
  onCurrencyChange: (currency: QuoteTrackFilter['currency'] | undefined) => void;
  onClearFilters: () => void;
  initialStatus?: QuoteTrackFilter['status'];
  initialCurrency?: QuoteTrackFilter['currency'];
}

export const QuoteTrackFilterBar: React.FC<QuoteTrackFilterBarProps> = ({
  onStatusChange,
  onCurrencyChange,
  onClearFilters,
  initialStatus = undefined,
  initialCurrency = undefined,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus || '');
  const [selectedCurrency, setSelectedCurrency] = useState<string>(initialCurrency || '');

  const handleClear = () => {
    setSelectedStatus('');
    setSelectedCurrency('');
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
      {(selectedStatus || selectedCurrency) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedStatus && (
            <FilterChip
              label="Status"
              value={selectedStatus}
              onRemove={() => setSelectedStatus('')}
              color="green"
            />
          )}
          {selectedCurrency && (
            <FilterChip
              label="Currency"
              value={selectedCurrency}
              onRemove={() => setSelectedCurrency('')}
              color="blue"
            />
          )}
        </div>
      )}

      {/* Filters Content */}
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
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedStatus(val);
                  onStatusChange(val === '' ? undefined : (val as QuoteTrackFilter['status']));
                }}
                className="pl-9"
              >
                <option value="">All Status</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>

          {/* Currency Filter */}
          <div className="w-full sm:w-56">
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Currency
            </label>
            <div className="relative">
              <CircleDollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Select
                value={selectedCurrency}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCurrency(val);
                  onCurrencyChange(val === '' ? undefined : (val as QuoteTrackFilter['currency']));
                }}
                className="pl-9"
              >
                <option value="">All Currency</option>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>
        </div>

        {/* Clear Button */}
        {(selectedStatus || selectedCurrency) && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition hover:bg-gray-50 h-10"
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
