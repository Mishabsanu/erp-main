'use client';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { useAuth } from '@/contexts/AuthContext';
import { Worker } from '@/lib/types';
import { getWorkers, deleteWorker } from '@/services/workerApi';
import {
  HardHat,
  Edit2,
  Plus,
  Trash2,
  Globe,
  Calendar,
  Contact,
  ClipboardList,
  Package
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const WorkforcePage: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { can } = useAuth();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getWorkers({
        search: searchTerm || undefined,
        page: currentPage,
        limit,
      });
      setWorkers(response.data.content);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      toast.error('Failed to load workforce data');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, limit]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleDelete = async (id: string) => {
    toast.warning('Are you sure you want to remove this worker record?', {
      action: {
        label: 'Remove',
        onClick: async () => {
          try {
            await deleteWorker(id);
            toast.success('Worker record removed');
            fetchWorkers();
          } catch (error) {
            toast.error('Removal failed');
          }
        }
      }
    });
  };

  const columns: Column<Worker>[] = useMemo(() => [
    {
      accessor: 'workerId',
      header: 'Worker ID',
      render: (w) => <span className="font-mono text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded font-bold text-slate-600">{w.workerId}</span>
    },
    {
      accessor: 'name',
      header: 'Full Name',
      render: (w) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 font-black text-sm border border-teal-100">
            {w.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 leading-tight">{w.name}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{w.designation}</span>
          </div>
        </div>
      )
    },
    {
      accessor: 'nationality',
      header: 'Nationality',
      render: (w) => (
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-600">{w.nationality || '--'}</span>
        </div>
      )
    },
    {
      accessor: 'qidNo',
      header: 'Documents',
      render: (w) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">QID: {w.qidNo || '--'}</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pass: {w.passportNo || '--'}</span>
        </div>
      )
    },
    {
      accessor: 'status',
      header: 'Status',
      render: (w) => {
        const colors = {
          active: 'bg-green-100 text-green-700',
          on_leave: 'bg-teal-100 text-teal-700',
          resigned: 'bg-red-100 text-red-700'
        };
        return (
          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${colors[w.status]}`}>
            {w.status.replace('_', ' ')}
          </span>
        )
      }
    },
    {
      accessor: 'createdBy' as any,
      header: 'Managed By',
      render: (w) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-700">{(w.createdBy as any)?.name || 'System'}</span>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '--'}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: '_id' as any,
      render: (w) => (
        <div className="flex items-center gap-2">
          {can('worker', 'view') && (
            <button onClick={() => router.push(`/workers/${w._id}`)} className="p-2 hover:bg-teal-50 rounded-lg text-gray-400 hover:text-teal-700 transition-colors" title="View Profile">
              <Package size={16} />
            </button>
          )}
          {can('worker', 'update') && (
            <button onClick={() => router.push(`/workers/edit/${w._id}`)} className="p-2 hover:bg-teal-50 rounded-lg text-gray-400 hover:text-teal-700 transition-colors" title="Edit">
              <Edit2 size={16} />
            </button>
          )}
          {can('worker', 'delete') && (
            <button onClick={() => handleDelete(w._id!)} className="p-2 hover:bg-rose-50 rounded-lg text-red-400 hover:text-red-600 transition-colors" title="Delete">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ], [can, router, handleDelete]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Workforce Node"
        title="Labor"
        highlight="Management"
        description="Personnel registry for manufacturing laborers, work permits, and housing allocation."
        actions={
          <button
            onClick={() => router.push('/workers/add')}
            className="page-header-button"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        }
      />

      <div className="mb-6 mt-10">
        <SearchInput
          initialSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by name, ID, Passport or QID..."
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={workers}
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
  );
}

export default withAuth(WorkforcePage, [{ module: 'worker', action: 'view' }]);
