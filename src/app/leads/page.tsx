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
  Edit2,
  Filter,
  TrendingUp,
  Plus,
  Trash2,
  Upload,
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
    'Request to Developer': '#8b5cf6',
  };
  return colors[status] || '#6b7280';
};

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Sale[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Sale | null>(null);
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    setStatsLoading(true);
    try {
      const activeFilter = { ...filter, search: debouncedSearchTerm || undefined };
      
      const [leadsRes, statsRes] = await Promise.all([
        getSales(activeFilter, currentPage, limit),
        getSalesStats(activeFilter)
      ]);

      setLeads(leadsRes.sales || []);
      setTotalPages(leadsRes.totalPages || 1);
      setTotalCount(leadsRes.totalCount || 0);
      setStats(statsRes || {});
    } catch (error) {
      console.error('Failed to fetch leads data:', error);
      toast.error('Failed to load leads.');
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, [filter, currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    toast.custom(
      (t) => (
        <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-medium text-gray-800">Are you sure you want to delete this lead?</p>
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
                const loadingId = toast.loading('Deleting lead...');
                try {
                  const response = await deleteSale(id);
                  toast.dismiss(loadingId);
                  if (response.success) {
                    toast.success('Lead deleted successfully!');
                    fetchData();
                  } else {
                    toast.error(response.message || 'Failed to delete lead.');
                  }
                } catch (error: any) {
                  toast.dismiss(loadingId);
                  toast.error(error.response?.data?.message || 'Something went wrong.');
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
        render: (lead) => (
          <span className="text-sm font-medium text-gray-600">
            {lead.contactedBy || '--'}
          </span>
        ),
      },
      { accessor: 'date', header: 'Date' },
      {
        accessor: 'status',
        header: 'Status',
        render: (lead) => (
          <span
            className="px-3 py-1 text-[11px] font-bold rounded-full text-white inline-block shadow-sm"
            style={{ backgroundColor: getStatusColor(lead.status || '') }}
          >
            {lead.status}
          </span>
        ),
      },
      {
        accessor: 'createdAt' as any,
        header: 'Registered',
        render: (lead: Sale) => (
          <span className="text-sm font-medium text-gray-600">
            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
          </span>
        ),
      },
    ];

    if (can('sales', 'update') || can('sales', 'delete')) {
      baseColumns.push({
        accessor: '_id' as keyof Sale,
        header: 'Actions',
        render: (lead) => (
          <div className="flex items-center gap-2">
            {can('sales', 'update') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLead(lead);
                  setShowStatusModal(true);
                }}
                className="w-8 h-8 flex items-center justify-center text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-all border border-gray-100"
                title="Update Status"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            )}
            {can('sales', 'update') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/sales/edit/${lead._id}`);
                }}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all border border-gray-100"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {can('sales', 'delete') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (lead._id) handleDelete(lead._id);
                }}
                className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-100"
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
  }, [can, router]);

  const handleRowClick = (lead: Sale) => {
    if (lead._id && can('sales', 'update')) router.push(`/sales/${lead._id}`);
  };

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#f8fafc]">
      <div className="max-w-full mx-auto space-y-12">
        <ListPageHeader
          eyebrow="Pipeline Management"
          title="Leads"
          highlight="Dashboard"
          description="Monitor lead generation, track follow-ups, and manage your enquiry funnel."
          actions={
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowImport(true)} 
                className="px-6 py-4 bg-white text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm border border-gray-100 hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95"
              >
                <Upload size={18} /> Import
              </button>
              {can('sales', 'create') && (
                <button 
                  onClick={() => router.push('/sales/add')} 
                  className="px-8 py-5 bg-[#0f766e] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-teal-900/30 hover:shadow-teal-900/40 hover:-translate-y-1 transition-all flex items-center gap-3 active:scale-95"
                >
                  <Plus size={20} strokeWidth={3} /> Add Lead
                </button>
              )}
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 active:scale-95 border ${showFilters ? 'bg-[#0f766e] text-white border-teal-800 shadow-lg shadow-teal-900/20' : 'bg-white text-gray-400 border-gray-100 shadow-sm hover:bg-gray-50'}`}
              >
                <Filter size={18} /> {showFilters ? 'Hide Filters' : 'Filters'}
              </button>
            </div>
          }
        />

        {/* 📊 STATISTICS WIDGETS */}
        <LeadsStatsWidgets stats={stats} loading={statsLoading} />

        <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-900/5 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            <div className="w-full md:w-1/2">
                <SearchInput
                  initialSearchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search leads by company, contact, or ticket number..."
                />
            </div>
            
            <div className={showFilters ? 'w-full md:w-1/2 animate-in slide-in-from-right duration-500' : 'hidden'}>
                <SalesFilterBar
                  onStatusChange={(status) => setFilter(prev => ({ ...prev, status }))}
                  onStartDateChange={(startDate) => setFilter(prev => ({ ...prev, startDate }))}
                  onEndDateChange={(endDate) => setFilter(prev => ({ ...prev, endDate }))}
                  onFollowUpDateChange={(nextFollowUpDate) => setFilter(prev => ({ ...prev, nextFollowUpDate }))}
                  onClearFilters={() => {
                    setFilter({ status: undefined, startDate: undefined, endDate: undefined, nextFollowUpDate: undefined });
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  initialStatus={filter.status}
                  initialStartDate={filter.startDate}
                  initialEndDate={filter.endDate}
                  initialFollowUpDate={filter.nextFollowUpDate}
                />
            </div>
          </div>

          {loading && leads.length === 0 ? (
            <TableSkeleton />
          ) : (
            <DataTable
              columns={columns}
              data={leads}
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
        </div>
      </div>

      {showStatusModal && selectedLead && (
        <StatusUpdateModal
          sale={selectedLead}
          onClose={() => setShowStatusModal(false)}
          onUpdated={fetchData}
        />
      )}

      {showImport && (
        <ImportSheetModal
          onClose={() => setShowImport(false)}
          onImported={fetchData}
        />
      )}
    </div>
  );
};

export default withAuth(LeadsPage, [{ module: 'sales', action: 'view' }]);
