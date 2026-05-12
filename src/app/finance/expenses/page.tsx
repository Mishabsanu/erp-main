'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getExpenses, deleteExpense, approveExpense } from '@/services/financeApi';
import { Expense, ExpenseFilter } from '@/lib/types';
import { DataTable, Column } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { ExpenseFilterBar } from '@/components/finance/ExpenseFilterBar';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { QuickPaymentModal } from '@/components/finance/QuickPaymentModal';
import withAuth from '@/components/withAuth';
import { Plus, Filter, Edit2, Trash2, CheckCircle, DollarSign, FileBarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpenseForPayment, setSelectedExpenseForPayment] = useState<Expense | null>(null);
  const router = useRouter();
  const { can } = useAuth();

  const [filter, setFilter] = useState<ExpenseFilter>({
    search: '',
    category: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const fetchExpenses = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await getExpenses(filter, currentPage, limit, signal);
      setExpenses(data.expenses);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount || data.expenses.length);
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, limit]);

  useEffect(() => {
    const controller = new AbortController();
    fetchExpenses(controller.signal);
    return () => controller.abort();
  }, [fetchExpenses]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await deleteExpense(id);
      toast.success('Expense record deleted successfully');
      fetchExpenses();
    } catch {
      toast.error('Failed to delete expense record');
    }
  }, [fetchExpenses]);

  const handleApprove = useCallback(async (id: string) => {
    try {
      await approveExpense(id);
      toast.success('Expense record approved and added to ledger');
      fetchExpenses();
    } catch {
      toast.error('Failed to approve expense record');
    }
  }, [fetchExpenses]);

  const columns: Column<Expense>[] = useMemo(() => {
    const baseColumns: Column<Expense>[] = [
      { 
          header: 'ID / Date', 
          accessor: 'expenseId' as any,
          render: (item: any) => (
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">#{item?.expenseId || 'EXP-AUTO'}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{item?.date ? new Date(item.date).toLocaleDateString() : '--'}</span>
            </div>
          )
      },
      { 
          header: 'Beneficiary (Company)', 
          accessor: 'companyName' as keyof Expense,
          render: (item: Expense) => (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#0f766e]">
                {item?.companyName || (item.vendorId as any)?.company || '—'}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight italic">Ref: {item?.referenceNo || 'N/A'}</span>
            </div>
          )
      },
      { 
          header: 'Category', 
          accessor: 'category' as keyof Expense,
          render: (item: Expense) => (
            <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-teal-100">
              {item?.category || '--'}
            </span>
          )
      },
      { 
          header: 'Financials', 
          accessor: 'totalAmount' as keyof Expense,
          render: (item: any) => (
            <div className="flex flex-col">
              <span className="font-black text-gray-900">{item?.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</span>
              {(item?.paidTotal || 0) > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-bold uppercase border border-emerald-100">Paid: {item?.paidTotal?.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                  <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded text-[8px] font-bold uppercase border border-rose-100">Bal: {item?.balance?.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                </div>
              )}
            </div>
          )
      },
      {
          header: 'Settlement Status',
          accessor: 'status' as keyof Expense,
          render: (item: any) => (
            <div className="flex flex-col gap-1.5">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-center ${
                item?.status === 'paid' ? 'bg-emerald-600 text-white' : 
                item?.status === 'partially_paid' ? 'bg-amber-500 text-white' : 
                item?.status === 'pending' ? 'bg-rose-50 text-rose-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {item?.status?.replace('_', ' ') || '--'}
              </span>
              <div className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-center border flex items-center justify-center gap-1 ${
                item?.isApproved ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-gray-50 text-gray-400 border-gray-100'
              }`}>
                 {item?.isApproved ? <CheckCircle size={10} /> : null}
                 {item?.isApproved ? 'Verified' : 'Unverified'}
              </div>
            </div>
          )
      },
      {
          accessor: 'createdBy' as any,
          header: 'Audit Trail',
          render: (item: Expense) => (
            <div className="flex flex-col">
               <span className="text-[11px] font-bold text-gray-700">
                 {typeof item?.createdBy === 'object' ? (item.createdBy as any).name : item?.createdBy || '--'}
               </span>
               <span className="text-[9px] text-gray-400 font-medium">
                 {item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : '--'}
               </span>
            </div>
          )
      }
    ];

    baseColumns.push({
      accessor: '_id' as keyof Expense,
      header: 'Actions',
      render: (expense) => (
        <div className="flex items-center gap-2">
           <button
             onClick={(e) => {
               e.stopPropagation();
               router.push(`/finance/expenses/${expense._id}/report`);
             }}
             className="w-9 h-9 flex items-center justify-center text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all border border-gray-100 hover:border-sky-200"
             title="View Settlement Audit"
           >
             <FileBarChart2 className="w-4 h-4" />
           </button>
           {can('expense', 'update') && !expense.isApproved && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (expense._id) handleApprove(expense._id);
              }}
              className="w-9 h-9 flex items-center justify-center text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-gray-100 hover:border-emerald-200"
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {can('payment', 'create') && (expense.status !== 'paid') && (
            <button
               onClick={(e) => {
                 e.stopPropagation();
                 setSelectedExpenseForPayment(expense);
               }}
               className="w-9 h-9 flex items-center justify-center text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all border border-gray-100 hover:border-amber-200"
               title="Settle (Record Payment)"
            >
               <DollarSign className="w-4 h-4" />
            </button>
          )}
          {can('expense', 'update') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/finance/expenses/edit/${expense._id}`);
              }}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {can('expense', 'delete') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (expense._id) handleDelete(expense._id);
              }}
              className="w-9 h-9 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-100 hover:border-red-200"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    });

    return baseColumns;
  }, [router, can, handleDelete, handleApprove]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Expense Ledger"
        title="Expense"
        highlight="Management"
        description="Log, review, and reconcile outgoing company expenses."
        actions={
          <>
          {can('expense', 'create') && (
            <button 
              onClick={() => router.push('/finance/expenses/add')}
              className="page-header-button"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="page-header-button secondary"
          >
            <Filter size={18} />
            {showFilters ? 'Hide' : 'Filter'}
          </button>
          </>
        }
      />

      <div className={showFilters ? 'block mb-6' : 'hidden'}>
        <ExpenseFilterBar 
          onCategoryChange={useCallback((val) => setFilter(prev => ({ ...prev, category: val })), [])}
          onStatusChange={useCallback((val) => setFilter(prev => ({ ...prev, status: val })), [])}
          onStartDateChange={useCallback((val) => setFilter(prev => ({ ...prev, startDate: val })), [])}
          onEndDateChange={useCallback((val) => setFilter(prev => ({ ...prev, endDate: val })), [])}
          onCompanyNameChange={useCallback((val) => setFilter(prev => ({ ...prev, companyName: val })), [])}
          onClearFilters={useCallback(() => {
            setFilter({ search: '', companyName: undefined });
            setCurrentPage(1);
          }, [])}
          initialCategory={filter.category}
          initialStatus={filter.status}
          initialCompanyName={filter.companyName}
          initialStartDate={filter.startDate}
          initialEndDate={filter.endDate}
        />
      </div>

      <div className="mb-6">
        <SearchInput 
          placeholder="Search expenses..." 
          onSearchChange={useCallback((val: string) => setFilter(prev => ({ ...prev, search: val })), [])}
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={expenses}
          onRowClick={(item) => {
            if (can('expense', 'update')) {
              router.push(`/finance/expenses/edit/${item._id}`);
            }
          }}
          serverSidePagination={true}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          limit={limit}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
        />
      )}

      {selectedExpenseForPayment && (
        <QuickPaymentModal
          isOpen={!!selectedExpenseForPayment}
          onClose={() => setSelectedExpenseForPayment(null)}
          expense={selectedExpenseForPayment}
          onSuccess={fetchExpenses}
        />
      )}
    </div>
  );
}

export default withAuth(ExpensesPage, [{ module: 'expense', action: 'view' }]);
