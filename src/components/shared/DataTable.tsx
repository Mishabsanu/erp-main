'use client';

import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export interface Column<T> {
  accessor: keyof T;
  header: React.ReactNode;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;

  // Server-side pagination props
  serverSidePagination: boolean;
  totalCount?: number;
  currentPage?: number;
  limit?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function DataTable<T extends { _id?: string }>({
  columns,
  data,
  onRowClick,
  serverSidePagination,
  totalCount,
  currentPage,
  limit,
  totalPages,
  onPageChange,
  onLimitChange,
}: DataTableProps<T>) {
  // Internal state for client-side pagination (no longer used for search)
  const [internalPage, setInternalPage] = useState(1);
  const [internalLimit, setInternalLimit] = useState(10);

  // Determine which state to use for pagination
  const actualPage = (serverSidePagination ? currentPage : internalPage) || 1;
  const actualLimit = (serverSidePagination ? limit : internalLimit) || 10;

  const handlePageChange = (page: number) => {
    if (serverSidePagination) {
      onPageChange?.(page);
    } else {
      setInternalPage(page);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    if (serverSidePagination) {
      onLimitChange?.(newLimit);
      onPageChange?.(1); // Reset to first page on limit change
    } else {
      setInternalLimit(newLimit);
      setInternalPage(1); // Reset to first page on limit change
    }
  };

  // Data for display
  const displayData = useMemo(() => {
    if (serverSidePagination) return data;
    const from = (actualPage - 1) * actualLimit;
    const to = from + actualLimit;
    return data.slice(from, to);
  }, [data, serverSidePagination, actualPage, actualLimit]);

  // Determine effective values for rendering pagination controls
  const displayTotalCount = (serverSidePagination ? totalCount : data.length) || 0;
  const displayTotalPages = (serverSidePagination ? totalPages : Math.ceil(data.length / actualLimit)) || 0;
  const displayFrom = displayTotalCount > 0 ? (actualPage - 1) * actualLimit + 1 : 0;
  const displayTo = Math.min(actualPage * actualLimit, displayTotalCount);


  return (
    <div className="akod-table-shell animate-fade-in">
      <div className="akod-table-scroll">
        <table 
          className="akod-table"
          style={columns.some(c => c.width) ? { tableLayout: 'fixed' } : {}}
        >
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.accessor)}
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="akod-table-empty"
                >
                  No data found.
                </td>
              </tr>
            ) : (
              displayData.map((item, index) => (
                <tr
                  key={item._id || index}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={onRowClick ? 'cursor-pointer' : ''}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.accessor)}
                      style={col.width ? { width: col.width } : {}}
                    >
                      {col.render
                        ? col.render(item)
                        : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="akod-table-footer">
        <div className="akod-table-footer-text">
          {displayTotalCount > 0 ? (
            <>
              Catalog results <strong>{displayFrom}-{displayTo}</strong> of{' '}
              <strong>{displayTotalCount}</strong>
            </>
          ) : (
            'No entries'
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label htmlFor="limit-select" className="akod-table-footer-label">
              Rows displayed
            </label>
            <select
              id="limit-select"
              value={actualLimit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="akod-table-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={actualPage === 1}
              className="akod-page-button"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePageChange(actualPage - 1)}
              disabled={actualPage === 1}
              className="akod-page-button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="akod-page-current">
              Page {actualPage || 0} of {displayTotalPages || 0}
            </span>

            <button
              onClick={() => handlePageChange(actualPage + 1)}
              disabled={actualPage === displayTotalPages || displayTotalPages === 0}
              className="akod-page-button"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePageChange(displayTotalPages)}
              disabled={actualPage === displayTotalPages || displayTotalPages === 0}
              className="akod-page-button"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
