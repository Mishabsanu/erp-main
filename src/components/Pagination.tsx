'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface PaginationProps {
  totalCount: number;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  totalPages: number;
}

const Pagination = ({
  totalCount,
  page,
  limit,
  setPage,
  setLimit,
  totalPages,
}: PaginationProps) => {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalCount);

  return (
    <div className="akod-table-footer mt-6 rounded-xl border-x border-b shadow-sm">
      {/* Left Side: "Showing X to Y of Z" */}
      <div className="akod-table-footer-text">
        {totalCount > 0 ? (
          <>
            Showing <strong>{from}-{to}</strong> of{' '}
            <strong>{totalCount}</strong> entries
          </>
        ) : (
          'No entries'
        )}
      </div>

      {/* Right Side: Limit Selector and Page Buttons */}
      <div className="flex items-center gap-6">
        {/* Limit Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="limit-select" className="akod-table-footer-label">
            Rows per page
          </label>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="akod-table-select"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Pagination Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="akod-page-button"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="akod-page-button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="akod-page-current">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="akod-page-button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="akod-page-button"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;