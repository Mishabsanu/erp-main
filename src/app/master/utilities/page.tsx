'use client';

import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { useAuth } from '@/contexts/AuthContext';
import { getUtilityItems, deleteUtilityItem, UtilityItem } from '@/services/utilityItemApi';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  AlertTriangle,
  Layers,
  DollarSign,
  Tag,
  X
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import { UtilityFilterBar } from '@/components/master/UtilityFilterBar';

const UtilityMasterPage = () => {
  const [items, setItems] = useState<UtilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { can } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUtilityItems({ 
        category: selectedCategory,
        search: searchTerm 
      });
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to synchronize stock ledger');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (id: string) => {
    toast.warning('Abort this item? It will be removed from operational visibility.', {
      action: {
        label: 'Remove',
        onClick: async () => {
          try {
            await deleteUtilityItem(id);
            toast.success('Asset deactivated');
            fetchItems();
          } catch (error) {
            toast.error('Deactivation failed');
          }
        }
      }
    });
  };

  const columns: Column<UtilityItem>[] = useMemo(() => [
    {
      accessor: 'name',
      header: 'Industrial Asset',
      render: (item) => (
        <div className="flex items-center gap-4 py-2">
          <div className="w-12 h-12 bg-emerald-50 rounded-[1.25rem] flex items-center justify-center text-[#0f766e] border border-emerald-100 shadow-sm transition-transform hover:rotate-6">
             <Package size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-black text-[#0f172a] text-[15px] tracking-tight leading-none mb-1.5">{item.name}</div>
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2 opacity-70">
              <span className="text-[#0f766e]">{item.sku || 'NO-SKU'}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>{item.category}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      accessor: 'size',
      header: 'Spec / Size',
      render: (item) => (
        <div className="flex items-center gap-2">
           <Tag size={12} className="text-gray-400" />
           <span className="text-xs font-black text-gray-600 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">{item.size}</span>
        </div>
      )
    },
    {
      accessor: 'rate',
      header: 'Internal Rate',
      render: (item) => (
        <div className="flex items-baseline gap-1">
           <span className="text-[10px] font-black text-gray-400 uppercase">QAR</span>
           <span className="text-lg font-black text-[#0f172a] tabular-nums">{item.rate.toLocaleString()}</span>
        </div>
      )
    },
    {
      accessor: 'quantity',
      header: 'In-Store Volume',
      render: (item) => {
        const isLow = item.quantity <= item.minStockLevel;
        return (
          <div className="flex flex-col">
             <div className="flex items-center gap-2">
                <span className={`text-xl font-black tabular-nums ${isLow ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {item.quantity}
                </span>
                {isLow && (
                  <div className="w-5 h-5 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center animate-pulse">
                     <AlertTriangle size={12} />
                  </div>
                )}
             </div>
             <div className="flex items-center gap-1 mt-1">
                <div className={`h-1 rounded-full ${isLow ? 'bg-rose-500 w-1/4' : 'bg-emerald-500 w-full'}`} />
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Availability Node</span>
             </div>
          </div>
        );
      }
    },
    {
      accessor: '_id' as any,
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2 justify-end">
          {can('utility', 'update') && (
            <button
               onClick={() => router.push(`/master/utilities/edit/${item._id}`)}
               className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-xl border border-slate-100 transition-all active:scale-95 shadow-sm"
            >
              <Edit2 size={16} />
            </button>
          )}
          {can('utility', 'delete') && (
            <button
               onClick={() => handleDelete(item._id!)}
               className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-100 transition-all active:scale-95 shadow-sm"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ], [can, router]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Asset Management"
        title="Utility &"
        highlight="Safety Ledger"
        description="Master inventory tracking for personnel PPE, uniforms, and industrial equipment."
        actions={
          <>
             <button onClick={() => router.push('/master/utilities/add')} className="page-header-button">
               <Plus size={16} /> Add Gear Asset
             </button>
             <button
               onClick={() => setShowFilters(!showFilters)}
               className="page-header-button secondary"
             >
               <Filter size={16} />
               {showFilters ? 'Hide' : 'Filter'}
             </button>
          </>
        }
      />

      <div className="mt-8">
        {showFilters && (
          <UtilityFilterBar 
            onCategoryChange={(cat) => setSelectedCategory(cat || '')}
            onClearFilters={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
            initialCategory={selectedCategory}
          />
        )}

        <div className="mb-6">
          <SearchInput
            initialSearchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search items by name or SKU..."
          />
        </div>

        {loading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            serverSidePagination={false}
          />
        )}
      </div>
    </div>
  );
};

export default withAuth(UtilityMasterPage, [{ module: 'utility', action: 'view' }]);
