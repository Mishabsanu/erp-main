'use client';

import React from 'react';
import Image from 'next/image';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 7 }) => {
  return (
    <div className="space-y-4 animate-pulse">

      <div className="akod-table-shell">
        <div className="akod-table-scroll">
          <table className="akod-table">
            <thead>
              <tr>
                {[...Array(5)].map((_, i) => (
                  <th key={i}>
                    <div className="h-3 w-3/4 rounded bg-teal-50" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(5)].map((_, colIndex) => (
                    <td key={colIndex}>
                      <div className="h-4 rounded bg-gray-50" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="akod-table-footer">
          <div className="h-4 w-1/4 rounded bg-gray-100" />
          <div className="h-4 w-1/6 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
};
