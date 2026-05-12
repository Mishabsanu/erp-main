'use client';

import { ProductFilterBar } from '@/components/catalog/ProductFilterBar';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput'; // Import SearchInput
import { TableSkeleton } from '@/components/shared/TableSkeleton'; // Import TableSkeleton
import { useAuth } from '@/contexts/AuthContext';
import { Product, ProductFilter } from '@/lib/types';
import { deleteProduct, getCatalog } from '@/services/catalogApi';
import {
  Edit2,
  Filter,
  MoreVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import withAuth from '@/components/withAuth';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BulkImportModal } from '@/components/catalog/BulkImportModal';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

const CatalogPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false); // New state for filter visibility
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<ProductFilter['status']>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [totalPagesCount, setTotalPagesCount] = useState(1);

  const router = useRouter();
  const { can } = useAuth();
  const toggleActionMenu = (id: string) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams: ProductFilter = {
        search: searchTerm || undefined,
        status: statusFilter,
      };

      const response = await getCatalog(filterParams, currentPage, limit);
      const {
        products: fetchedProducts,
        totalPages: fetchedTotalPages,
        totalCount: fetchedTotalCount,
      } = response;

      setProducts(fetchedProducts || []);
      setTotalPagesCount(fetchedTotalPages || 1);
      setTotalProductsCount(fetchedTotalCount || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load product catalog.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    toast.custom(
      (t) => (
        <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-medium text-gray-800">
            Are you sure you want to delete this product?
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t);
                toast.info('Product deletion cancelled.', { duration: 2000 });
              }}
              className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t);
                const loadingId = toast.loading('Deleting product...');
                try {
                  const response = await deleteProduct(id);
                  toast.dismiss(loadingId);
                  if (response.success) {
                    toast.success(
                      response.message || 'Product deleted successfully!'
                    );
                    fetchProducts();
                  } else {
                    toast.error(
                      response.message || 'Failed to delete product.'
                    );
                  }
                } catch (error: any) {
                  toast.dismiss(loadingId);
                  toast.error(
                    error.response?.data?.message ||
                      'Something went wrong while deleting product.'
                  );
                }
              }}
              className="px-3 py-1 text-sm bg-teal-700 text-white rounded-md hover:bg-teal-800 transition"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      {
        id: 'delete-confirm',
        duration: Infinity,
        position: 'top-right',
      }
    );
  };

  const handleAdd = () => router.push('/master/catalog/add');
  const handleEdit = (id: string) => router.push(`/master/catalog/edit/${id}`);
  const handleRowClick = (product: Product) => {
    if (product._id && can('product', 'update')) {
      router.push(`/master/catalog/${product._id}`);
    }
  };

  const columns: Column<Product>[] = useMemo(() => {
    const baseColumns: Column<Product>[] = [
      { 
        accessor: 'name', 
        header: 'Name',
        render: (product) => <span className="font-bold text-gray-900">{product.name}</span>
      },
      { 
        accessor: 'itemCode', 
        header: 'Item Code',
        render: (product) => <span className="font-bold text-[#0f766e] tracking-wider uppercase">{product.itemCode}</span>
      },
      { accessor: 'unit', header: 'Unit' },
      { accessor: 'reorderLevel', header: 'Reorder Level' },
      {
        accessor: 'status',
        header: 'Status',
        render: (product) => (
          <span
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg ${
              product.status === 'active'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {product.status}
          </span>
        ),
      },
      {
        accessor: 'createdBy' as any,
        header: 'Created By',
        render: (product: Product) => (
          <span className="text-sm font-medium text-gray-600">
            {typeof product.createdBy === 'object' ? product.createdBy.name : product.createdBy || '--'}
          </span>
        ),
      },
      {
        accessor: 'createdAt',
        header: 'Date Created',
        render: (product: Product) => (
          <span className="text-sm font-medium text-gray-600">
            {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
          </span>
        ),
      },
    ];

    if (can('product', 'update') || can('product', 'delete')) {
      baseColumns.push({
        accessor: 'actions' as keyof Product,
        header: 'Actions',
        render: (product) => (
          <div className="flex items-center gap-2">
            {can('product', 'update') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (product._id) handleEdit(product._id);
                }}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {can('product', 'delete') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (product._id) handleDelete(product._id);
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
        eyebrow="Inventory Master"
        title="Products"
        highlight="Catalog"
        description="Manage product definitions, specifications, and catalog status."
        actions={
          <>
          {can('product', 'create') && (
            <button
              onClick={handleAdd}
              className="page-header-button"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
          {can('product', 'create') && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="page-header-button secondary"
            >
              <Download className="w-4 h-4" />
              Bulk Import
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
          <ProductFilterBar
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
              placeholder="Search products..."
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
              placeholder="Search products..."
            />
          </div>
        </>
      )}

      {/* Products Display */}
      {loading ? (
        <TableSkeleton /> // Replaced LoadingSpinner with TableSkeleton
      ) : (
        <DataTable
          columns={columns}
          data={products}
          onRowClick={handleRowClick}
          serverSidePagination={true}
          totalCount={totalProductsCount}
          currentPage={currentPage}
          limit={limit}
          totalPages={totalPagesCount}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
        />
      )}

      {/* Bulk Import Modal */}
      <BulkImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSuccess={fetchProducts}
      />
    </div>
  );
};

export default withAuth(CatalogPage, [{ module: 'product', action: 'view' }]);
