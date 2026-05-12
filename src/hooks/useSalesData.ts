import { useState, useEffect, useCallback } from 'react';
import { Sale, SaleFilter } from '@/lib/types';
// import { getSales } from '@/services/salesApi'; // Commented out due to missing module
import { useDebounce } from './useDebounce';

interface UseSalesDataProps {
  initialLimit?: number;
}

const useSalesData = ({ initialLimit = 10 }: UseSalesDataProps = {}) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(initialLimit);
  const [inputValue, setInputValue] = useState(''); // For the search input field
  const debouncedSearchTerm = useDebounce(inputValue, 500);

  const [filter, setFilter] = useState<SaleFilter>({
    search: '',
    status: undefined,
    startDate: '',
    endDate: '',
    // nextFollowUpDate: '', // Removed as it's not in SaleFilter
  });

  // Effect to update filter.search when debouncedSearchTerm changes
  useEffect(() => {
    setFilter((prev) => ({ ...prev, search: debouncedSearchTerm }));
    setCurrentPage(1); // Reset to first page on new search
  }, [debouncedSearchTerm]);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      // Temporarily mock sales data since salesApi is missing
      const fetchedSales: Sale[] = [];
      const fetchedTotalPages = 1;
      const fetchedTotalCount = 0;

      // const {
      //   sales: fetchedSales,
      //   totalPages: fetchedTotalPages,
      //   totalCount: fetchedTotalCount,
      // } = await getSales(
      //   filter,
      //   currentPage,
      //   limit
      // );
      setSales(fetchedSales);
      setTotalPages(fetchedTotalPages);
      setTotalCount(fetchedTotalCount);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      // Optionally set an error state here
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, limit]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Function to refresh sales data, useful after add/edit/delete
  const refreshSales = useCallback(() => {
    fetchSales();
  }, [fetchSales]);

  // Handlers for pagination and filter changes
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when limit changes
  }, []);

  const handleFilterChange = useCallback((newFilter: Partial<SaleFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  return {
    sales,
    loading,
    currentPage,
    totalPages,
    totalCount,
    limit,
    inputValue,
    filter,
    setInputValue,
    setCurrentPage: handlePageChange,
    setLimit: handleLimitChange,
    setFilter: handleFilterChange,
    refreshSales,
  };
};

export default useSalesData;