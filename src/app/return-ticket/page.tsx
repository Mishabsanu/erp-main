'use client';

import { ReturnTicketFilterBar } from '@/components/return-ticket/ReturnTicketFilterBar';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput'; // Import SearchInput
import { TableSkeleton } from '@/components/shared/TableSkeleton'; // Import TableSkeleton
import { useAuth } from '@/contexts/AuthContext';
import { ReturnTicket, ReturnTicketFilter } from '@/lib/types';
import {
  deleteReturnTicket,
  getReturnTickets,
} from '@/services/returnTicketApi';
import {
  Edit2,
  Eye,
  Filter,
  Plus,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const ReturnTicketPage = () => {
  // Rename component
  const [returnTickets, setReturnTickets] = useState<ReturnTicket[]>([]); // State for return tickets
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false); // New state for filter visibility

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<ReturnTicketFilter['status']>(undefined);
  const [startDateFilter, setStartDateFilter] = useState<string | undefined>(
    undefined
  );
  const [endDateFilter, setEndDateFilter] = useState<string | undefined>(
    undefined
  );
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalTicketsCount, setTotalTicketsCount] = useState(0);
  const [totalTicketsPages, setTotalTicketsPages] = useState(1);

  const router = useRouter();
  const { can } = useAuth();
  const toggleActionMenu = (id: string) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const fetchReturnTickets = useCallback(async () => {
    // Rename fetch function
    setLoading(true);
    try {
      const filterParams: ReturnTicketFilter = {
        search: searchTerm || undefined,
        status: statusFilter,
        startDate: startDateFilter,
        endDate: endDateFilter,
        category: categoryFilter,
      };

      const response = await getReturnTickets(filterParams, currentPage, limit); // Use ReturnTicket API
      const {
        returnTickets: fetchedTickets, // Get returnTickets from response
        totalPages: fetchedTotalPages,
        totalCount: fetchedTotalCount,
      } = response;

      setReturnTickets(fetchedTickets || []);
      setTotalTicketsPages(fetchedTotalPages || 1);
      setTotalTicketsCount(fetchedTotalCount || 0);
    } catch (error) {
      console.error('Failed to fetch return tickets:', error);
      toast.error('Failed to load return tickets.');
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    statusFilter,
    startDateFilter,
    endDateFilter,
    categoryFilter,
    currentPage,
    limit,
  ]);

  useEffect(() => {
    fetchReturnTickets();
  }, [fetchReturnTickets]);

  const handleDelete = async (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-800">
          Are you sure you want to delete this return ticket?
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss(t);
              toast.info('Return ticket deletion cancelled.', {
                duration: 2000,
              });
            }}
            className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t);
              const loadingId = toast.loading('Deleting return ticket...');
              try {
                const response = await deleteReturnTicket(id); // Use ReturnTicket API
                toast.dismiss(loadingId);
                if (response.success) {
                  toast.success(
                    response.message || 'Return ticket deleted successfully!'
                  );
                  fetchReturnTickets(); // Re-fetch data
                } else {
                  toast.error(
                    response.message || 'Failed to delete return ticket.'
                  );
                }
              } catch (error: any) {
                toast.dismiss(loadingId);
                toast.error(
                  error.response?.data?.message ||
                  'Something went wrong while deleting return ticket.'
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

  const handleAdd = () => router.push('/return-ticket/add'); // Update path
  const handleEdit = (id: string) => router.push(`/return-ticket/edit/${id}`); // Update path
  const handleRowClick = (ticket: ReturnTicket) => {
    if (ticket._id && can('return_ticket', 'update')) {
      router.push(`/return-ticket/${ticket._id}`);
    }
  };

  const columns: Column<ReturnTicket>[] = useMemo(() => {
    const baseColumns: Column<ReturnTicket>[] = [
      { accessor: 'ticketNo', header: 'RN #' },
      { accessor: 'customerName', header: 'Company' },

      {
        accessor: 'invoiceNo' as any,
        header: 'Invoice / PO',
        render: (ticket) => (
          <div className="flex flex-col">
            <span className="text-xs font-black text-[#0f766e] uppercase tracking-widest">{ticket.invoiceNo || '---'}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{ticket.poNo || '---'}</span>
          </div>
        )
      },
      { accessor: 'noteCategory', header: 'Category' },
      {
        accessor: 'deliveredBy' as any,
        header: 'Delivered By',
        render: (ticket) => ticket.deliveredBy?.deliveredByName || '—'
      },
      {
        accessor: 'returnDate',
        header: 'Return Date',
        render: (ticket) => (
          <span>{new Date(ticket.returnDate).toLocaleDateString()}</span>
        ),
      },
      {
        accessor: 'items' as any,
        header: 'Items',
        render: (ticket) => (
          <span className="font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">
            {ticket.items?.length || 0} {ticket.items?.length === 1 ? 'Item' : 'Items'}
          </span>
        ),
      },
      {
        accessor: 'createdBy' as any,
        header: 'Created By',
        render: (ticket: ReturnTicket) => (
          <span className="text-sm font-medium text-gray-600">
            {typeof ticket.createdBy === 'object' ? (ticket.createdBy as any).name : (ticket.createdBy || '--')}
          </span>
        ),
      },

    ];

    if (can('return_ticket', 'update') || can('return_ticket', 'delete')) {
      baseColumns.push({
        accessor: 'actions' as any,
        header: 'Actions',
        render: (ticket) => (
          <div className="flex items-center gap-2">
       
            {can('return_ticket', 'update') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (ticket._id) handleEdit(ticket._id);
                }}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {can('return_ticket', 'delete') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (ticket._id) handleDelete(ticket._id);
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
        eyebrow="Return Registry"
        title="Return"
        highlight="Tickets"
        description="Manage returned goods, quantities, and reverse logistics records."
        actions={
          <>
          {can('return_ticket', 'create') && (
            <button
              onClick={handleAdd}
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
            {showFilters ? 'Hide' : 'Filter'}
          </button>
          </>
        }
      />

      {showFilters ? (
        <>
          {/* Filters */}
          <ReturnTicketFilterBar
            onStatusChange={setStatusFilter}
            onStartDateChange={setStartDateFilter}
            onEndDateChange={setEndDateFilter}
            onCategoryChange={setCategoryFilter}
            onClearFilters={() => {
              setSearchTerm('');
              setStatusFilter(undefined);
              setStartDateFilter(undefined);
              setEndDateFilter(undefined);
              setCategoryFilter(undefined);
              setCurrentPage(1); // Reset page on clear
            }}
            initialStatus={statusFilter}
            initialStartDate={startDateFilter}
            initialEndDate={endDateFilter}
            initialCategory={categoryFilter}
          />
          {/* Search Input */}
          <div className="mb-6">
            <SearchInput
              initialSearchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search return tickets..."
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
              placeholder="Search return tickets..."
            />
          </div>
        </>
      )}

      {/* Return Tickets Display */}
      {loading ? (
        <TableSkeleton /> // Replaced LoadingSpinner with TableSkeleton
      ) : (
        <DataTable
          columns={columns}
          data={returnTickets}
          onRowClick={handleRowClick}
          serverSidePagination={true}
          totalCount={totalTicketsCount}
          currentPage={currentPage}
          limit={limit}
          totalPages={totalTicketsPages}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
        />
      )}
    </div>
  );
};

export default withAuth(ReturnTicketPage, [{ module: 'return_ticket', action: 'view' }]);
