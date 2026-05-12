'use client';

import { Select } from '@/components/ui/Select';
import { Filter, Calendar, XCircle, Type } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const PRIMARY = '#0f766e';

interface LeaveFilterBarProps {
  onTypeChange: (type: string | undefined) => void;
  onDateChange: (start: string | undefined, end: string | undefined) => void;
  onClearFilters: () => void;
  initialType?: string;
}

export const LeaveFilterBar: React.FC<LeaveFilterBarProps> = ({
  onTypeChange,
  onDateChange,
  onClearFilters,
  initialType = '',
}) => {
  const [selectedType, setSelectedType] = useState(initialType);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isFirstMount, setIsFirstMount] = useState(true);

  useEffect(() => {
    if (isFirstMount) return;
    onTypeChange(selectedType === '' ? undefined : selectedType);
  }, [selectedType, onTypeChange]);

  useEffect(() => {
    if (isFirstMount) {
      setIsFirstMount(false);
      return;
    }
    onDateChange(
        startDate === '' ? undefined : startDate,
        endDate === '' ? undefined : endDate
    );
  }, [startDate, endDate, onDateChange]);

  const handleClear = () => {
    setSelectedType('');
    setStartDate('');
    setEndDate('');
    onClearFilters();
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2 mb-4 text-[#0f766e]">
        <Filter className="w-5 h-5" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Filters</h3>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col sm:flex-row gap-6 flex-1">
          <div className="w-full sm:w-64">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Leave Classification</label>
            <div className="relative">
              <Type className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="pl-10 h-12 bg-gray-50/50 border-gray-100 font-bold text-xs">
                <option value="">All Categories</option>
                <option value="Annual">Annual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Emergency">Emergency Leave</option>
                <option value="Unpaid">LWP (Unpaid)</option>
              </Select>
            </div>
          </div>

          <div className="w-full sm:w-56">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Timeline From</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="w-full h-12 bg-gray-50/50 border border-gray-100 rounded-xl px-10 text-[11px] font-black text-gray-700 outline-none focus:border-[#0f766e] focus:bg-white transition-all shadow-sm" 
                />
            </div>
          </div>

          <div className="w-full sm:w-56">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Timeline To</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    className="w-full h-12 bg-gray-50/50 border border-gray-100 rounded-xl px-10 text-[11px] font-black text-gray-700 outline-none focus:border-[#0f766e] focus:bg-white transition-all shadow-sm" 
                />
            </div>
          </div>
        </div>

        <button 
            onClick={handleClear} 
            className="h-12 flex items-center gap-2 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-100 hover:bg-rose-50 hover:text-rose-600 transition-all text-gray-400 active:scale-95 shadow-sm"
        >
            <XCircle className="w-4 h-4" /> Reset matrix
        </button>
      </div>
    </div>
  );
};
