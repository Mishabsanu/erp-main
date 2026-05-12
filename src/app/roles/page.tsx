'use client';
import { RoleFilterBar } from '@/components/roles/RoleFilterBar'; // Import RoleFilterBar
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput'; // Import SearchInput
import { TableSkeleton } from '@/components/shared/TableSkeleton'; // Import TableSkeleton
import { useAuth } from '@/contexts/AuthContext';
import { Role, RoleFilter } from '@/lib/types';
import { deleteRole, getRoles } from '@/services/roleApi';
import {
  Edit2,
  Filter,
  MoreVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const RolesPage: React.FC = () => {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false); // New state for filter visibility
  const { can } = useAuth();

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<RoleFilter['status']>(undefined);

  const router = useRouter();

  const toggleActionMenu = (id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const fetchAllRoles = useCallback(async () => {
    setLoading(true);
    try {
      // Current API fetches all, future improvement could pass search/status to API
      const { roles: fetchedRoles } = await getRoles({ search: '' }, 1, 9999); // Fetch all
      setAllRoles(fetchedRoles);
    } catch (error) {
      toast.error('Failed to fetch roles.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllRoles();
  }, [fetchAllRoles]);

  const filteredAndSearchedRoles = useMemo(() => {
    let currentRoles = allRoles;

    // Apply status filter
    if (statusFilter) {
      currentRoles = currentRoles.filter(
        (role) => role.status === statusFilter
      );
    }

    // Apply search term filter
    if (searchTerm) {
      currentRoles = currentRoles.filter(
        (role) =>
          role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (role.status &&
            role.status.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return currentRoles;
  }, [allRoles, statusFilter, searchTerm]);

  // Client-side pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const totalRolesCount = filteredAndSearchedRoles.length;
  const totalPagesCount = Math.ceil(totalRolesCount / limit);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * limit;
    const end = start + limit;
    return filteredAndSearchedRoles.slice(start, end);
  }, [filteredAndSearchedRoles, currentPage, limit]);

  const handleDelete = async (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-800">
          Are you sure you want to delete this role?
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
              const loadingId = toast.loading('Deleting role...');
              try {
                const response = await deleteRole(id);
                toast.dismiss(loadingId);
                if (response.success) {
                  toast.success(
                    response.message || 'Role deleted successfully!'
                  );
                  fetchAllRoles();
                } else {
                  toast.error(response.message || 'Failed to delete role.');
                }
              } catch (error: any) {
                toast.dismiss(loadingId);
                toast.error(
                  error.response?.data?.message || 'Something went wrong.'
                );
              }
            }}
            className="px-3 py-1 text-sm bg-teal-700 text-white rounded-md hover:bg-teal-800 transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    ));
  };

  const handleEdit = (id: string) => router.push(`/roles/edit/${id}`);
  const handleAddRole = () => router.push('/roles/add');
  const handleRowClick = (role: Role) => {
    if (role._id && can('role', 'update')) {
      router.push(`/roles/${role._id}`);
    }
  };
  const columns: Column<Role>[] = useMemo(() => {
    const baseColumns: Column<Role>[] = [
      { accessor: 'name', header: 'Role' },
      {
        accessor: 'permissions' as any,
        header: 'Access Rights',
        render: (role: Role) => {
          const activeModules = Object.values(role.permissions).filter((p: any) =>
            Object.values(p).some((v) => v === true)
          ).length;
          return (
            <div className="flex items-center gap-2">
              {role.isSuperAdmin && (
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-teal-500 text-white shadow-sm border border-teal-600/20 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Global Access
                </span>
              )}
              <span className="px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full bg-[#0f766e]/10 text-[#0f766e] border border-[#0f766e]/10">
                {activeModules} Modules
              </span>
            </div>
          );
        },
      },
      {
        accessor: 'status',
        header: 'Status',
        render: (role) => (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              role.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-teal-100 text-teal-900'
            }`}
          >
            {role.status}
          </span>
        ),
      },
      {
        accessor: 'createdBy' as any,
        header: 'Created By',
        render: (role: Role) => (
          <span className="text-sm font-medium text-gray-600">
            {typeof role.createdBy === 'object' ? role.createdBy.name : role.createdBy || '--'}
          </span>
        ),
      },
      {
        accessor: 'createdAt',
        header: 'Date Created',
        render: (role: Role) => (
          <span className="text-sm font-medium text-gray-600">
            {role.createdAt ? new Date(role.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
          </span>
        ),
      },
    ];

    if (can('role', 'update') || can('role', 'delete')) {
      baseColumns.push({
        accessor: '_id',
        header: 'Actions',
        render: (role) => (
          <div className="flex items-center gap-2">
            {can('role', 'update') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(role._id!);
                }}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {can('role', 'delete') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(role._id!);
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
  }, [openMenu, can]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Access Registry"
        title="Role"
        highlight="Management"
        description="Configure ERP roles, module permissions, and authorization rules."
        actions={
          <>
          {can('role', 'create') && (
            <button
              onClick={handleAddRole}
              className="page-header-button"
            >
              <Plus className="w-4 h-4" /> Add
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

      {showFilters ? (
        <>
          <RoleFilterBar
            onStatusChange={setStatusFilter}
            onClearFilters={() => {
              setSearchTerm('');
              setStatusFilter(undefined);
              setCurrentPage(1);
            }}
            initialStatus={statusFilter}
          />
          <div className="mb-6">
            <SearchInput
              initialSearchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search roles..."
            />
          </div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <SearchInput
              initialSearchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search roles..."
            />
          </div>
        </>
      )}

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={paginatedRoles} // Use paginated roles for DataTable
          onRowClick={handleRowClick}
          serverSidePagination={false} // Client-side pagination
          totalCount={totalRolesCount}
          currentPage={currentPage}
          limit={limit}
          totalPages={totalPagesCount}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
        />
      )}
    </div>
  );
};

export default withAuth(RolesPage, [{ module: 'role', action: 'view' }]);
