'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DeliveryTicketFilter } from '@/lib/types';
import { Filter, ToggleLeft, CalendarDays, XCircle } from 'lucide-react';
import { FilterChip } from '@/components/shared/FilterChip';

const PRIMARY = '#0f766e';

interface DeliveryTicketFilterBarProps {
  onStatusChange: (status: DeliveryTicketFilter['status']) => void;
  onStartDateChange: (date: string | undefined) => void;
  onEndDateChange: (date: string | undefined) => void;
  onCategoryChange: (category: string | undefined) => void;
  onClearFilters: () => void;
  initialStatus?: DeliveryTicketFilter['status'];
  initialStartDate?: string;
  initialEndDate?: string;
  initialCategory?: string;
}

export const DeliveryTicketFilterBar: React.FC<DeliveryTicketFilterBarProps> = ({
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onCategoryChange,
  onClearFilters,
  initialStatus = undefined,
  initialStartDate = undefined,
  initialEndDate = undefined,
  initialCategory = undefined,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(initialStatus || '');
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');

  useEffect(() => {
    onStatusChange(selectedStatus === '' ? undefined : (selectedStatus as DeliveryTicketFilter['status']));
  }, [selectedStatus, onStatusChange]);

  useEffect(() => {
    onStartDateChange(startDate === '' ? undefined : startDate);
  }, [startDate, onStartDateChange]);

  useEffect(() => {
    onEndDateChange(endDate === '' ? undefined : endDate);
  }, [endDate, onEndDateChange]);

  useEffect(() => {
    onCategoryChange(selectedCategory === '' ? undefined : selectedCategory);
  }, [selectedCategory, onCategoryChange]);


  const handleClear = () => {
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    setSelectedCategory('');
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
      {(startDate || endDate || selectedCategory) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategory && (
            <FilterChip
              label="Service Type"
              value={selectedCategory}
              onRemove={() => setSelectedCategory('')}
              color="purple"
            />
          )}
          {startDate && (
            <FilterChip
              label="From"
              value={startDate}
              onRemove={() => setStartDate('')}
              color="blue"
            />
          )}
          {endDate && (
            <FilterChip
              label="To"
              value={endDate}
              onRemove={() => setEndDate('')}
              color="blue"
            />
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div className="w-full sm:w-48">
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Service Type
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-9"
              >
                <option value="">All Service Types</option>
                <option value="Sale">Sale</option>
                <option value="Hire">Hire</option>
                <option value="Contract">Contract</option>
              </Select>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
              <label htmlFor="startDate" className="block text-xs font-medium text-gray-600 mb-1">
                From
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <label htmlFor="endDate" className="block text-xs font-medium text-gray-600 mb-1">
                To
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clear All Button */}
        {(selectedStatus || startDate || endDate || selectedCategory) && (
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
