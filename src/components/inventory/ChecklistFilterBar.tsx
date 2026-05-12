'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Filter, RotateCcw, Building2, ChevronDown } from 'lucide-react';
import { getFacilityDropdown } from '@/services/facilityApi';

interface ChecklistFilterBarProps {
  onFacilityChange: (id: string) => void;
  onDateChange: (date: string) => void;
  onClearFilters: () => void;
}

export const ChecklistFilterBar: React.FC<ChecklistFilterBarProps> = ({
  onFacilityChange,
  onDateChange,
  onClearFilters,
}) => {
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [facilities, setFacilities] = useState<any[]>([]);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const data = await getFacilityDropdown();
        setFacilities(data);
      } catch (error) {
        console.error('Failed to load facilities for filter');
      }
    };
    fetchFacilities();
  }, []);

  const handleClear = () => {
    setSelectedFacility('');
    setSelectedDate('');
    onClearFilters();
  };

  const hasFilters = selectedFacility || selectedDate;

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col sm:flex-row gap-6 items-end">
          {/* Facility Filter */}
          <div className="w-full sm:w-64">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
              Filter by Facility
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedFacility}
                onChange={(e) => {
                  setSelectedFacility(e.target.value);
                  onFacilityChange(e.target.value);
                }}
                className="w-full pl-10 pr-10 h-12 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none transition-all cursor-pointer"
              >
                <option value="">All Infrastructure Nodes</option>
                {facilities.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Filter */}
          <div className="w-full sm:w-56">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
              Filter by Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  onDateChange(e.target.value);
                }}
                className="w-full h-12 pl-10 pr-4 bg-slate-50/50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasFilters && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-6 h-12 text-slate-400 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest transition-colors"
            >
              <RotateCcw size={14} /> Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
