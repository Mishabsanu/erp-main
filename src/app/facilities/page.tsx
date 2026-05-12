'use client';
import { formatDate } from '@/app/utils/formatDate';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Facility } from '@/lib/types';
import { getFacilities, deleteFacility } from '@/services/facilityApi';
import {
  Home,
  Briefcase,
  FileText,
  Search,
  Filter,
  Plus,
  Building2,
  Edit2,
  Trash2,
  MapPin,
  Clock
} from 'lucide-react';
import { SearchInput } from '@/components/shared/SearchInput';
import { FacilityFilterBar } from '@/components/master/FacilityFilterBar';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const FacilitiesPage: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { can } = useAuth();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getFacilities({
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        status: statusFilter,
        type: typeFilter,
      });
      setFacilities(response.data.content);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      toast.error('Failed to load facilities');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const handleDelete = async (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 min-w-[320px] animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shadow-sm">
             <Trash2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Security Protocol</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirm Asset Deletion</p>
          </div>
        </div>
        <p className="text-xs font-medium text-slate-600 leading-relaxed mb-3">
          This operation will permanently remove the facility and all associated logs from the registry. This action cannot be reversed.
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
              const loadingToast = toast.loading('Purging facility from registry...');
              try {
                await deleteFacility(id);
                toast.dismiss(loadingToast);
                toast.success('Facility successfully purged');
                fetchFacilities();
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

  const columns: Column<Facility>[] = useMemo(() => [
    {
      accessor: 'name',
      header: 'Infrastructure Asset',
      render: (f) => (
        <div className="flex items-center gap-4 py-2">
          <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center border transition-all hover:scale-110 shadow-sm bg-[#0f766e]/5 border-[#0f766e]/20 text-[#0f766e]">
            {f.type === 'Office' ? <Briefcase size={22} strokeWidth={2.5} /> : <Building2 size={22} strokeWidth={2.5} />}
          </div>
          <div>
            <div className="font-black text-[#0f172a] text-[15px] tracking-tight leading-none mb-1.5">{f.name}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 opacity-70">
              <span className="text-[#0f766e]">{f.type} NODE</span>
            </div>
          </div>
        </div>
      )
    },
    {
      accessor: 'type',
      header: 'Logistics Type',
      render: (f) => (
        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border ${f.type === 'Office' ? 'bg-[#0f766e]/5 text-[#0f766e] border-[#0f766e]/10' : 'bg-[#d97706]/5 text-[#d97706] border-[#d97706]/10'}`}>
          {f.type} UNIT
        </span>
      )
    },
    {
      accessor: 'location',
      header: 'Location',
      render: (f) => (
        <div className="flex items-center gap-1 text-gray-500">
          <MapPin size={12} />
          <span className="text-xs">{f.location || 'Not Specified'}</span>
        </div>
      )
    },
    { accessor: 'capacity', header: 'Capacity', render: (f) => <span className="font-bold text-gray-600">{f.capacity || '--'}</span> },
    {
      accessor: 'lastAuditDate' as any,
      header: 'Audit Health',
      render: (f) => (
        <div className="flex flex-col">
          {f.lastAuditDate ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${f.lastAuditStatus === 'Compliant' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${f.lastAuditStatus === 'Compliant' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {f.lastAuditStatus}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                <Clock size={10} /> Checked {formatDate(f.lastAuditDate)}
              </span>
            </>
          ) : (
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Never Audited</span>
          )}
        </div>
      )
    },
    {
      accessor: 'status',
      header: 'Master Status',
      render: (f) => (
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${f.status === 'active' ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
            {f.status}
          </span>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: '_id' as any,
      render: (f) => (
        <div className="flex items-center gap-2 justify-end">
          {can('facility', 'update') && (
            <button
              onClick={() => router.push(`/facilities/edit/${f._id}`)}
              className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-[#d97706] hover:bg-[#d97706]/5 rounded-xl border border-slate-100 transition-all active:scale-95 shadow-sm"
            >
              <Edit2 size={16} />
            </button>
          )}
          {can('facility', 'delete') && (
            <button
              onClick={() => handleDelete(f._id!)}
              className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-100 transition-all active:scale-95 shadow-sm"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ], [can]);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-6 md:p-10">
      <ListPageHeader
        eyebrow="Facilities & Infrastructure"
        title="Offices"
        highlight="& Camps"
        description="Manage company locations, worker camps, and administrative offices."
        actions={
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`page-header-button secondary ${showFilters ? 'bg-emerald-50 border-emerald-600/30 text-emerald-700' : ''}`}
            >
              <Filter size={16} /> {showFilters ? 'Hide' : 'Filter'}
            </button>
            <button 
              onClick={() => router.push('/facilities/checklist')} 
              className="page-header-button secondary border-emerald-600/20 text-emerald-700 hover:bg-emerald-50"
            >
              <FileText size={16} /> Audit Reports
            </button>
            <button onClick={() => router.push('/facilities/add')} className="page-header-button">
              <Plus size={16} /> Add Facility
            </button>
          </div>
        }
      />

      <div className="mt-8 mb-6">
        <SearchInput 
          initialSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search node name or location..."
        />
      </div>

      {showFilters && (
        <FacilityFilterBar 
          selectedStatus={statusFilter}
          selectedType={typeFilter}
          onStatusChange={setStatusFilter}
          onTypeChange={setTypeFilter}
          onClearFilters={() => {
            setStatusFilter(undefined);
            setTypeFilter(undefined);
            setSearchTerm('');
          }}
        />
      )}

      <div className="mt-12 bg-white/30 backdrop-blur-sm">
        {loading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={facilities}
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

export default withAuth(FacilitiesPage, [{ module: 'facility', action: 'view' }]);
