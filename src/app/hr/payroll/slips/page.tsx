'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Eye, Trash2, Filter, ReceiptText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getSlips, deleteSlip } from '@/services/payrollApi';
import { SalarySlipView } from '@/components/payroll/SalarySlipView';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

function SalarySlipsPage() {
  const [slips, setSlips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  
  // Filters
  const [monthFilter, setMonthFilter] = useState<number>(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());

  const router = useRouter();
  const { can } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSlips({ month: monthFilter, year: yearFilter });
      setSlips(data || []);
    } catch (error) {
      console.error('Error fetching slips:', error);
      toast.error('Failed to load salary slips');
    } finally {
      setLoading(false);
    }
  }, [monthFilter, yearFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredSlips = useMemo(() => {
    return slips.filter((slip) =>
      slip.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [slips, searchTerm]);

  const handleDelete = useCallback(async (id: string) => {
    toast.custom((t) => (
        <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-medium text-gray-800">Are you sure you want to delete this slip?</p>
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => toast.dismiss(t)} className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition">Cancel</button>
            <button onClick={async () => {
              toast.dismiss(t);
              try {
                await deleteSlip(id);
                toast.success('Salary slip deleted');
                fetchData();
              } catch {
                toast.error('Failed to delete slip');
              }
            }} className="px-3 py-1 text-sm bg-teal-700 text-white rounded-md hover:bg-teal-800 transition">Yes, Delete</button>
          </div>
        </div>
      ));
  }, [fetchData]);

  const columns: Column<any>[] = useMemo(() => [
    {
      accessor: 'user',
      header: 'Employee',
      render: (slip) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-sm">
            {slip.user?.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-800">{slip.user?.name}</p>
            <p className="text-xs text-gray-400">{slip.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessor: 'period' as any,
      header: 'Pay Period',
      render: (slip) => (
        <span className="text-sm font-medium text-gray-600 uppercase tracking-widest">
          {new Date(0, slip.month - 1).toLocaleString('default', { month: 'short' })} {slip.year}
        </span>
      ),
    },
    {
        accessor: 'paidDays',
        header: 'Days Paid',
        render: (slip) => (
          <span className="text-sm font-semibold text-gray-800">{slip.paidDays} / {slip.totalDays}</span>
        ),
      },
    {
      accessor: 'netSalary',
      header: 'Net Payable',
      render: (slip) => (
        <span className="font-bold text-teal-700">₹{slip.netSalary.toLocaleString()}</span>
      ),
    },
    {
        accessor: 'generatedBy' as any,
        header: 'Audit Trail',
        render: (slip) => (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-700">{slip.generatedBy?.name || 'System'}</span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{slip.createdAt ? new Date(slip.createdAt).toLocaleDateString() : '--'}</span>
          </div>
        )
    },
    {
      accessor: 'status',
      header: 'Status',
      render: (slip) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          slip.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-sky-100 text-sky-700'
        }`}>
          {slip.status}
        </span>
      ),
    },
    {
      accessor: 'actions' as any,
      header: 'Actions',
      render: (slip) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSlip(slip);
              setIsViewOpen(true);
            }}
            className="w-9 h-9 flex items-center justify-center text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-all border border-gray-100 hover:border-sky-200"
            title="View Slip"
          >
            <Eye className="w-4 h-4" />
          </button>
          {can('payroll', 'delete') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(slip._id);
              }}
              className="w-9 h-9 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-100 hover:border-red-200"
              title="Delete Slip"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ], [slips, can, handleDelete, setSelectedSlip, setIsViewOpen]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Finance Node"
        title="Salary"
        highlight="Slips"
        description="Authorized payroll registry and monthly disbursement records for institutional audit."
        actions={
          <>
            {can('payroll', 'create') && (
              <button
                onClick={() => router.push('/hr/payroll/slips/generate')}
                className="page-header-button"
              >
                <Plus className="w-4 h-4" />
                Generate Slips
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="page-header-button secondary"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </>
        }
      />

      {/* Filters Area */}
      {showFilters && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl mb-8 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-3 bg-teal-700 rounded-full" />
            <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Chronological Filtering</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="label-premium">Institutional Month</label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(Number(e.target.value))}
                className="input-premium"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="label-premium">Fiscal Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(Number(e.target.value))}
                className="input-premium"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 mt-10">
        <SearchInput
          initialSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search slips by employee name or details..."
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={filteredSlips}
          serverSidePagination={false}
        />
      )}

      {/* Slip View Modal */}
      {selectedSlip && (
        <SalarySlipView
            isOpen={isViewOpen}
            onClose={() => setIsViewOpen(false)}
            slip={selectedSlip}
        />
      )}
    </div>
  );
}

export default withAuth(SalarySlipsPage, [{ module: 'payroll', action: 'view' }]);
