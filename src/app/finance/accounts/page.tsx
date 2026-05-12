'use client';

import React, { useState, useEffect } from 'react';
import { getFinanceStats } from '@/services/financeApi';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, 
  Building2, ArrowUpRight, ArrowDownRight, Activity 
} from 'lucide-react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

function FinanceDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await getFinanceStats();
        setData(stats);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#0f766e]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity size={20} className="text-[#0f766e] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const chartColors = ['#0f766e', '#14b8a6', '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-6 md:p-10 space-y-10">
      <ListPageHeader
        eyebrow="Intelligence & Analytics"
        title="Finance"
        highlight="Performance"
        description="Consolidated overview of fiscal health and corporate liquidity."
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-900/5 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
           <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Revenue</span>
                <div className="h-1 w-8 bg-green-500 rounded-full" />
              </div>
              <div className="p-3 bg-green-50 rounded-2xl text-green-600 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                <TrendingUp size={24} />
              </div>
           </div>
           <div className="relative z-10">
              <p className="text-5xl font-black text-[#0f766e] tracking-tighter mb-2">
                 {data?.summary?.totalRevenue?.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase tracking-[0.15em]">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span>Overall Cumulative Inflow</span>
              </div>
           </div>
        </div>

        <div className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-900/5 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
           <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Expenses</span>
                <div className="h-1 w-8 bg-teal-500 rounded-full" />
              </div>
              <div className="p-3 bg-teal-50 rounded-2xl text-teal-700 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                <TrendingDown size={24} />
              </div>
           </div>
           <div className="relative z-10">
              <p className="text-5xl font-black text-[#0f766e] tracking-tighter mb-2">
                 {data?.summary?.totalExpenses?.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 text-teal-700 font-bold text-[10px] uppercase tracking-[0.15em]">
                 <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                 <span>Verified Operational Spending</span>
              </div>
           </div>
        </div>

        <div className="group bg-[#0f766e] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(15,118,110,0.4)] border-0">
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-125 duration-700" />
           <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-teal-100 uppercase tracking-[0.2em] mb-1">Net Liquidity</span>
                <div className="h-1 w-8 bg-teal-300 rounded-full" />
              </div>
              <div className="p-3 bg-white/10 rounded-2xl text-white transition-all duration-500 group-hover:scale-125 group-hover:bg-white/20">
                <DollarSign size={24} />
              </div>
           </div>
           <div className="relative z-10">
              <p className="text-5xl font-black text-white tracking-tighter mb-2">
                 {data?.summary?.netProfit?.toLocaleString() || (data?.summary?.totalRevenue - data?.summary?.totalExpenses)?.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 text-teal-100 font-bold text-[10px] uppercase tracking-[0.15em]">
                 <div className="w-1.5 h-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_white]" />
                 <span>Corporate Capital Balance</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-3 bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-slate-900/5">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Chronological Flux</p>
              <h3 className="text-3xl font-black text-[#0f766e] tracking-tight">Revenue <span className="text-gray-300">vs</span> Spend</h3>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0f766e]">
                <div className="w-3 h-3 rounded-full bg-[#0f766e] shadow-[0_0_8px_rgba(15,118,110,0.4)]" /> Inflow
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500">
                <div className="w-3 h-3 rounded-full bg-rose-500" /> Outflow
              </div>
            </div>
          </div>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyTrends || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                  tickFormatter={(val) => ` ${val >= 1000 ? (val/1000) + 'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', padding: '20px'}}
                  cursor={{stroke: '#0f766e', strokeWidth: 1}}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#0f766e" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  animationDuration={2000}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#f43f5e" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                  strokeDasharray="8 8"
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company Breakdown */}
        <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-slate-900/5 flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-teal-50 rounded-2xl text-[#0f766e]">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Corporate Partition</p>
              <h3 className="text-3xl font-black text-[#0f766e] tracking-tight">Revenue Share</h3>
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.incomeByCompany || []} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#4b5563', fontSize: 11, fontWeight: 800}} 
                  width={100} 
                />
                <Tooltip 
                   cursor={{fill: '#f8fafc', radius: 10}}
                   contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={24} animationDuration={1500}>
                  {data?.incomeByCompany?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-12 space-y-4">
            <div className="flex items-center justify-between px-2 mb-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Top Revenue Pillars</h4>
              <span className="text-[10px] font-black text-[#0f766e] bg-teal-50 px-2 py-0.5 rounded-full">Active Units</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {data?.incomeByCompany?.slice(0, 4).map((item: any, idx: number) => (
                <div key={idx} className="group flex items-center justify-between p-5 bg-[#f8fafc] rounded-3xl border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-transform group-hover:scale-125" style={{ color: chartColors[idx % chartColors.length], backgroundColor: 'currentColor' }} />
                    <span className="font-extrabold text-gray-700 text-sm">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#0f766e] text-base"> {item.value?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(FinanceDashboard, [{ module: 'ledger', action: 'view' }]);
