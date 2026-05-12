'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Filter, ToggleLeft, CalendarDays, XCircle } from 'lucide-react';
import { FilterChip } from '@/components/shared/FilterChip';

const PRIMARY = '#0f766e';

const statuses = [
  'New Lead',
  'Call Required',
  'Contacted',
  'Follow-Up',
  'Quotation Sent',
  'Negotiation',
  'Interested',
  'Not Interested',
  'On Hold',
  'PO Received',
  'Payment Pending',
  'Processing',
  'Shipped',
  'Delivered',
];

interface SalesFilterBarProps {
  onStatusChange: (status: string | undefined) => void;
  onStartDateChange: (date: string | undefined) => void;
  onEndDateChange: (date: string | undefined) => void;
  onFollowUpDateChange: (date: string | undefined) => void;
  onClearFilters: () => void;
  initialStatus?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialFollowUpDate?: string;
}

export const SalesFilterBar: React.FC<SalesFilterBarProps> = ({
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onFollowUpDateChange,
  onClearFilters,
  initialStatus = undefined,
  initialStartDate = undefined,
  initialEndDate = undefined,
  initialFollowUpDate = undefined,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(initialStatus || '');
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');
  const [followUpDate, setFollowUpDate] = useState(initialFollowUpDate || '');

  const handleClear = () => {
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    setFollowUpDate('');
    onClearFilters();
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 text-gray-700">
        <Filter className="w-5 h-5" />
        <h3 className="text-sm font-semibold">Filters</h3>
      </div>

      {/* Active Filter Chips */}
      {(selectedStatus || startDate || endDate || followUpDate) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedStatus && (
            <FilterChip
              label="Status"
              value={selectedStatus}
              onRemove={() => setSelectedStatus('')}
              color="green"
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
          {followUpDate && (
            <FilterChip
              label="Follow-Up"
              value={followUpDate}
              onRemove={() => setFollowUpDate('')}
              color="purple"
            />
          )}
        </div>
      )}

      {/* Filters Content */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        {/* Status Filter */}
        <div className="w-full sm:w-64">
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
                onStatusChange(val === '' ? undefined : val);
              }}
              className="pl-9"
            >
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </div>

        {/* Start Date Filter */}
        <div className="w-full sm:w-56">
          <label htmlFor="startDate" className="block text-xs font-medium text-gray-600 mb-1">
            Enquiry From
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => {
                const val = e.target.value;
                setStartDate(val);
                onStartDateChange(val === '' ? undefined : val);
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* End Date Filter */}
        <div className="w-full sm:w-56">
          <label htmlFor="endDate" className="block text-xs font-medium text-gray-600 mb-1">
            Enquiry To
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => {
                const val = e.target.value;
                setEndDate(val);
                onEndDateChange(val === '' ? undefined : val);
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Follow-Up Date Filter */}
        <div className="w-full sm:w-56">
          <label htmlFor="followUpDate" className="block text-xs font-medium text-gray-600 mb-1">
            Next Follow-Up
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="date"
              id="followUpDate"
              value={followUpDate}
              onChange={(e) => {
                const val = e.target.value;
                setFollowUpDate(val);
                onFollowUpDateChange(val === '' ? undefined : val);
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Clear All Button */}
        {(selectedStatus || startDate || endDate || followUpDate) && (
          <div className="flex items-center pb-0.5">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition hover:bg-gray-50 h-[38px]"
              style={{ borderColor: PRIMARY, color: PRIMARY }}
            >
              <XCircle className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
