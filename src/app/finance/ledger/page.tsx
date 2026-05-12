'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getLedger } from '@/services/financeApi';
import { LedgerEntry, LedgerFilter } from '@/lib/types';
import { DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { LedgerFilterBar } from '@/components/finance/LedgerFilterBar';
import { Database, Filter, Download, Printer, TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';

function LedgerPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalDebit: 0,
    totalCredit: 0,
    openingBalance: 0,
    closingBalance: 0
  });

  const [filter, setFilter] = useState<LedgerFilter>({
    search: '',
    companyName: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const fetchLedger = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await getLedger(filter, currentPage, 10, signal);
      setEntries(data.entries);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setStats({
        totalDebit: data.totalDebit,
        totalCredit: data.totalCredit,
        openingBalance: data.openingBalance || 0,
        closingBalance: data.closingBalance || 0
      });
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;
      toast.error('Failed to fetch ledger');
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage]);

  useEffect(() => {
    const controller = new AbortController();
    fetchLedger(controller.signal);
    return () => controller.abort();
  }, [fetchLedger]);

  const columns = [
    {
      header: 'Date',
      accessor: 'date' as keyof LedgerEntry,
      render: (item: LedgerEntry) => <span className="text-gray-600 font-medium">{item.date}</span>
    },
    {
      header: 'Ref ID',
      accessor: 'referenceNo' as keyof LedgerEntry,
      render: (item: LedgerEntry) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-teal-700">
            {item.referenceNo || (item.referenceId ? 'R-'+item.referenceId.slice(-4).toUpperCase() : 'Manual')}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{item.referenceType || 'General'}</span>
        </div>
      )
    },
    {
      header: 'Company / Project',
      accessor: 'companyName' as keyof LedgerEntry,
      render: (item: LedgerEntry) => (
        <span 
          className={`text-sm font-semibold truncate max-w-[200px] ${item.companyName ? 'text-[#0f766e]' : 'text-gray-400 italic'}`} 
          title={item.companyName || 'General Entry'}
        >
          {item.companyName || 'General Entry'}
        </span>
      )
    },
    {
      header: 'Description',
      accessor: 'description' as keyof LedgerEntry,
      render: (item: LedgerEntry) => (
        <span className="text-[11px] font-medium text-gray-700 line-clamp-2 max-w-[250px]" title={item.description}>
          {item.description}
        </span>
      )
    },
    {
      header: 'Method',
      accessor: 'modeOfPayment' as keyof LedgerEntry,
      render: (item: LedgerEntry) => (
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${item.modeOfPayment ? (item.modeOfPayment === 'Cash' ? 'bg-orange-400' : 'bg-sky-400') : 'bg-gray-200'}`} />
           <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
             {item.modeOfPayment || 'N/A'}
           </span>
        </div>
      )
    },
    {
      header: 'Personnel',
      accessor: 'handledBy' as keyof LedgerEntry,
      render: (item: LedgerEntry) => (
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{item.handledBy || '—'}</span>
      )
    },
    {
      header: 'Credit (In)',
      accessor: 'credit' as keyof LedgerEntry,
      render: (item: LedgerEntry) => item.credit > 0 ? (
        <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100">
          {item.credit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ) : <span className="text-gray-300">—</span>
    },
    {
      header: 'Debit (Out)',
      accessor: 'debit' as keyof LedgerEntry,
      render: (item: LedgerEntry) => item.debit > 0 ? (
        <span className="font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">
          {item.debit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ) : <span className="text-gray-300">—</span>
    },
    {
      header: 'Balance',
      accessor: 'balance' as keyof LedgerEntry,
      render: (item: LedgerEntry) => (
        <span className="font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
          {item.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: 'Admin',
      accessor: 'createdBy' as keyof LedgerEntry,
      render: (item: LedgerEntry) => (
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">
          {typeof item.createdBy === 'object' ? (item.createdBy as any).name : (item.createdBy || '--')}
        </span>
      )
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-6 md:p-10 font-sans">
      <div className="max-w-full mx-auto space-y-10">
        <ListPageHeader
          eyebrow="Finance Audit"
          title="General"
          highlight="Ledger"
          description="Audit debits, credits, references, and closing balance history."
          actions={
            <div className="flex items-center gap-4">
               <button 
                onClick={() => router.push('/finance/expenses/add')}
                className="px-6 py-4 bg-teal-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-teal-800 transition-all flex items-center gap-3 active:scale-95 shadow-lg shadow-teal-700/20"
              >
                <PlusCircle size={18} /> Add Expense
              </button>
              <button 
                onClick={() => router.push('/finance/payment/add')}
                className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all flex items-center gap-3 active:scale-95 shadow-lg shadow-emerald-600/20"
              >
                <PlusCircle size={18} /> Add Collection
              </button>
              <div className="w-[1px] h-10 bg-gray-200 mx-2" />
              <button className="px-6 py-4 bg-white text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border-2 border-gray-100 hover:bg-gray-50 hover:text-gray-600 transition-all flex items-center gap-3 active:scale-95">
                <Printer size={18} />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 active:scale-95 border-2 ${showFilters ? 'bg-[#0f766e] text-white border-teal-800 shadow-lg' : 'bg-white text-gray-500 border-gray-100 shadow-sm hover:bg-gray-50'}`}
              >
                <Filter size={18} /> {showFilters ? 'Hide Filters' : 'Filters'}
              </button>
            </div>
          }
        />

        {/* Persistent Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100/50 shadow-2xl shadow-slate-900/[0.03] flex items-center justify-between transition-all hover:-translate-y-1 group">
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Opening Balance</p>
              <h3 className="text-2xl font-black text-[#0f172a] tracking-tighter tabular-nums leading-none">
                {stats.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 border-2 border-gray-100 flex items-center justify-center transition-transform group-hover:rotate-6">
              <Database size={24} strokeWidth={2.5} />
            </div>
          </div>

          <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100/50 shadow-2xl shadow-slate-900/[0.03] flex items-center justify-between transition-all hover:-translate-y-1 group">
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em]">Total In (Credit)</p>
              <h3 className="text-2xl font-black text-[#0f172a] tracking-tighter tabular-nums leading-none">
                {stats.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border-2 border-emerald-100 flex items-center justify-center transition-transform group-hover:rotate-6">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
          </div>

          <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100/50 shadow-2xl shadow-slate-900/[0.03] flex items-center justify-between transition-all hover:-translate-y-1 group">
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-rose-600 uppercase tracking-[0.3em]">Total Out (Debit)</p>
              <h3 className="text-2xl font-black text-[#0f172a] tracking-tighter tabular-nums leading-none">
                {stats.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border-2 border-rose-100 flex items-center justify-center transition-transform group-hover:rotate-6">
              <TrendingDown size={24} strokeWidth={2.5} />
            </div>
          </div>

          <div className={`p-7 rounded-[2.5rem] border flex items-center justify-between transition-all hover:-translate-y-1 group shadow-2xl shadow-slate-900/[0.03] ${stats.closingBalance >= 0 ? 'bg-white border-gray-100/50' : 'bg-rose-50 border-rose-100'}`}>
            <div className="space-y-1.5">
              <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${stats.closingBalance >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>Closing Balance</p>
              <h3 className={`text-2xl font-black tracking-tighter tabular-nums leading-none ${stats.closingBalance >= 0 ? 'text-[#0f172a]' : 'text-rose-700'}`}>
                {stats.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-transform group-hover:rotate-6 ${stats.closingBalance >= 0 ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/20'}`}>
              <Database size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className={showFilters ? 'block mb-6' : 'hidden'}>
          <LedgerFilterBar
            onCompanyChange={useCallback((val) => setFilter(prev => ({ ...prev, companyName: val })), [])}
            onStartDateChange={useCallback((val) => setFilter(prev => ({ ...prev, startDate: val })), [])}
            onEndDateChange={useCallback((val) => setFilter(prev => ({ ...prev, endDate: val })), [])}
            onClearFilters={useCallback(() => {
              setFilter({ search: '', companyName: undefined, startDate: undefined, endDate: undefined });
              setCurrentPage(1);
            }, [])}
            initialCompanyName={filter.companyName}
            initialStartDate={filter.startDate}
            initialEndDate={filter.endDate}
          />
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <SearchInput
            placeholder="Search auditing trail by description, reference type or ID..."
            onSearchChange={useCallback((val: string) => setFilter(prev => ({ ...prev, search: val })), [])}
          />
        </div>

        {/* Main Table Area */}
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl w-full" />)}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={entries}
            serverSidePagination={true}
            totalCount={totalCount}
            totalPages={totalPages}
            currentPage={currentPage}
            limit={10}
            onPageChange={setCurrentPage}
            onLimitChange={() => { }}
          />
        )}
      </div>
    </div>
  );
}

export default withAuth(LedgerPage, [{ module: 'ledger', action: 'view' }]);
