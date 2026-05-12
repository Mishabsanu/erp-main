'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, MoreVertical, Edit2, Trash2, Filter } from 'lucide-react';

import withAuth from '@/components/withAuth';
import { updateQuoteStatus } from '@/services/catalogApi';
import { deleteQuoteTrack, getQuoteTracks } from '@/services/quoteApi';
import { QuoteTrack, QuoteTrackFilter } from '@/lib/types';
import { useDebounce } from '@/hooks/useDebounce';

import { DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { QuoteTrackFilterBar } from '@/components/quote-track/QuoteTrackFilterBar';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { useAuth } from '@/contexts/AuthContext';

const QuoteTracksPage: React.FC = () => {
  const router = useRouter();
  const { can } = useAuth();
  const [quoteTracks, setQuoteTracks] = useState<QuoteTrack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchTerm = useDebounce(searchQuery, 500);

  const [filter, setFilter] = useState<QuoteTrackFilter>({
    search: '',
    status: undefined,
    currency: undefined,
  });

  const fetchQuoteTracks = useCallback(async () => {
    setLoading(true);
    try {
      const {
        quoteTracks: fetchedQuoteTracks,
        totalPages: fetchedTotalPages,
        totalCount: fetchedTotalCount,
        limit: fetchedLimit,
      } = await getQuoteTracks(
        { ...filter, search: debouncedSearchTerm },
        currentPage,
        limit
      );

      setQuoteTracks(fetchedQuoteTracks ?? []);
      setTotalPages(fetchedTotalPages ?? 1);
      setTotalCount(fetchedTotalCount ?? 0);
      setLimit(fetchedLimit ?? limit);
    } catch (err) {
      console.error('Fetch quotes error', err);
      toast.error('Failed to load quote tracks');
      setQuoteTracks([]);
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchQuoteTracks();
  }, [fetchQuoteTracks]);

  const handleDelete = async (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-800">
          Are you sure you want to delete this quote track?
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
              const loadingId = toast.loading('Deleting quote track...');
              try {
                const response = await deleteQuoteTrack(id);
                toast.dismiss(loadingId);
                if (response.success) {
                  toast.success(response.message || 'Quote track deleted successfully!');
                  fetchQuoteTracks();
                } else {
                  toast.error(response.message || 'Failed to delete quote track.');
                }
              } catch (error: any) {
                toast.dismiss(loadingId);
                toast.error(error.response?.data?.message || 'Something went wrong while deleting.');
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

  const columns = useMemo(() => {
    const baseColumns = [
    {
      header: 'Quote ID',
      accessor: 'quoteNo' as keyof QuoteTrack,
      render: (track: QuoteTrack) => <span className="font-bold text-[#0f766e] uppercase tracking-wider">{track.quoteNo}</span>
    },
    {
      header: 'Date',
      accessor: 'createdAt' as keyof QuoteTrack,
      render: (track: QuoteTrack) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#0f766e]">
            {track.createdAt ? new Date(track.createdAt).toLocaleDateString() : 'N/A'}
          </span>
          <span className="text-[9px] text-gray-400 font-bold uppercase">Logged At</span>
        </div>
      )
    },
    {
      header: 'Client / Company',
      accessor: 'clientName' as keyof QuoteTrack,
      render: (track: QuoteTrack) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-800">{track.clientName}</span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
            {track.companyName || 'No Company'}
          </span>
        </div>
      )
    },
    {
      header: 'Quote Specs',
      accessor: 'totalQty' as keyof QuoteTrack,
      render: (track: QuoteTrack) => (
        <div className="flex flex-col text-center">
          <span className="text-gray-700 font-bold">{track.totalQty} Units</span>
          <span className="text-[10px] text-teal-700 font-black uppercase tracking-widest">
            {track.totalWeight?.toFixed(2)} KG
          </span>
        </div>
      )
    },
    {
      header: 'Financials',
      accessor: 'totalSellingPrice' as keyof QuoteTrack,
      render: (track: QuoteTrack) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#0f766e]">
            {track.currency === 'USD' ? '$' : '₹'}{track.totalSellingPrice?.toLocaleString()}
          </span>
          <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">
            Margin: {track.currency === 'USD' ? '$' : '₹'}{track.totalGrossMargin?.toLocaleString()}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as keyof QuoteTrack,
      render: (track: QuoteTrack) => (
        <select
          value={track.status}
          onClick={(e) => e.stopPropagation()}
          disabled={!can('quote_track', 'update')}
          onChange={async (e) => {
            const newStatus = e.target.value;
            const loadingId = toast.loading('Updating status...');
            try {
              await updateQuoteStatus(track._id!, newStatus);
              setQuoteTracks(prev => prev.map(t => t._id === track._id ? { ...t, status: newStatus as any } : t));
              toast.success('Status updated!');
            } catch {
              toast.error('Failed to update status');
            } finally {
              toast.dismiss(loadingId);
            }
          }}
          className={`px-3 py-1 rounded-lg text-xs font-bold border bg-white transition-colors ${!can('quote_track', 'update') ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'} ${track.status === 'Accepted' ? 'border-green-200 text-green-700 bg-green-50' :
              track.status === 'Rejected' ? 'border-teal-200 text-teal-800 bg-teal-50' :
                track.status === 'Quoted' ? 'border-sky-200 text-sky-700 bg-sky-50' :
                  'border-gray-200 text-gray-700 bg-gray-50'
            }`}
        >
          <option value="Pending">Pending</option>
          <option value="Quoted">Quoted</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      )
    },
    {
      accessor: 'createdBy' as any,
      header: 'Created By',
      render: (track: QuoteTrack) => (
        <span className="text-sm font-medium text-gray-600">
          {typeof track.createdBy === 'object' ? (track.createdBy as any).name : (track.createdBy || '--')}
        </span>
      ),
    },
    {
      accessor: 'createdAt',
      header: 'Date Created',
      render: (track: QuoteTrack) => (
        <span className="text-sm font-medium text-gray-600">
          {track.createdAt ? new Date(track.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id' as keyof QuoteTrack,
      render: (track: QuoteTrack) => (
        <div className="flex items-center gap-2">
          {can('quote_track', 'update') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (track._id) router.push(`/quote-track/edit/${track._id}`);
              }}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {can('quote_track', 'delete') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (track._id) handleDelete(track._id);
              }}
              className="w-9 h-9 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-100 hover:border-red-200"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    }
    ];
    return baseColumns;
  }, [openMenu, can, handleDelete]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="CRM Pipeline"
        title="Quote"
        highlight="Tracking"
        description="Monitor quote progress, currency, value, and approval movement."
        actions={
          <>
            {can('quote_track', 'create') && (
              <button
                onClick={() => router.push('/quote-track/add')}
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

      {/* Persistent Filters Section */}
      <div className={showFilters ? 'block mb-6' : 'hidden'}>
        <QuoteTrackFilterBar
          onStatusChange={useCallback((status) => { setFilter(prev => ({ ...prev, status })); setCurrentPage(1); }, [])}
          onCurrencyChange={useCallback((currency) => { setFilter(prev => ({ ...prev, currency })); setCurrentPage(1); }, [])}
          onClearFilters={useCallback(() => {
            setFilter({ search: '', status: undefined, currency: undefined });
            setSearchQuery('');
            setCurrentPage(1);
          }, [])}
          initialStatus={filter.status}
          initialCurrency={filter.currency}
        />
      </div>

      {/* Persistent Search Input */}
      <div className="mb-6">
        <SearchInput
          placeholder="Search quote tracks..."
          initialSearchTerm={searchQuery}
          onSearchChange={useCallback((val: string) => setSearchQuery(val), [])}
        />
      </div>

      {/* Main Table Area */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns as any}
          data={quoteTracks}
          serverSidePagination={true}
          totalCount={totalCount}
          currentPage={currentPage}
          limit={limit}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
          totalPages={totalPages}
          onRowClick={(track) => {
            if (can('quote_track', 'update')) {
              router.push(`/quote-track/${track._id}`);
            }
          }}
        />
      )}
    </div>
  );
};

export default withAuth(QuoteTracksPage, [{ module: 'quote_track', action: 'view' }]);
