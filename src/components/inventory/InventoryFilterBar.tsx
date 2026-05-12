'use client';

import { FilterChip } from '@/components/shared/FilterChip';
import { Select } from '@/components/ui/Select';
import { InventoryFilter } from '@/lib/types';
import { Filter, ToggleLeft, XCircle, Hash } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const PRIMARY = '#0f766e';
interface InventoryFilterBarProps {
  onStatusChange: (status: InventoryFilter['status']) => void;
  onVendorChange: (vendorId: string) => void; // New prop
  onStockRangeChange: (min?: number, max?: number) => void;
  onLowStockToggle: (onlyLow: boolean) => void; // New prop
  onClearFilters: () => void;
  initialStatus?: InventoryFilter['status'];
}

export const InventoryFilterBar: React.FC<InventoryFilterBarProps> = ({
  onStatusChange,
  onVendorChange,
  onStockRangeChange,
  onLowStockToggle,
  onClearFilters,
  initialStatus = undefined,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(initialStatus || '');
  const [selectedVendor, setSelectedVendor] = useState(''); // New state
  const [vendors, setVendors] = useState<any[]>([]); // To store vendors
  const [minStock, setMinStock] = useState<string>('');
  const [maxStock, setMaxStock] = useState<string>('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  /* ---------------- Fetch Vendors ---------------- */
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const { getVendorDropdown } = await import('@/services/vendorApi');
        const response = await getVendorDropdown();
        if (response.success) {
          setVendors(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch vendors for filter:', error);
      }
    };
    fetchVendors();
  }, []);

  /* ---------------- Effects ---------------- */
  useEffect(() => {
    onStatusChange(
      selectedStatus === ''
        ? undefined
        : (selectedStatus as InventoryFilter['status'])
    );
  }, [selectedStatus, onStatusChange]);

  useEffect(() => {
    onVendorChange(selectedVendor);
  }, [selectedVendor, onVendorChange]);

  useEffect(() => {
    onStockRangeChange(
      minStock ? Number(minStock) : undefined,
      maxStock ? Number(maxStock) : undefined
    );
  }, [minStock, maxStock, onStockRangeChange]);

  useEffect(() => {
    onLowStockToggle(onlyLowStock);
  }, [onlyLowStock, onLowStockToggle]);

  const handleClear = () => {
    setSelectedStatus('');
    setSelectedVendor('');
    setMinStock('');
    setMaxStock('');
    setOnlyLowStock(false);
    onClearFilters();
  };

  const hasFilters = selectedStatus || selectedVendor || minStock || maxStock || onlyLowStock;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 text-gray-700">
        <Filter className="w-5 h-5" />
        <h3 className="text-sm font-semibold">Filters</h3>
      </div>

      {/* Active Filter Chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedStatus && (
            <FilterChip
              label="Status"
              value={selectedStatus}
              onRemove={() => setSelectedStatus('')}
              color="green"
            />
          )}

          {onlyLowStock && (
            <FilterChip
              label="Stock Level"
              value="Below Reorder Qty"
              onRemove={() => setOnlyLowStock(false)}
              color="red"
            />
          )}

          {minStock && (
            <FilterChip
              label="Min Stock"
              value={minStock}
              onRemove={() => setMinStock('')}
              color="blue"
            />
          )}

          {maxStock && (
            <FilterChip
              label="Max Stock"
              value={maxStock}
              onRemove={() => setMaxStock('')}
              color="purple"
            />
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Status */}
          <div className="w-full sm:w-48">
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Status
            </label>
            <div className="relative">
              <ToggleLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-9"
              >
                <option value="">All Status</option>
                <option value="IN_STOCK">IN_STOCK</option>
                <option value="LOW_STOCK">LOW_STOCK</option>
                <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
              </Select>
            </div>
          </div>

          {/* Vendor Filter */}
          <div className="w-full sm:w-56">
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Supplier/Vendor
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="pl-9"
              >
                <option value="">All Suppliers</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.company}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Low Stock Toggle */}
          <div className="flex items-center gap-2 mb-2 bg-red-50/50 px-3 py-2 rounded-xl border border-red-100/50 hover:bg-red-50 transition-colors">
            <input 
              type="checkbox" 
              id="low-stock-only" 
              checked={onlyLowStock}
              onChange={(e) => setOnlyLowStock(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-red-300"
            />
            <label htmlFor="low-stock-only" className="text-xs font-black text-red-700 cursor-pointer select-none">
              Below Reorder Qty Only
            </label>
          </div>

          {/* Min Stock */}
          <div className="w-full sm:w-40">
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Min Stock
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min={0}
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Max Stock */}
          <div className="w-full sm:w-40">
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Max Stock
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min={0}
                value={maxStock}
                onChange={(e) => setMaxStock(e.target.value)}
                placeholder="100"
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition hover:bg-gray-50 mb-1"
            style={{ borderColor: PRIMARY, color: PRIMARY }}
          >
            <XCircle className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};
