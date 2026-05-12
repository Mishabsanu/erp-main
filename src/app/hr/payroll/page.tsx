'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Banknote, 
  ReceiptText, 
  PieChart, 
  TrendingUp, 
  Users, 
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import withAuth from '@/components/withAuth';

const PayrollLandingPage = () => {
  const router = useRouter();

  const cards = [
    {
      title: 'Salary Breakups',
      description: 'Define and manage employee salary structures, bonuses, and deductions.',
      icon: PieChart,
      href: '/hr/payroll/breakups',
      color: 'bg-teal-600',
      stats: '14 Active Templates'
    },
    {
      title: 'Salary Slips',
      description: 'Generate, view, and authorize monthly payment slips for all staff members.',
      icon: ReceiptText,
      href: '/hr/payroll/slips',
      color: 'bg-[#0f172a]',
      stats: 'Monthly Cycle Active'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-6 md:p-10 font-sans relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-50/50 rounded-full blur-[120px] -mr-80 -mt-80 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-50/50 rounded-full blur-[120px] -ml-80 -mb-80 pointer-events-none" />

      <ListPageHeader
        eyebrow="Financial Operations"
        title="Payroll"
        highlight="Management"
        description="Oversee employee compensation, tax compliance, and automated salary disbursement."
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative z-10">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-slate-900/5 relative overflow-hidden group hover:shadow-sky-900/10 transition-all">
          <div className="relative z-10">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-3">Total Disbursements</span>
            <p className="text-4xl font-black text-[#0f172a] tracking-tight">142,500</p>
            <div className="mt-6 flex items-center gap-2 text-emerald-600 font-black text-[10px] bg-emerald-50 w-fit px-4 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">
              <TrendingUp size={14} />
              <span>+4.2% Periodic Delta</span>
            </div>
          </div>
          <Banknote size={100} strokeWidth={1} className="absolute -right-6 -bottom-6 text-gray-50/50 group-hover:text-sky-50 transition-colors" />
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-slate-900/5 relative overflow-hidden group hover:shadow-sky-900/10 transition-all">
          <div className="relative z-10">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-3">Active Workforce</span>
            <p className="text-4xl font-black text-[#0f172a] tracking-tight">42 Personnel</p>
            <div className="mt-6 flex items-center gap-2 text-sky-600 font-black text-[10px] bg-sky-50 w-fit px-4 py-1.5 rounded-full border border-sky-100 uppercase tracking-widest">
              <ShieldCheck size={14} />
              <span>Compliance Verified</span>
            </div>
          </div>
          <Users size={100} strokeWidth={1} className="absolute -right-6 -bottom-6 text-gray-50/50 group-hover:text-sky-50 transition-colors" />
        </div>

        <div className="bg-indigo-900 p-10 rounded-[3rem] shadow-2xl shadow-indigo-900/20 relative overflow-hidden group hover:scale-[1.02] transition-all text-white border-0">
          <div className="relative z-10">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] block mb-3">Next Payout Cycle</span>
            <p className="text-4xl font-black text-white tracking-tight">30 Apr 2026</p>
            <div className="mt-6 flex items-center gap-2 text-white font-black text-[10px] bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-sm uppercase tracking-widest">
              <Clock size={14} />
              <span>12 Days Remaining</span>
            </div>
          </div>
          <TrendingUp size={100} strokeWidth={1} className="absolute -right-6 -bottom-6 text-white/5 group-hover:text-white/10 transition-colors" />
        </div>
      </div>

      {/* Navigation Grid */}
      <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] mb-8 px-4 flex items-center gap-4">
        Operational <span className="text-sky-600">Modules</span>
        <div className="h-px bg-gray-100 flex-1" />
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => router.push(card.href)}
            className="flex items-stretch group text-left transition-all hover:-translate-y-2"
          >
            <div className={`${card.color} w-3 rounded-l-[2rem] shadow-lg shadow-sky-900/10`} />
            <div className="flex-1 bg-white p-12 rounded-r-[3rem] border border-gray-100 shadow-2xl shadow-slate-900/5 flex justify-between items-center group-hover:border-sky-100">
              <div className="max-w-md">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all mb-8 shadow-inner">
                  <card.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-black text-[#0f172a] mb-4 tracking-tighter group-hover:text-indigo-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-8">
                  {card.description}
                </p>
                <div className="inline-flex items-center gap-3 text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-6 py-2.5 rounded-full border border-indigo-100">
                  {card.stats}
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 group-hover:scale-125 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all shadow-sm">
                <ArrowRight size={28} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Policy Reminder */}
      <div className="p-12 bg-[#0f172a] rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative group shadow-2xl shadow-slate-900/40">
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
             <h3 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.4em]">Governance Protocol</h3>
          </div>
          <h3 className="text-3xl font-black tracking-tight mb-4">Automated Compliance Monitoring</h3>
          <p className="text-slate-400 font-medium leading-relaxed max-w-2xl text-lg">
            All payroll operations are logged and audited in real-time. Please ensure all variable inputs like overtime and deductions are verified before cycle authorization.
          </p>
        </div>
        <div className="relative z-10">
          <button className="px-10 py-6 bg-sky-600 hover:bg-sky-500 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-2xl shadow-sky-900/40 active:scale-95 group-hover:-translate-x-2">
            View Policy Manual
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-sky-500/10 to-transparent pointer-none" />
      </div>
    </div>
  );
};

export default withAuth(PayrollLandingPage, [{ module: 'payroll', action: 'view' }]);
