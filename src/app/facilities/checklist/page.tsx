'use client';

import { formatDate } from '@/app/utils/formatDate';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { FacilityChecklist } from '@/lib/types';
import { Building2, Eye, Plus, Search, Edit2, Trash2, Filter, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChecklistFilterBar } from '@/components/inventory/ChecklistFilterBar';
import { SearchInput } from '@/components/shared/SearchInput';
import { deleteAuditReport, getAuditLogs, verifyAuditReport } from '@/services/facilityApi';

const ChecklistReportsPage: React.FC = () => {
  const [reports, setReports] = useState<FacilityChecklist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { can } = useAuth();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [date, setDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAuditLogs({
        page: currentPage,
        limit,
        search,
        facilityId,
        date,
      });
      setReports(response.data.content);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      toast.error('Failed to load audit reports');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search, facilityId, date]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDelete = async (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 min-w-[320px] animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shadow-sm">
             <Trash2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Security Protocol</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirm Audit Purge</p>
          </div>
        </div>
        <p className="text-xs font-medium text-slate-600 leading-relaxed mb-3">
          This operation will permanently remove this audit log and all associated compliance evidence. This action cannot be reversed.
        </p>
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-4 py-2 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t);
              const loadingToast = toast.loading('Purging audit log...');
              try {
                await deleteAuditReport(id);
                toast.dismiss(loadingToast);
                toast.success('Audit log successfully purged');
                fetchReports();
              } catch (error: any) {
                toast.dismiss(loadingToast);
                toast.error(error.response?.data?.message || 'Purge failed');
              }
            }}
            className="px-6 py-2 text-xs font-black bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-900/20 transition-all active:scale-95 uppercase tracking-widest"
          >
            Confirm Purge
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const handleVerify = async (id: string, status: 'Approved' | 'Rejected') => {
    const loadingToast = toast.loading(`${status === 'Approved' ? 'Approving' : 'Rejecting'} report...`);
    try {
      await verifyAuditReport(id, status);
      toast.dismiss(loadingToast);
      toast.success(`Report ${status.toLowerCase()} successfully`);
      fetchReports();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Verification failed');
    }
  };

  const columns: Column<FacilityChecklist>[] = useMemo(() => [
    {
      accessor: 'date',
      header: 'Audit Date',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{formatDate(r.date)}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.checkFrequency}</span>
        </div>
      )
    },
    {
      accessor: 'facilityId' as any,
      header: 'Infrastructure Asset',
      render: (r) => {
        const facility = r.facilityId as any;
        return (
          <div className="flex items-center gap-4 py-2">
            <div className="w-12 h-12 bg-[#0f766e]/5 text-[#0f766e] rounded-[1.25rem] border border-[#0f766e]/20 flex items-center justify-center shadow-sm">
              <Building2 size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-black text-[#0f172a] text-[15px] tracking-tight leading-none mb-1.5">{facility?.name || 'N/A'}</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 opacity-70">
                <span className="text-[#0f766e]">{facility?.type || 'Node'} NODE</span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      accessor: 'isClean',
      header: 'Logistics Type',
      render: (r) => (
        <span className="px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border bg-[#0f766e]/5 text-[#0f766e] border-[#0f766e]/10">
          AUDIT UNIT
        </span>
      )
    },
    {
      accessor: 'status' as any,
      header: 'Compliance',
      render: (r) => {
        const isPass = r.isClean && r.isFireSafetyOK && r.isWaterAvailable;
        return (
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isPass ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${isPass ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
              {isPass ? 'COMPLIANT' : 'ISSUES'}
            </span>
          </div>
        );
      }
    },
    {
        accessor: 'verificationStatus' as any,
        header: 'Verify Status',
        render: (r) => (
            <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${
                    r.verificationStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    r.verificationStatus === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-slate-50 text-slate-500 border-slate-200 animate-pulse'
                }`}>
                    {r.verificationStatus || 'Pending'}
                </span>
            </div>
        )
    },
    {
        accessor: 'inspectorId' as any,
        header: 'Inspector',
        render: (r) => (
          <span className="text-xs font-medium text-slate-600">
            {(r.inspectorId as any)?.name || 'System'}
          </span>
        )
    },
    {
      header: 'Actions',
      accessor: '_id' as any,
      render: (r) => (
        <div className="flex items-center gap-2 justify-end">
          {can('facility_audit', 'update') && r.verificationStatus === 'Pending' && (
            <>
              <button
                onClick={() => handleVerify(r._id!, 'Approved')}
                title="Approve Report"
                className="w-9 h-9 flex items-center justify-center bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-100 transition-all shadow-sm"
              >
                <CheckCircle size={16} />
              </button>
              <button
                onClick={() => handleVerify(r._id!, 'Rejected')}
                title="Reject Report"
                className="w-9 h-9 flex items-center justify-center bg-white text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-100 transition-all shadow-sm"
              >
                <XCircle size={16} />
              </button>
            </>
          )}
          <button
            onClick={() => router.push(`/facilities/checklist/${r._id}`)}
            title="View Details"
            className="w-9 h-9 flex items-center justify-center bg-white text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-100 transition-all shadow-sm"
          >
            <Eye size={16} />
          </button>
          {can('facility_audit', 'update') && (
            <button
              onClick={() => router.push(`/facilities/checklist/edit/${r._id}`)}
              title="Edit Report"
              className="w-9 h-9 flex items-center justify-center bg-white text-slate-400 hover:text-[#d97706] hover:bg-[#d97706]/5 rounded-lg border border-slate-100 transition-all shadow-sm"
            >
              <Edit2 size={16} />
            </button>
          )}
          {can('facility_audit', 'delete') && (
            <button
              onClick={() => handleDelete(r._id!)}
              title="Delete Report"
              className="w-9 h-9 flex items-center justify-center bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-100 transition-all shadow-sm"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ], [router, can]);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-6 md:p-10">
      <ListPageHeader
        eyebrow="Compliance & Maintenance"
        title="Audit"
        highlight="Reports"
        description="View and manage health, safety, and infrastructure audit logs for all facilities."
        actions={
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`page-header-button secondary ${showFilters ? 'bg-emerald-50 border-emerald-600/30 text-emerald-700' : ''}`}
            >
              <Filter size={16} /> {showFilters ? 'Hide' : 'Filter'}
            </button>
            <button onClick={() => router.push('/facilities/checklist/new')} className="page-header-button">
              <Plus size={16} /> New Audit Report
            </button>
          </div>
        }
      />

      <div className="mt-8 mb-6">
        <SearchInput 
          initialSearchTerm={search}
          onSearchChange={setSearch}
          placeholder="Search inspector or remarks..."
        />
      </div>

      {showFilters && (
        <ChecklistFilterBar 
          onFacilityChange={setFacilityId}
          onDateChange={setDate}
          onClearFilters={() => {
            setFacilityId('');
            setDate('');
            setSearch('');
          }}
        />
      )}

      <div className="mt-12 bg-white/30 backdrop-blur-sm">
        {loading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={reports}
            serverSidePagination={true}
            totalCount={totalCount}
            currentPage={currentPage}
            limit={limit}
            totalPages={Math.ceil(totalCount / limit)}
            onPageChange={setCurrentPage}
            onLimitChange={setLimit}
          />
        )}
      </div>
    </div>
  );
};

export default withAuth(ChecklistReportsPage, [{ module: 'facility_audit', action: 'view' }]);
