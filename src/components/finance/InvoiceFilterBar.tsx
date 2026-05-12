'use client';

import React, { useState, useEffect } from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Filter, CalendarDays, Info, XCircle } from 'lucide-react';
import { FilterChip } from '@/components/shared/FilterChip';

const invoiceStatuses = ['Draft', 'Sent', 'Paid', 'Partially Paid', 'Overdue', 'Cancelled'];

interface InvoiceFilterBarProps {
  onStatusChange: (status: string | undefined) => void;
  onStartDateChange: (date: string | undefined) => void;
  onEndDateChange: (date: string | undefined) => void;
  onClearFilters: () => void;
  initialStatus?: string;
  initialStartDate?: string;
  initialEndDate?: string;
}

export const InvoiceFilterBar: React.FC<InvoiceFilterBarProps> = ({
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
  initialStatus = '',
  initialStartDate = '',
  initialEndDate = '',
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const handleClear = () => {
    setStatus('');
    setStartDate('');
    setEndDate('');
    onClearFilters();
  };

  const hasFilters = status || startDate || endDate;

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm p-8">
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-5 h-5 text-[#0f766e]" />
        <h3 className="text-sm font-black uppercase tracking-widest text-[#0f766e]">Invoice Filters</h3>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-6 animate-in slide-in-from-left duration-500">
           {status && <FilterChip label="Status" value={status} onRemove={() => setStatus('')} color="green" />}
           {startDate && <FilterChip label="From" value={startDate} onRemove={() => setStartDate('')} color="blue" />}
           {endDate && <FilterChip label="To" value={endDate} onRemove={() => setEndDate('')} color="blue" />}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
        {/* Status */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lifecycle Status</label>
          <div className="relative">
             <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <Select value={status} onChange={(e) => {
               const val = e.target.value;
               setStatus(val);
               onStatusChange(val === '' ? undefined : val);
             }} className="pl-11 h-12 bg-gray-50/50 border-gray-100 rounded-2xl">
               <option value="">All Invoices</option>
               {invoiceStatuses.map(s => <option key={s} value={s}>{s}</option>)}
             </Select>
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Issued From</label>
          <div className="relative">
             <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <Input type="date" value={startDate} onChange={(e) => {
               const val = e.target.value;
               setStartDate(val);
               onStartDateChange(val === '' ? undefined : val);
             }} className="pl-11 h-12 bg-gray-50/50 border-gray-100 rounded-2xl" />
          </div>
        </div>

        {/* End Date */}
        <div className="flex items-end gap-3">
           <div className="flex-1 space-y-2">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Issued To</label>
             <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type="date" value={endDate} onChange={(e) => {
                  const val = e.target.value;
                  setEndDate(val);
                  onEndDateChange(val === '' ? undefined : val);
                }} className="pl-11 h-12 bg-gray-50/50 border-gray-100 rounded-2xl" />
             </div>
           </div>
           {hasFilters && (
             <button 
                onClick={handleClear}
                className="p-3.5 bg-teal-50 text-teal-700 rounded-2xl hover:bg-teal-100 transition-all active:scale-90 shadow-sm"
             >
                <XCircle size={20} />
             </button>
           )}
        </div>
      </div>
    </div>
  );
};
