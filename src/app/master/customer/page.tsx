'use client';

import { formatDate } from '@/app/utils/formatDate';
import { CustomerFilterBar } from '@/components/master/CustomerFilterBar'; // Import CustomerFilterBar
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput'; // Import SearchInput
import { TableSkeleton } from '@/components/shared/TableSkeleton'; // Import TableSkeleton
import { useAuth } from '@/contexts/AuthContext';
import { Customer, CustomerFilter } from '@/lib/types';
import { deleteCustomer, getCustomers } from '@/services/customerApi';
import { Edit2, Filter, MoreVertical, Plus, Trash2, Eye } from 'lucide-react'; // Import Filter and Eye icon
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const CustomerPage: React.FC = () => {
  const router = useRouter();
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null); // State for action menu
  const [showFilters, setShowFilters] = useState(false); // New state for filter visibility
  const { can } = useAuth();

  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<CustomerFilter['status']>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCustomersCount, setTotalCustomersCount] = useState(0);
  const [totalPagesCount, setTotalPagesCount] = useState(1);

  const fetchAllCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams: CustomerFilter = {
        search: searchTerm || undefined,
        status: statusFilter,
      };
      const {
        customers: fetchedCustomers,
        totalCount: fetchedTotalCount,
        totalPages: fetchedTotalPages,
      } = await getCustomers(filterParams, currentPage, limit);
      setAllCustomers(fetchedCustomers);
      setTotalCustomersCount(fetchedTotalCount);
      setTotalPagesCount(fetchedTotalPages);
    } catch (error) {
      toast.error('Failed to fetch customers.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, currentPage, limit]);

  useEffect(() => {
    fetchAllCustomers();
  }, [fetchAllCustomers]);

  const toggleActionMenu = (id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const handleAddCustomer = () => {
    router.push('/master/customer/add');
  };

  const handleEdit = (id: string) => {
    router.push(`/master/customer/edit/${id}`);
  };

  const handleRowClick = (customer: Customer) => {
    if (customer._id && can('customer', 'update')) {
      router.push(`/master/customer/${customer._id}`);
    }
  };

  const handleDelete = async (id: string) => {
    // Show confirmation toast
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-800">
          Are you sure you want to delete this customer?
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
              const loadingToast = toast.loading('Deleting customer...');
              try {
                const response = await deleteCustomer(id);
                toast.dismiss(loadingToast);
                if (response.success) {
                  toast.success(
                    response.message || 'Customer deleted successfully!'
                  );
                  fetchAllCustomers(); // Re-fetch data to update the list
                } else {
                  toast.error(response.message || 'Failed to delete customer.');
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

  const columns: Column<Customer>[] = useMemo(() => {
    const baseColumns: Column<Customer>[] = [
      { accessor: 'company', header: 'Company' },
      { accessor: 'mobile', header: 'Mobile' },
      { accessor: 'contactPersonName', header: 'Contact Person Name' },
      { accessor: 'contactPersonMobile', header: 'Contact Person Mobile' },
      {
        accessor: 'createdBy' as any,
        header: 'Created By',
        render: (customer: any) => {
          const creator = customer.createdBy;
          const name = typeof creator === 'object' ? creator?.name : creator;
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
        render: (customer) => (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              customer.status === 'active'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {customer.status}
          </span>
        ),
      },
    ];

    if (can('customer', 'update') || can('customer', 'delete')) {
      baseColumns.push({
        accessor: 'actions' as keyof Customer,
        header: 'Actions',
        render: (customer) => (
          <div className="flex items-center gap-2">
            {can('customer', 'view') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (customer._id) router.push(`/master/customer/${customer._id}`);
                }}
                className="w-9 h-9 flex items-center justify-center text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-all border border-gray-100 hover:border-sky-200"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {can('customer', 'update') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (customer._id) handleEdit(customer._id);
                }}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {can('customer', 'delete') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (customer._id) handleDelete(customer._id);
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
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Master Registry"
        title="Customer"
        highlight="Management"
        description="Maintain customer master records, contacts, and account status."
        actions={
          <>
          {can('customer', 'create') && (
            <button
              onClick={handleAddCustomer}
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
          <CustomerFilterBar
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
              placeholder="Search customers..."
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
              placeholder="Search customers..."
            />
          </div>
        </>
      )}

      {loading ? (
        <TableSkeleton /> // Replaced LoadingSpinner with TableSkeleton
      ) : (
        <DataTable
          columns={columns}
          data={allCustomers}
          onRowClick={handleRowClick}
          serverSidePagination={true}
          totalCount={totalCustomersCount}
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

export default withAuth(CustomerPage, [{ module: 'customer', action: 'view' }]);
