'use client';

import { SalesFilterBar } from '@/components/sales/SalesFilterBar';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import withAuth from '@/components/withAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { Sale, SaleFilter } from '@/lib/types';
import { deleteSale, getSales, getSalesStats } from '@/services/salesApi';
import {
  TrendingUp,
  Upload,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Filter,
} from 'lucide-react';

import ImportSheetModal from '@/components/Modal/ImportSheetModal';
import StatusUpdateModal from '@/components/StatusUpdateModal';
import LeadsStatsWidgets from '@/components/leads/LeadsStatsWidgets';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'New Lead': '#2563eb',
    'Call Required': '#0ea5e9',
    Contacted: '#8b5cf6',
    'Follow-Up': '#d946ef',
    'Quotation Sent': '#f59e0b',
    Negotiation: '#f97316',
    Interested: '#16a34a',
    'Not Interested': '#ef4444',
    'On Hold': '#64748b',
    'PO Received': '#059669',
    'Payment Pending': '#eab308',
    Processing: '#06b6d4',
    Shipped: '#6366f1',
    Delivered: '#10b981',
  };
  return colors[status] || '#6b7280';
};

const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const { can } = useAuth();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [filter, setFilter] = useState<SaleFilter>({
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    nextFollowUpDate: undefined,
  });

  const toggleActionMenu = (id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setStatsLoading(true);
    try {
      const activeFilter = { ...filter, search: debouncedSearchTerm || undefined };
      const [salesRes, statsRes] = await Promise.all([
        getSales(activeFilter, currentPage, limit),
        getSalesStats(activeFilter)
      ]);
      setSales(salesRes.sales || []);
      setTotalPages(salesRes.totalPages || 1);
      setTotalCount(salesRes.totalCount || 0);
      setStats(statsRes || {});
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      toast.error('Failed to load enquiries.');
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, [filter, currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleDelete = async (id: string) => {
    toast.custom(
      (t) => (
        <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-medium text-gray-800">
            Are you sure you want to delete this enquiry record?
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => toast.dismiss(t)}
              className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t);
                const loadingId = toast.loading('Deleting enquiry...');
                try {
                  const response = await deleteSale(id);
                  toast.dismiss(loadingId);
                  if (response.success) {
                    toast.success('Enquiry deleted successfully!');
                    fetchSales();
                  } else {
                    toast.error(response.message || 'Failed to delete enquiry.');
                  }
                } catch (error: any) {
                  toast.dismiss(loadingId);
                  toast.error(
                    error.response?.data?.message ||
                    'Something went wrong while deleting.'
                  );
                }
              }}
              className="px-3 py-1 text-sm bg-teal-700 text-white rounded-md hover:bg-teal-800 transition"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      { id: 'delete-confirm', duration: Infinity, position: 'top-right' }
    );
  };

  const columns: Column<Sale>[] = useMemo(() => {
    const baseColumns: Column<Sale>[] = [
      { accessor: 'ticketNo', header: 'Ticket No' },
      { accessor: 'companyName', header: 'Company' },
      { accessor: 'name', header: 'Contact Person' },
      { accessor: 'contactPersonMobile', header: 'Mobile' },
      {
        accessor: 'contactedBy',
        header: 'Contacted By',
        render: (sale) => (
          <span className="text-sm font-medium text-gray-600">
            {sale.contactedBy || '--'}
          </span>
        ),
      },
      { accessor: 'date', header: 'Enquiry Date' },
      {
        accessor: 'status',
        header: 'Status',
        render: (sale) => (
          <span
            className="px-3 py-1 text-[11px] font-bold rounded-full text-white inline-block shadow-sm"
            style={{ backgroundColor: getStatusColor(sale.status || '') }}
          >
            {sale.status}
          </span>
        ),
      },
      {
        accessor: 'createdBy' as any,
        header: 'Created By',
        render: (sale: Sale) => (
          <span className="text-sm font-medium text-gray-600">
            {typeof sale.user === 'object' ? (sale.user as any).name : (typeof sale.createdBy === 'object' ? (sale.createdBy as any).name : (sale.createdBy || '--'))}
          </span>
        ),
      },
      {
        accessor: 'createdAt',
        header: 'Date Created',
        render: (sale: Sale) => (
          <span className="text-sm font-medium text-gray-600">
            {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
          </span>
        ),
      },
    ];

    if (can('sales', 'update') || can('sales', 'delete')) {
      baseColumns.push({
        accessor: '_id' as keyof Sale,
        header: 'Actions',
        render: (sale) => (
          <div className="flex items-center gap-2">
            {can('sales', 'view') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/sales/${sale._id}`);
                }}
                className="w-9 h-9 flex items-center justify-center text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-all border border-gray-100 hover:border-sky-200"
                title="View Enquiry"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {can('sales', 'update') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSale(sale);
                  setShowStatusModal(true);
                }}
                className="w-9 h-9 flex items-center justify-center text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-all border border-gray-100 hover:border-sky-200"
                title="Update Status"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            )}
            {can('sales', 'update') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/sales/edit/${sale._id}`);
                }}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {can('sales', 'delete') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (sale._id) handleDelete(sale._id);
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
    }

    return baseColumns;
  }, [openMenu, can, router, handleDelete]);

  const handleRowClick = (sale: Sale) => {
    if (sale._id && can('sales', 'update')) router.push(`/sales/${sale._id}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-2 md:p-4">
      <ListPageHeader
        eyebrow="CRM Pipeline"
        title="Enquiry"
        highlight="Management"
        description="Track leads, follow-ups, enquiry status, and customer conversations."
        actions={
          <>
            <button
              onClick={() => setShowImport(true)}
              className="page-header-button secondary"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            {can('sales', 'create') && (
              <button
                onClick={() => router.push('/sales/add')}
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
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </>
        }
      />

      <LeadsStatsWidgets stats={stats} loading={statsLoading} />

      {/* Persistent Filters Section */}
      <div className={showFilters ? 'block mb-6' : 'hidden'}>
        <SalesFilterBar
          onStatusChange={useCallback((status) => setFilter(prev => ({ ...prev, status })), [])}
          onStartDateChange={useCallback((startDate) => setFilter(prev => ({ ...prev, startDate })), [])}
          onEndDateChange={useCallback((endDate) => setFilter(prev => ({ ...prev, endDate })), [])}
          onFollowUpDateChange={useCallback((nextFollowUpDate) => setFilter(prev => ({ ...prev, nextFollowUpDate })), [])}
          onClearFilters={useCallback(() => {
            setFilter({
              status: undefined,
              startDate: undefined,
              endDate: undefined,
              nextFollowUpDate: undefined,
            });
            setSearchTerm('');
            setCurrentPage(1);
          }, [])}
          initialStatus={filter.status}
          initialStartDate={filter.startDate}
          initialEndDate={filter.endDate}
          initialFollowUpDate={filter.nextFollowUpDate}
        />
      </div>

      {/* Persistent Search Input */}
      <div className="mb-6">
        <SearchInput
          initialSearchTerm={searchTerm}
          onSearchChange={useCallback((val: string) => setSearchTerm(val), [])}
          placeholder="Search enquiries by company, name, email or mobile..."
        />
      </div>

      {/* Main Table Area */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={sales}
          onRowClick={handleRowClick}
          serverSidePagination={true}
          totalCount={totalCount}
          currentPage={currentPage}
          limit={limit}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
        />
      )}

      {showStatusModal && selectedSale && (
        <StatusUpdateModal
          sale={selectedSale}
          onClose={() => setShowStatusModal(false)}
          onUpdated={fetchSales}
        />
      )}

      {showImport && (
        <ImportSheetModal
          onClose={() => setShowImport(false)}
          onImported={fetchSales}
        />
      )}
    </div>
  );
};

export default withAuth(SalesPage, [{ module: 'sales', action: 'view' }]);
