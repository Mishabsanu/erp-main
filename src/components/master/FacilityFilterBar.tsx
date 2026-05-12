'use client';

import React from 'react';
import { FilterChip } from '@/components/shared/FilterChip';
import { RotateCcw } from 'lucide-react';

interface FacilityFilterBarProps {
  onStatusChange: (status: 'active' | 'inactive' | undefined) => void;
  onTypeChange: (type: string | undefined) => void;
  onClearFilters: () => void;
  selectedStatus?: 'active' | 'inactive';
  selectedType?: string;
}

const ToggleChip = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
      isActive 
        ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-lg shadow-teal-900/20 scale-105' 
        : 'bg-white text-slate-400 border-slate-100 hover:border-teal-200'
    }`}
  >
    {label}
  </button>
);

export const FacilityFilterBar: React.FC<FacilityFilterBarProps> = ({
  onStatusChange,
  onTypeChange,
  onClearFilters,
  selectedStatus,
  selectedType,
}) => {
  const facilityTypes = ['Office', 'Camp', 'Warehouse', 'Workshop', 'Factory', 'Production Center'];

  return (
    <div className="flex flex-col gap-4 mb-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50" />
      
      <div className="flex flex-wrap items-center gap-8 relative z-10">
        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Presence</span>
          <div className="flex gap-2">
            <ToggleChip
              label="Active"
              isActive={selectedStatus === 'active'}
              onClick={() => onStatusChange(selectedStatus === 'active' ? undefined : 'active')}
            />
            <ToggleChip
              label="Inactive"
              isActive={selectedStatus === 'inactive'}
              onClick={() => onStatusChange(selectedStatus === 'inactive' ? undefined : 'inactive')}
            />
          </div>
        </div>

        <div className="w-px h-8 bg-slate-100 hidden md:block" />

        {/* Type Filter */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Classification</span>
          <div className="flex flex-wrap gap-2">
            {facilityTypes.map((type) => (
              <ToggleChip
                key={type}
                label={type}
                isActive={selectedType === type}
                onClick={() => onTypeChange(selectedType === type ? undefined : type)}
              />
            ))}
          </div>
        </div>

        <div className="ml-auto">
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
          >
            <RotateCcw size={14} /> Clear matrix
          </button>
        </div>
      </div>
    </div>
  );
};
