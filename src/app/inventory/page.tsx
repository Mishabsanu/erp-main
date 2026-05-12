'use client';

import { InventoryFilterBar } from '@/components/inventory/InventoryFilterBar'; // Use InventoryFilterBar
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput'; // Import SearchInput
import { TableSkeleton } from '@/components/shared/TableSkeleton'; // Import TableSkeleton
import { useAuth } from '@/contexts/AuthContext';
import { InventoryFilter, InventoryItem } from '@/lib/types'; // Use InventoryItem type
import {
  deleteInventoryItem, // Use Inventory API
  getInventoryItems, // Use Inventory API
} from '@/services/inventoryApi';
import {
  Download,
  Edit2,
  Filter,
  MoreVertical,
  Plus,
  Printer,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import { exportToCSV } from '@/lib/exportUtils';
import { getProductions, approveProduction } from '@/services/productionApi';
import { CheckCircle, Clock } from 'lucide-react';

const InventoryPage = () => {
  // Rename component
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]); // State for inventory items
  const [pendingProductions, setPendingProductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stock' | 'pending'>('stock');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false); // New state for filter visibility

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<InventoryFilter['status']>(undefined);
  const [vendorFilter, setVendorFilter] = useState<string | undefined>(undefined); // New state
  const [minStock, setMinStock] = useState<number | undefined>(undefined);
  const [maxStock, setMaxStock] = useState<number | undefined>(undefined);
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalInventoryCount, setTotalInventoryCount] = useState(0);
  const [totalInventoryPages, setTotalInventoryPages] = useState(1);

  const router = useRouter();
  const { can } = useAuth();
  const toggleActionMenu = (id: string) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'stock') {
        const filterParams: InventoryFilter = {
          search: searchTerm || undefined,
          status: statusFilter,
          vendor: vendorFilter, // Pass vendor filter
          minStock,
          maxStock,
          onlyLowStock: onlyLowStock ? 'true' : undefined,
        } as any;

        const response = await getInventoryItems(
          filterParams,
          currentPage,
          limit
        );

        setInventoryItems(response.inventoryItems || []);
        setTotalInventoryPages(response.totalPages || 1);
        setTotalInventoryCount(response.totalCount || 0);
      } else {
        const response = await getProductions(currentPage, limit, searchTerm, 'pending');
        setPendingProductions(response.productions || []);
        setTotalInventoryPages(response.totalPages || 1);
        setTotalInventoryCount(response.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load records.');
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    searchTerm,
    statusFilter,
    vendorFilter,
    minStock,
    maxStock,
    onlyLowStock,
    currentPage,
    limit,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-800">
          Are you sure you want to delete this inventory item?
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss(t);
              toast.info('Inventory item deletion cancelled.', {
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
              const loadingId = toast.loading('Deleting inventory item...');
              try {
                const response = await deleteInventoryItem(id); // Use Inventory API
                toast.dismiss(loadingId);
                if (response.success) {
                  toast.success(
                    response.message || 'Inventory item deleted successfully!'
                  );
                  fetchData(); // Re-fetch data
                } else {
                  toast.error(
                    response.message || 'Failed to delete inventory item.'
                  );
                }
              } catch (error: any) {
                toast.dismiss(loadingId);
                toast.error(
                  error.response?.data?.message ||
                  'Something went wrong while deleting inventory item.'
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

  const handleAdd = () => router.push('/inventory/add'); // Update path
  const handleEdit = (id: string) => router.push(`/inventory/edit/${id}`); // Update path
  const handleRowClick = (item: InventoryItem) => {
    if (item._id && can('inventory', 'update')) {
      router.push(`/inventory/${item._id}`);
    }
  };

  const handleExport = () => {
    const exportData = inventoryItems.map(item => ({
      'PO Number': item.poNo,
      'Product': item.product?.name || 'N/A',
      'Item Code': item.itemCode,
      'Ordered Qty': item.orderedQty,
      'Available Qty': item.availableQty,
      'Status': item.status,
      'Created By': typeof item.createdBy === 'object' ? item.createdBy.name : item.createdBy || 'N/A',
      'Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
    }));
    exportToCSV(exportData, `inventory_stock_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Inventory data exported to CSV');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleApprove = async (id: string) => {
    try {
      const loadingId = toast.loading('Authorizing production report and updating stock...');
      const response = await approveProduction(id);
      toast.dismiss(loadingId);
      if (response.success) {
        toast.success(response.message || 'Production report approved and inventory updated!');
        fetchData();
      } else {
        toast.error(response.message || 'Approval failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong during approval');
    }
  };

  const columns: Column<InventoryItem>[] = useMemo(() => {
    const baseColumns: Column<InventoryItem>[] = [
      {
        accessor: '_id',
        header: 'Inventory Add No',
        render: (item) => (
          <span className="text-[10px] font-bold text-gray-400 font-mono uppercase">
            INV-{item._id?.toString().slice(-5) || '---'}
          </span>
        ),
      },
      {
        accessor: 'product',
        header: 'Product Name',
        render: (item) => <span className="font-bold text-gray-950">{item.product?.name || '—'}</span>,
      },
      {
        accessor: 'itemCode',
        header: 'Item Code',
        render: (item) => <span className="font-bold text-[#0f766e] uppercase tracking-widest">{item.itemCode}</span>
      },
      {
        accessor: 'vendor' as any,
        header: 'Supplier/Vendor',
        render: (item) => <span className="font-medium text-slate-500">{typeof item.vendor === 'object' ? item.vendor?.company : (item.vendor || '---')}</span>
      },
      {
        accessor: 'availableQty',
        header: 'Available Qty',
        render: (item) => {
          const isLow = item.product?.reorderLevel !== undefined && item.availableQty <= item.product.reorderLevel;
          return (
            <span className={`font-bold ${isLow ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100' : ''}`}>
              {item.availableQty.toLocaleString()}
              {isLow && <span className="ml-1 text-[8px] uppercase tracking-tighter">(Low)</span>}
            </span>
          );
        },
      },
      {
        accessor: 'totalSold' as any,
        header: 'Total Sold',
        render: (item) => <span className="font-medium text-gray-600">{item.totalSold?.toLocaleString() || 0}</span>,
      },
      {
        accessor: 'status',
        header: 'Status',
        render: (item) => {
          return (
            <span
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg ${item.status === 'IN_STOCK' ? 'bg-[#0f766e] text-white' : item.status === 'LOW_STOCK' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
                }`}
            >
              {item.status.replaceAll('_', ' ')}
            </span>
          );
        },
      },
    ];

    if (can('inventory', 'update') || can('inventory', 'delete')) {
      baseColumns.push({
        accessor: 'actions' as keyof InventoryItem,
        header: 'Actions',
        render: (item) => (
          <div className="flex items-center gap-2">
            {can('inventory', 'update') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (item._id) handleEdit(item._id);
                }}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {can('inventory', 'delete') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (item._id) handleDelete(item._id);
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
  }, [openMenu, can, currentPage, limit]);

  const pendingColumns: Column<any>[] = useMemo(() => [
    {
      accessor: '_id',
      header: 'Inventory Add No',
      render: (item) => (
        <span className="text-[10px] font-bold text-gray-400 font-mono uppercase">
          INV-{item._id?.toString().slice(-5) || '---'}
        </span>
      ),
    },
    {
      accessor: 'batchNumber',
      header: 'Batch Number',
      render: (item) => <span className="font-bold text-teal-700 tracking-wider">#{item.batchNumber}</span>
    },
    {
      accessor: 'productId',
      header: 'Product',
      render: (item) => <span className="font-black text-gray-800 tracking-tight">{item.productId?.name || '—'}</span>
    },
    {
      accessor: 'quantity',
      header: 'Output Qty',
      render: (item) => <span className="font-black text-emerald-600">+{item.quantity}</span>
    },
    {
      accessor: 'manufacturingDate',
      header: 'Manufactured On',
      render: (item) => <span className="text-xs font-bold text-gray-500 italic">{new Date(item.manufacturingDate).toLocaleDateString()}</span>
    },
    {
      accessor: 'actions',
      header: 'Decision',
      render: (item) => (
        <button
          onClick={() => handleApprove(item._id)}
          className="bg-teal-50 text-teal-700 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 hover:text-white transition-all shadow-sm border border-teal-100 flex items-center gap-2"
        >
          <CheckCircle size={14} />
          Approve
        </button>
      )
    }
  ], [currentPage, limit]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-2 md:p-4">
      <ListPageHeader
        eyebrow="Logistics"
        title="Inventory"
        highlight="Status"
        description="Monitor stock status, item movement, and available quantities."
        actions={
          <>
            {can('inventory', 'create') && (
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
            <button
              onClick={handleExport}
              className="page-header-button secondary !bg-emerald-50 !text-emerald-700 !border-emerald-100 hover:!bg-emerald-100"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handlePrint}
              className="page-header-button secondary !bg-blue-50 !text-blue-700 !border-blue-100 hover:!bg-blue-100"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-10 overflow-x-auto no-scrollbar p-1">
        <button
          onClick={() => { setActiveTab('stock'); setCurrentPage(1); }}
          className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${
            activeTab === 'stock' 
            ? 'bg-[#0f766e] text-white shadow-lg shadow-teal-900/20 translate-y-[-2px]' 
            : 'text-slate-400 hover:text-[#0f766e] hover:bg-teal-50/50'
          }`}
        >
          Available Stock
        </button>
        <button
          onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
          className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-3 ${
            activeTab === 'pending' 
            ? 'bg-[#0f766e] text-white shadow-lg shadow-teal-900/20 translate-y-[-2px]' 
            : 'text-slate-400 hover:text-[#0f766e] hover:bg-teal-50/50'
          }`}
        >
          Pending Approval
          {pendingProductions.length > 0 && (
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${
              activeTab === 'pending' ? 'bg-white text-[#0f766e]' : 'bg-rose-500 text-white animate-pulse'
            }`}>
              {pendingProductions.length}
            </span>
          )}
        </button>
      </div>

      {/* Universal Search Input */}
      <div className="mb-6">
        <SearchInput
          initialSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by Product, ID, Code or Vendor..."
        />
      </div>

      {activeTab === 'stock' && (
        <>
          {showFilters && (
            <>
              {/* Filters */}
              <InventoryFilterBar
                onStatusChange={setStatusFilter}
                onVendorChange={setVendorFilter}
                onStockRangeChange={(min, max) => {
                  setMinStock(min);
                  setMaxStock(max);
                  setCurrentPage(1); // reset pagination
                }}
                onLowStockToggle={(val) => {
                  setOnlyLowStock(val);
                  setCurrentPage(1);
                }}
                onClearFilters={() => {
                  setSearchTerm('');
                  setStatusFilter(undefined);
                  setVendorFilter(undefined);
                  setMinStock(undefined);
                  setMaxStock(undefined);
                  setOnlyLowStock(false);
                  setCurrentPage(1);
                }}
                initialStatus={statusFilter}
              />
            </>
          )}

          {loading ? (
            <TableSkeleton />
          ) : (
            <DataTable
              columns={columns}
              data={inventoryItems}
              onRowClick={handleRowClick}
              serverSidePagination={true}
              totalCount={totalInventoryCount}
              currentPage={currentPage}
              limit={limit}
              totalPages={totalInventoryPages}
              onPageChange={setCurrentPage}
              onLimitChange={setLimit}
            />
          )}
        </>
      )}

      {activeTab === 'pending' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       

          {loading ? (
            <TableSkeleton />
          ) : (
            <DataTable
              columns={pendingColumns}
              data={pendingProductions}
              serverSidePagination={true}
              totalCount={totalInventoryCount}
              currentPage={currentPage}
              limit={limit}
              totalPages={totalInventoryPages}
              onPageChange={setCurrentPage}
              onLimitChange={setLimit}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default withAuth(InventoryPage, [{ module: 'inventory', action: 'view' }]);
