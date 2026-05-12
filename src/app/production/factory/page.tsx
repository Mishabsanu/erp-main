'use client';

import React, { useState, useEffect } from 'react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { Column, DataTable } from '@/components/shared/DataTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { Plus, Edit3, Trash2, Building2, Package, Hash, Image as ImageIcon, Eye } from 'lucide-react';
import { getProductions, createProduction, updateProduction, deleteProduction } from '@/services/productionApi';
import FactoryForm from '@/components/FactoryForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { format } from 'date-fns';
import { confirmDelete } from '@/utils/confirm';

function FactoryPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getProductions(page, limit, searchTerm);
      setData(result.productions);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error('Failed to load production logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, searchTerm]);

  const handleCreate = () => {
    router.push('/production/factory/add');
  };

  const handleView = (item: any) => {
    router.push(`/production/factory/view/${item._id}`);
  };

  const handleEdit = (item: any) => {
    router.push(`/production/factory/edit/${item._id}`);
  };


  const handleDelete = (id: string) => {
    confirmDelete(
      async () => {
        try {
          await deleteProduction(id);
          toast.success('Record deleted successfully');
          fetchData();
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to delete record';
          toast.error(message);
        }
      },
      {
        title: "Delete Production Log?",
        description: "This will remove the production record and cannot be undone."
      }
    );
  };



  const columns: Column<any>[] = [
    {
      accessor: 'productId',
      header: 'Catalog Item',
      render: (row) => (
        <div className="flex items-center gap-4 py-2">
          <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-[#b45309] border border-amber-100 shadow-sm transition-transform hover:scale-110">
            <Package size={20} />
          </div>
          <div>
            <div className="font-black text-[#0f172a] text-[15px] tracking-tight leading-none mb-1.5">{row.productId?.name || 'Unknown Item'}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2 opacity-70">
              <span className="text-[#b45309]">{row.productId?.itemCode || 'CODE-N/A'}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      accessor: 'batchNumber',
      header: 'Cycle Metadata',
      render: (row) => (
        <div className="flex flex-col">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gray-50 text-gray-600 text-[10px] font-black w-fit mb-2 border border-gray-100 shadow-sm">
            <Hash size={12} className="text-[#b45309]" /> {row.batchNumber}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-[#b45309] rounded-full opacity-40" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{row.shift} OPERATIONAL</span>
          </div>
        </div>
      )
    },
    {
      accessor: 'quantity',
      header: 'Net Volume',
      render: (row) => (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#0f172a] tracking-tighter tabular-nums">{row.quantity}</span>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{row.productId?.unit}</span>
          </div>
          <div className="w-8 h-1 bg-amber-500/20 rounded-full mt-1" />
        </div>
      )
    },
    {
      accessor: 'manufacturingDate',
      header: 'Created Date',
      render: (row) => (
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-[#0f172a] tracking-tight">{row.manufacturingDate ? format(new Date(row.manufacturingDate), 'PPP') : 'N/A'}</span>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Operational Sync</span>
        </div>
      )
    },
    {
      accessor: 'createdBy',
      header: 'Created By',
      render: (row) => (
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-[#0f172a] tracking-tight">{row.createdBy?.name || 'N/A'}</span>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Operational Sync</span>
        </div>
      )
    },
    {
      accessor: 'status',
      header: 'Review Status',
      render: (row) => (
        <div className="flex flex-col items-center">
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
            row.status === 'approved' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
            {row.status}
          </span>
          <span className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter mt-1">Quality Check</span>
        </div>
      )
    },
    {
      accessor: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleView(row)}
            className="w-9 h-9 flex items-center justify-center text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-all border border-gray-100 hover:border-sky-200"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
            title="Edit Record"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="w-9 h-9 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-100 hover:border-red-200"
            title="Delete Record"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-2 md:p-4">
      <ListPageHeader
        eyebrow="Operational Node"
        title="Production"
        highlight="Terminal"
        description="Real-time telemetry and ledger for manufacturing output and quality metrics."
        actions={
          <button
            onClick={handleCreate}
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
          placeholder="Search items by batch number or metadata..."
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          totalCount={totalCount}
          currentPage={page}
          limit={limit}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={setLimit}
          serverSidePagination={true}
        />
      )}
    </div>
  );
}

export default withAuth(FactoryPage, [{ module: 'production', action: 'view' }]);
