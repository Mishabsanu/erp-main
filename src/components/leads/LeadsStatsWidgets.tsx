'use client';

import React from 'react';
import { 
  Users, 
  MessageSquare, 
  PhoneCall, 
  Clock, 
  TrendingUpIcon
} from 'lucide-react';

interface StatsProps {
  stats: Record<string, number>;
  loading: boolean;
}

const LeadsStatsWidgets: React.FC<StatsProps> = ({ stats, loading }) => {
  const cards = [
    {
      label: 'Total Leads',
      value: stats['All Statuses'] || 0,
      icon: Users,
      color: 'bg-teal-50 text-[#0f766e] border-teal-100',
    },
    {
      label: 'New Leads',
      value: stats['New Lead'] || 0,
      icon: MessageSquare,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      label: 'Call Required',
      value: stats['Call Required'] || 0,
      icon: PhoneCall,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Today Follow-up',
      value: stats['Today Follow-up'] || 0,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      label: 'Interested',
      value: stats['Interested'] || 0,
      icon: TrendingUpIcon,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
  ];

  const TrendingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
      {cards.map((card, i) => (
        <div 
          key={i}
          className={`p-6 rounded-[2.5rem] border border-gray-100 flex items-center justify-between shadow-2xl shadow-slate-900/5 bg-white transition-all hover:-translate-y-1 group ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
               {card.label}
            </p>
            <h3 className="text-3xl font-black text-[#0f172a] tracking-tighter tabular-nums leading-none">
              {loading ? '...' : card.value}
            </h3>
          </div>
          <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-transform group-hover:rotate-6 shadow-sm ${card.color}`}>
            {card.label === 'Interested' ? <TrendingIcon /> : <card.icon size={28} strokeWidth={2.5} />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeadsStatsWidgets;
