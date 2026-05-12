'use client';

import { FilterChip } from '@/components/shared/FilterChip';
import { Input } from '@/components/ui/Input';
import { CalendarDays, Filter, XCircle } from 'lucide-react';
import React, { useState } from 'react';

interface LedgerFilterBarProps {
  onCompanyChange: (name: string | undefined) => void;
  onStartDateChange: (date: string | undefined) => void;
  onEndDateChange: (date: string | undefined) => void;
  onClearFilters: () => void;
  initialCompanyName?: string;
  initialStartDate?: string;
  initialEndDate?: string;
}

export const LedgerFilterBar: React.FC<LedgerFilterBarProps> = ({
  onCompanyChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
  initialCompanyName = '',
  initialStartDate = '',
  initialEndDate = '',
}) => {
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);



  const handleClear = () => {
    setCompanyName('');
    setStartDate('');
    setEndDate('');
    onClearFilters();
  };

  const hasFilters =  companyName || startDate || endDate;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-5 h-5 text-teal-700" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700">Filter Ledger Entries</h3>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in duration-500">
           {companyName && <FilterChip label="Company" value={companyName} onRemove={() => { setCompanyName(''); onCompanyChange(undefined); }} color="blue" />}
           {startDate && <FilterChip label="From" value={startDate} onRemove={() => { setStartDate(''); onStartDateChange(undefined); }} color="purple" />}
           {endDate && <FilterChip label="To" value={endDate} onRemove={() => { setEndDate(''); onEndDateChange(undefined); }} color="purple" />}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-end">
        {/* Company Filter */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-xs">By Company Name</label>
          <div className="relative">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <Input 
               value={companyName} 
               onChange={(e) => {
                 const val = e.target.value;
                 setCompanyName(val);
                 onCompanyChange(val === '' ? undefined : val);
               }} 
               placeholder="Search by company..."
               className="pl-11 h-11 bg-gray-50/50 border-gray-200 rounded-xl" 
             />
          </div>
        </div>


       

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-xs">Period From</label>
          <div className="relative">
             <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <Input type="date" value={startDate} onChange={(e) => {
               const val = e.target.value;
               setStartDate(val);
               onStartDateChange(val === '' ? undefined : val);
             }} className="pl-11 h-11 bg-gray-50/50 border-gray-200 rounded-xl" />
          </div>
        </div>

        <div className="flex items-end gap-3">
           <div className="flex-1 space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-xs">Period To</label>
             <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type="date" value={endDate} onChange={(e) => {
                   const val = e.target.value;
                   setEndDate(val);
                   onEndDateChange(val === '' ? undefined : val);
                }} className="pl-11 h-11 bg-gray-50/50 border-gray-200 rounded-xl" />
             </div>
           </div>
           {hasFilters && (
             <button onClick={handleClear} className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:text-teal-700 transition-all active:scale-95">
                <XCircle size={20} />
             </button>
           )}
        </div>
      </div>
    </div>
  );
};
