'use client';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Vehicle } from '@/lib/types';
import { deleteVehicle, getVehicles } from '@/services/fleetApi';
import {
  Edit2,
  Filter,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const FleetPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState(false);
  const { can } = useAuth();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getVehicles({
        search: searchTerm || undefined,
        page: currentPage,
        limit,
      });
      setVehicles(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load fleet data.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, limit]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleDelete = async (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-800">
          Are you sure you want to remove this vehicle from fleet?
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
              const loadingToast = toast.loading('Removing vehicle...');
              try {
                await deleteVehicle(id);
                toast.dismiss(loadingToast);
                toast.success('Vehicle removed successfully');
                fetchVehicles();
              } catch (error: any) {
                toast.dismiss(loadingToast);
                toast.error('Failed to delete vehicle');
              }
            }}
            className="px-3 py-1 text-sm bg-teal-700 text-white rounded-md hover:bg-teal-800 transition"
          >
            Yes, Remove
          </button>
        </div>
      </div>
    ));
  };

  const columns: Column<Vehicle>[] = useMemo(() => [
    { 
      accessor: 'name', 
      header: 'Vehicle Name',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Truck size={16} className="text-gray-600" />
          </div>
          <span className="font-bold text-gray-800">{v.name}</span>
        </div>
      )
    },
    { accessor: 'plateNo', header: 'Plate Number', render: (v) => <span className="font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">{v.plateNo}</span> },
    { accessor: 'type', header: 'Type' },
    { accessor: 'model', header: 'Model/Year', render: (v) => <span>{v.model || '-'} {v.year ? `(${v.year})` : ''}</span> },
    { 
      accessor: 'odometer', 
      header: 'Last Odometer',
      render: (v) => <span className="font-mono text-emerald-600 font-bold">{v.odometer.toLocaleString()} km</span>
    },
    {
      accessor: 'registrationExpiry',
      header: 'Registration',
      render: (v) => {
        if (!v.registrationExpiry) return <span className="text-gray-300 text-[10px] font-black uppercase">Not Set</span>;
        const expiry = new Date(v.registrationExpiry);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let colorClass = "text-gray-500 bg-gray-50 border-gray-100";
        if (diffDays < 0) colorClass = "text-rose-600 bg-rose-50 border-rose-100 animate-pulse";
        else if (diffDays < 30) colorClass = "text-amber-600 bg-amber-50 border-amber-100";

        return (
          <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold flex flex-col items-center gap-0.5 ${colorClass}`}>
            <span className="uppercase tracking-widest text-[8px] opacity-70">{diffDays < 0 ? 'Expired' : 'Expiry'}</span>
            <span>{new Date(v.registrationExpiry).toLocaleDateString()}</span>
          </div>
        );
      }
    },
    {
      accessor: 'insuranceExpiry',
      header: 'Insurance',
      render: (v) => {
        if (!v.insuranceExpiry) return <span className="text-gray-300 text-[10px] font-black uppercase">Not Set</span>;
        const expiry = new Date(v.insuranceExpiry);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let colorClass = "text-gray-500 bg-gray-50 border-gray-100";
        if (diffDays < 0) colorClass = "text-rose-600 bg-rose-50 border-rose-100 animate-pulse";
        else if (diffDays < 30) colorClass = "text-amber-600 bg-amber-50 border-amber-100";

        return (
          <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold flex flex-col items-center gap-0.5 ${colorClass}`}>
            <span className="uppercase tracking-widest text-[8px] opacity-70">{diffDays < 0 ? 'Expired' : 'Expiry'}</span>
            <span>{new Date(v.insuranceExpiry).toLocaleDateString()}</span>
          </div>
        );
      }
    },
    {
      accessor: 'status',
      header: 'Status',
      render: (v) => {
        const colors = {
          active: 'bg-green-100 text-green-800',
          maintenance: 'bg-amber-100 text-amber-800',
          inactive: 'bg-red-100 text-red-800'
        };
        return <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full ${colors[v.status as keyof typeof colors]}`}>{v.status}</span>
      }
    },
    {
      header: 'Actions',
      accessor: '_id' as any,
      render: (v) => (
        <div className="flex items-center gap-2">
          {can('fleet', 'update') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/fleet/edit/${v._id}`);
              }}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {can('fleet', 'delete') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(v._id!);
              }}
              className="w-9 h-9 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-100 hover:border-red-200"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ], [can, router]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-2 md:p-4">
      <ListPageHeader
        eyebrow="Logistics Node"
        title="Vehicle"
        highlight="Registry"
        description="Centralized fleet telemetry and asset management for company logistics."
        actions={
          <>
            {can('fleet', 'create') && (
              <button
                onClick={() => router.push('/fleet/add')}
                className="page-header-button"
              >
                <Plus size={16} /> Add
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="page-header-button secondary"
            >
              <Filter size={16} /> Filter
            </button>
          </>
        }
      />

      <div className="mb-6">
        <SearchInput
          initialSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by name, plate number or model..."
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={vehicles}
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
  );
};

export default withAuth(FleetPage, [{ module: 'fleet', action: 'view' }]);
