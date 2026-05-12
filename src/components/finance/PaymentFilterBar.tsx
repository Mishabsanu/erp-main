'use client';

import React, { useState, useEffect } from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Filter, CalendarDays, ArrowDownUp, Info, XCircle } from 'lucide-react';
import { FilterChip } from '@/components/shared/FilterChip';

interface PaymentFilterBarProps {
  onTypeChange: (type: 'Received' | 'Paid' | undefined) => void;
  onStartDateChange: (date: string | undefined) => void;
  onEndDateChange: (date: string | undefined) => void;
  onCompanyNameChange: (name: string | undefined) => void;
  onClearFilters: () => void;
  initialType?: string;
  initialCompanyName?: string;
  initialStartDate?: string;
  initialEndDate?: string;
}

export const PaymentFilterBar: React.FC<PaymentFilterBarProps> = ({
  onTypeChange,
  onStartDateChange,
  onEndDateChange,
  onCompanyNameChange,
  onClearFilters,
  initialType = '',
  initialCompanyName = '',
  initialStartDate = '',
  initialEndDate = '',
}) => {
  const [type, setType] = useState(initialType);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const handleClear = () => {
    setType('');
    setCompanyName('');
    setStartDate('');
    setEndDate('');
    onClearFilters();
  };

  const hasFilters = type || companyName || startDate || endDate;

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm p-8">
      <div className="flex items-center gap-3 mb-6">
        <ArrowDownUp className="w-5 h-5 text-[#0f766e]" />
        <h3 className="text-sm font-black uppercase tracking-widest text-[#0f766e]">Collections Registry Filters</h3>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-6 animate-in slide-in-from-right duration-500">
           {type && <FilterChip label="Type" value={type} onRemove={() => setType('')} color="blue" />}
           {companyName && <FilterChip label="Company" value={companyName} onRemove={() => setCompanyName('')} color="blue" />}
           {startDate && <FilterChip label="From" value={startDate} onRemove={() => setStartDate('')} color="purple" />}
           {endDate && <FilterChip label="To" value={endDate} onRemove={() => setEndDate('')} color="purple" />}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        {/* Type */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Direction</label>
          <div className="relative">
             <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <Select value={type} onChange={(e) => {
               const val = e.target.value as any;
               setType(val);
               onTypeChange(val === '' ? undefined : val);
             }} className="pl-11 h-12 bg-gray-50/50 border-gray-100 rounded-2xl">
               <option value="">Incoming & Outgoing</option>
               <option value="Received">Received Only</option>
               <option value="Paid">Payments Only</option>
             </Select>
          </div>
        </div>

        {/* Company Filter */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company / Client</label>
          <div className="relative">
             <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <Input 
                value={companyName} 
                placeholder="Search company..."
                onChange={(e) => {
                    const val = e.target.value;
                    setCompanyName(val);
                    onCompanyNameChange(val === '' ? undefined : val);
                }} 
                className="pl-11 h-12 bg-gray-50/50 border-gray-100 rounded-2xl focus:border-teal-700/20 shadow-none hover:shadow-none"
             />
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Recorded From</label>
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
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Recorded To</label>
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
                className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-[#0f766e] hover:text-white transition-all active:scale-95 shadow-sm"
             >
                <XCircle size={20} />
             </button>
           )}
        </div>
      </div>
    </div>
  );
};
