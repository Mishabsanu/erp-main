'use client';

import React, { useState, useEffect } from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Filter, CalendarDays, Tag, Info, XCircle } from 'lucide-react';
import { FilterChip } from '@/components/shared/FilterChip';

const expenseCategories = [
  'Utilities','Products','Rent', 'Salary', 'Office Supplies', 
  'Marketing', 'Maintenance', 'Travel', 'Communication', 
  'Professional Fees', 'Taxes & Licenses', 'Insurance', 'Miscellaneous'
];

interface ExpenseFilterBarProps {
  onCategoryChange: (cat: string | undefined) => void;
  onStatusChange: (status: string | undefined) => void;
  onStartDateChange: (date: string | undefined) => void;
  onEndDateChange: (date: string | undefined) => void;
  onCompanyNameChange: (name: string | undefined) => void;
  onClearFilters: () => void;
  initialCategory?: string;
  initialStatus?: string;
  initialCompanyName?: string;
  initialStartDate?: string;
  initialEndDate?: string;
}

export const ExpenseFilterBar: React.FC<ExpenseFilterBarProps> = ({
  onCategoryChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onCompanyNameChange,
  onClearFilters,
  initialCategory = '',
  initialStatus = '',
  initialCompanyName = '',
  initialStartDate = '',
  initialEndDate = '',
}) => {
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState(initialStatus);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const handleClear = () => {
    setCategory('');
    setStatus('');
    setStatus('');
    setCompanyName('');
    setStartDate('');
    setEndDate('');
    onClearFilters();
  };

  const hasFilters = category || status || companyName || startDate || endDate;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center text-teal-700">
           <Filter size={16} />
        </div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Transaction Filters</h3>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
           {category && <FilterChip label="Category" value={category} onRemove={() => setCategory('')} color="blue" />}
           {status && <FilterChip label="Status" value={status} onRemove={() => setStatus('')} color="green" />}
           {companyName && <FilterChip label="Company" value={companyName} onRemove={() => setCompanyName('')} color="blue" />}
           {startDate && <FilterChip label="From" value={startDate} onRemove={() => setStartDate('')} color="purple" />}
           {endDate && <FilterChip label="To" value={endDate} onRemove={() => setEndDate('')} color="purple" />}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
        {/* Category */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Category</label>
          <div className="relative">
             <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
             <Select value={category} onChange={(e) => {
               const val = e.target.value;
               setCategory(val);
               onCategoryChange(val === '' ? undefined : val);
             }} className="pl-9 h-12 rounded-xl border-gray-100 focus:border-teal-700/20">
               <option value="">All Categories</option>
               {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
             </Select>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Settlement Status</label>
          <div className="relative">
             <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
             <Select value={status} onChange={(e) => {
               const val = e.target.value;
               setStatus(val);
               onStatusChange(val === '' ? undefined : val);
             }} className="pl-9 h-12 rounded-xl border-gray-100 focus:border-teal-700/20">
               <option value="">All Statuses</option>
               <option value="paid">Paid</option>
               <option value="partially_paid">Partially Paid</option>
               <option value="pending">Pending</option>
             </Select>
          </div>
        </div>

        {/* Company Filter */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Company / Vendor</label>
          <div className="relative">
             <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
             <Input 
                value={companyName} 
                placeholder="Search vendor..."
                onChange={(e) => {
                    const val = e.target.value;
                    setCompanyName(val);
                    onCompanyNameChange(val === '' ? undefined : val);
                }} 
                className="pl-9 h-12 rounded-xl border-gray-100 focus:border-teal-700/20 shadow-none hover:shadow-none"
             />
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Date From</label>
          <div className="relative">
             <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
             <Input type="date" value={startDate} onChange={(e) => {
               const val = e.target.value;
               setStartDate(val);
               onStartDateChange(val === '' ? undefined : val);
             }} className="pl-9 h-12 rounded-xl border-gray-100" />
          </div>
        </div>

        {/* End Date */}
        <div className="flex items-center gap-4">
           <div className="flex-1">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Date To</label>
             <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <Input type="date" value={endDate} onChange={(e) => {
                  const val = e.target.value;
                  setEndDate(val);
                  onEndDateChange(val === '' ? undefined : val);
                }} className="pl-9 h-12 rounded-xl border-gray-100" />
             </div>
           </div>
           {hasFilters && (
             <button 
               onClick={handleClear}
               className="p-3 bg-gray-50 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all active:scale-95"
               title="Clear All Filters"
             >
                <XCircle size={20} />
             </button>
           )}
        </div>
      </div>
    </div>
  );
};
