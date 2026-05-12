'use client';

import { formatDate } from '@/app/utils/formatDate';
import { VendorFilterBar } from '@/components/master/VendorFilterBar'; // Import VendorFilterBar
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput'; // Import SearchInput
import { TableSkeleton } from '@/components/shared/TableSkeleton'; // Import TableSkeleton
import { useAuth } from '@/contexts/AuthContext';
import { Vendor, VendorFilter } from '@/lib/types';
import { deleteVendor, getVendors } from '@/services/vendorApi';
import { Edit2, Filter, MoreVertical, Plus, Trash2, Eye } from 'lucide-react'; // Import Filter and Eye icon
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const VendorPage: React.FC = () => {
  const router = useRouter();
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null); // State for action menu
  const [showFilters, setShowFilters] = useState(false); // New state for filter visibility
  const { can } = useAuth();

  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<VendorFilter['status']>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalVendorsCount, setTotalVendorsCount] = useState(0);
  const [totalPagesCount, setTotalPagesCount] = useState(1);

  const fetchAllVendors = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams: VendorFilter = {
        search: searchTerm || undefined,
        status: statusFilter,
      };
      const {
        vendors: fetchedVendors,
        totalCount: fetchedTotalCount,
        totalPages: fetchedTotalPages,
      } = await getVendors(filterParams, currentPage, limit);
      setAllVendors(fetchedVendors);
      setTotalVendorsCount(fetchedTotalCount);
      setTotalPagesCount(fetchedTotalPages);
    } catch (error) {
      toast.error('Failed to fetch vendors.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, currentPage, limit]);

  useEffect(() => {
    fetchAllVendors();
  }, [fetchAllVendors]);

  const toggleActionMenu = (id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const handleAddVendor = () => {
    router.push('/master/vendor/add');
  };

  const handleEdit = (id: string) => {
    router.push(`/master/vendor/edit/${id}`);
  };

  const handleRowClick = (vendor: Vendor) => {
    if (vendor._id && can('vendor', 'update')) {
      router.push(`/master/vendor/${vendor._id}`);
    }
  };

  const handleDelete = async (id: string) => {
    // Show confirmation toast
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-800">
          Are you sure you want to delete this vendor?
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
              const loadingToast = toast.loading('Deleting vendor...');
              try {
                const response = await deleteVendor(id);
                toast.dismiss(loadingToast);
                if (response.success) {
                  toast.success(
                    response.message || 'Vendor deleted successfully!'
                  );
                  fetchAllVendors(); // Re-fetch data to update the list
                } else {
                  toast.error(response.message || 'Failed to delete vendor.');
                }
              } catch (error: any) {
                toast.dismiss(loadingToast);
                toast.error(
                  error.message || 'Something went wrong while deleting.'
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

  const columns: Column<Vendor>[] = useMemo(() => {
    const baseColumns: Column<Vendor>[] = [
      { accessor: 'company', header: 'Company' },
      { accessor: 'mobile', header: 'Mobile' },
      { accessor: 'contactPersonName', header: 'Contact Person Name' },
      { accessor: 'contactPersonMobile', header: 'Contact Person Mobile' },
      {
        accessor: 'createdBy' as any,
        header: 'Created By',
        render: (vendor: any) => {
          const creator = vendor.user || vendor.createdBy;
          const name = typeof creator === 'object' ? creator?.name : (typeof vendor.createdBy === 'object' ? vendor.createdBy?.name : (vendor.createdBy || '--'));
          return (
            <span className="text-sm font-medium text-gray-600">
              {name || 'System'}
            </span>
          );
        },
      },
      {
        accessor: 'createdAt',
        header: 'Date Created',
        render: (vendor) => (
          <span className="text-sm font-medium text-gray-600">
            {formatDate(vendor.createdAt)}
          </span>
        ),
      },
      {
        accessor: 'status',
        header: 'Status',
        render: (vendor) => (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${vendor.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
                }`}
            >
              {vendor.status}
            </span>
            {vendor.isInternal && (
              <span className="px-3 py-1 text-[10px] font-black bg-blue-50 text-blue-600 rounded-full border border-blue-100 uppercase tracking-tighter">
                Internal
              </span>
            )}
          </div>
        ),
      },
    ];

    if (can('vendor', 'update') || can('vendor', 'delete')) {
      baseColumns.push({
        accessor: 'actions' as keyof Vendor, // Cast to keyof Vendor to satisfy type, as 'actions' is not a direct property
        header: 'Actions',
        render: (vendor) => (
          <div className="flex items-center gap-2">
            {can('vendor', 'view') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (vendor._id) router.push(`/master/vendor/${vendor._id}`);
                }}
                className="w-9 h-9 flex items-center justify-center text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-all border border-gray-100 hover:border-sky-200"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {can('vendor', 'update') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (vendor._id) handleEdit(vendor._id);
                }}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {can('vendor', 'delete') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (vendor._id) handleDelete(vendor._id);
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
  }, [openMenu, can, handleEdit, handleDelete]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-2 md:p-4">
      <ListPageHeader
        eyebrow="Supplier Registry"
        title="Vendor"
        highlight="Management"
        description="Maintain vendor master records, supply contacts, and status."
        actions={
          <>
            {can('vendor', 'create') && (
              <button
                onClick={handleAddVendor}
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
              {showFilters ? 'Hide' : 'Filter'}
            </button>
          </>
        }
      />

      {showFilters ? (
        <>
          {/* Filters */}
          <VendorFilterBar
            onStatusChange={setStatusFilter}
            onClearFilters={() => {
              setSearchTerm('');
              setStatusFilter(undefined);
              setCurrentPage(1); // Reset page on clear
            }}
            initialStatus={statusFilter}
          />
          {/* Search Input */}
          <div className="mb-6">
            <SearchInput
              initialSearchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search vendors..."
            />
          </div>
        </>
      ) : (
        <>
          {/* Search Input */}
          <div className="mb-6">
            <SearchInput
              initialSearchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search vendors..."
            />
          </div>
        </>
      )}

      {loading ? (
        <TableSkeleton /> // Replaced LoadingSpinner with TableSkeleton
      ) : (
        <DataTable
          columns={columns}
          data={allVendors}
          onRowClick={handleRowClick}
          serverSidePagination={true}
          totalCount={totalVendorsCount}
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

export default withAuth(VendorPage, [{ module: 'vendor', action: 'view' }]);
