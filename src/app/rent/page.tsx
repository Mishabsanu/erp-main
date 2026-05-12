'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { getRentals, Rental } from '@/services/rentalApi';
import { Eye, Boxes, ArrowRightLeft, CheckCircle2, Clock, Filter, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { RentalFilterBar } from '@/components/rental/RentalFilterBar';

const RentalTrackingPage = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const fetchRentals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRentals(currentPage, limit, searchTerm, statusFilter);
      console.log('Rental Tracking: Received data from API', data);
      setRentals(data.content || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, statusFilter]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const columns: Column<Rental>[] = [
    { 
      accessor: 'orderNumber', 
      header: 'Order #',
      render: (rental) => (
        <div className="flex flex-col">
          <span className="font-bold text-teal-700">{rental.orderNumber}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {rental.orderedDate ? new Date(rental.orderedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </span>
        </div>
      )
    },
    { 
      accessor: 'companyName', 
      header: 'Company / Client',
      render: (rental) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 uppercase text-xs">{rental.companyName}</span>
          <span className="text-[10px] text-gray-500">{rental.clientName}</span>
        </div>
      )
    },
    {
      accessor: 'invoiceNumber' as any,
      header: 'Invoice / PO',
      render: (rental) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-700">{rental.invoiceNumber || '—'}</span>
          <span className="text-[10px] text-gray-400">{rental.poNumber || '—'}</span>
        </div>
      )
    },
    { 
      accessor: 'projectLocation', 
      header: 'Location',
      render: (rental) => <span className="text-xs text-gray-500 truncate max-w-[150px] block font-medium">{rental.projectLocation || '—'}</span>
    },
    { 
      accessor: 'status', 
      header: 'Status',
      render: (rental) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${
          rental.status === 'Closed' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
            : 'bg-amber-50 text-amber-700 border border-amber-100'
        }`}>
          {rental.status === 'Closed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {rental.status}
        </span>
      )
    },
    {
      accessor: 'itemStats' as any,
      header: 'Site Balance',
      render: (rental) => {
        const totalAtSite = rental.itemStats.reduce((sum, item) => sum + item.siteBalance, 0);
        return (
          <div className="flex flex-col gap-1">
            <span className={`font-bold ${totalAtSite > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
              {totalAtSite} Items at Site
            </span>
            <div className="flex gap-2">
               {rental.itemStats.slice(0, 2).map((item, i) => (
                 <span key={i} className="text-[10px] bg-gray-100 px-1.5 rounded text-gray-500">
                   {item.name}: {item.siteBalance}
                 </span>
               ))}
               {rental.itemStats.length > 2 && <span className="text-[10px] text-gray-400">+{rental.itemStats.length - 2} more</span>}
            </div>
          </div>
        );
      }
    },
    {
      accessor: '_id' as any,
      header: 'Actions',
      render: (rental) => (
        <button
          onClick={() => router.push(`/rent/${rental._id}`)}
          className="w-9 h-9 flex items-center justify-center text-teal-600 hover:bg-teal-50 rounded-lg border border-teal-100 transition-all"
          title="View Lifecycle"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 p-6 md:p-10">
      <ListPageHeader
        eyebrow="Asset Tracking"
        title="Rental"
        highlight="Inventory"
        description="Monitor hire items across all client sites. Track dispatched vs. returned balances in real-time."
        actions={
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              showFilters 
                ? 'bg-teal-700 text-white shadow-lg' 
                : 'bg-white text-teal-700 border border-teal-100 hover:bg-teal-50'
            }`}
          >
            <Filter size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        }
      />

      {showFilters && (
        <RentalFilterBar 
          onStatusChange={setStatusFilter}
          onClearFilters={() => setStatusFilter(undefined)}
          initialStatus={statusFilter}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Active Rentals</p>
            <p className="text-2xl font-bold text-gray-900">{rentals.filter(r => r.status === 'Active').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Returns</p>
            <p className="text-2xl font-bold text-gray-900">
              {rentals.reduce((sum, r) => sum + r.itemStats.reduce((s, i) => s + i.siteBalance, 0), 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Fully Recovered</p>
            <p className="text-2xl font-bold text-gray-900">{rentals.filter(r => r.status === 'Closed').length}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <SearchInput
          initialSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by Order #, Client or Location..."
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={rentals}
          serverSidePagination={true}
          totalCount={totalCount}
          currentPage={currentPage}
          limit={limit}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
          onRowClick={(rental) => router.push(`/rent/${rental._id}`)}
        />
      )}
    </div>
  );
};

export default withAuth(RentalTrackingPage, [{ module: 'rental_tracking', action: 'view' }]);
