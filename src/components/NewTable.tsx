'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import React from 'react';

export interface Column<T> {
  accessor: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  nowrap?: boolean;
}

interface ReusableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  totalPages: number;
  onRowClick?: (item: T) => void;
  isView?: boolean;
}

const NewTable = <T extends { _id?: string } & Record<string, unknown>>({
  columns,
  data,
  totalCount,
  page,
  limit,
  setPage,
  setLimit,
  totalPages,
  onRowClick,
}: ReusableTableProps<T>) => {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalCount);

  return (
    <div className="akod-table-shell animate-fade-in">
      <div className="akod-table-scroll">
      <table className="akod-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                className={`${
                  col.nowrap ? 'whitespace-nowrap' : ''
                } ${
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="akod-table-empty"
              >
                No data found.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item._id}
                onClick={() => onRowClick && onRowClick(item)}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.accessor)}
                    className={`${
                      col.nowrap ? 'whitespace-nowrap' : ''
                    } ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                    }`}
                  >
                    {col.render
                      ? col.render(item)
                      : (item[col.accessor] as React.ReactNode) ?? '-'}
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
        {/* Left Side: "Showing X to Y of Z" */}
        <div className="akod-table-footer-text">
          {totalCount > 0 ? (
            <>
              Catalog results <strong>{from}-{to}</strong> of{' '}
              <strong>{totalCount}</strong>
            </>
          ) : (
            'No entries'
          )}
        </div>

        {/* Right Side: Limit Selector and Page Buttons */}
        <div className="flex items-center gap-6">
          {/* Limit Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="limit-select" className="akod-table-footer-label">
              Rows displayed
            </label>
            <select
              id="limit-select"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="akod-table-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
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
    </div>
  );
};

export default NewTable;
