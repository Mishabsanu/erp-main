'use client';

import React, { useEffect, useState } from 'react';
import { Select } from '@/components/ui/Select';
import { UserFilter } from '@/lib/types';
import { getRoleDropdown } from '@/services/roleApi';
import { FilterChip } from '@/components/shared/FilterChip';
import { Filter, ToggleLeft, UserCog, XCircle } from 'lucide-react';

const PRIMARY = '#0f766e';

interface UserFilterBarProps {
  onRoleChange: (role: UserFilter['role']) => void;
  onStatusChange: (status: UserFilter['status']) => void;
  onClearFilters: () => void;
  initialRole?: UserFilter['role'];
  initialStatus?: UserFilter['status'];
}

/* ---------------- MAIN COMPONENT ---------------- */
export const UserFilterBar: React.FC<UserFilterBarProps> = ({
  onRoleChange,
  onStatusChange,
  onClearFilters,
  initialRole,
  initialStatus,
}) => {
  const [selectedRole, setSelectedRole] = useState(initialRole ?? '');
  const [selectedStatus, setSelectedStatus] = useState(initialStatus ?? '');
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);

  /* ---------------- FETCH ROLES ---------------- */
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoleDropdown();
        if (response.success && Array.isArray(response.data)) {
          setRoles(
            response.data.map((role: any) => ({
              value: role._id,
              label: role.name,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };
    fetchRoles();
  }, []);

  /* ---------------- FILTER CALLBACKS ---------------- */
  useEffect(() => {
    onRoleChange(selectedRole || undefined);
  }, [selectedRole]);

  useEffect(() => {
    onStatusChange(
      selectedStatus ? (selectedStatus as UserFilter['status']) : undefined
    );
  }, [selectedStatus]);

  const handleClearAll = () => {
    setSelectedRole('');
    setSelectedStatus('');
    onClearFilters();
  };

  const roleLabel = roles.find((r) => r.value === selectedRole)?.label || '';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 text-gray-700">
        <Filter className="w-5 h-5" />
        <h3 className="text-sm font-semibold">Filters</h3>
      </div>

      {/* Active Filter Chips */}
      {(selectedRole || selectedStatus) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedRole && (
            <FilterChip
              label="Role"
              value={roleLabel}
              onRemove={() => setSelectedRole('')}
              color="blue"
            />
          )}

          {selectedStatus && (
            <FilterChip
              label="Status"
              value={selectedStatus}
              onRemove={() => setSelectedStatus('')}
              color="green"
            />
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Role Filter */}
          <div className="w-full sm:w-56">
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Role
            </label>
            <div className="relative">
              <UserCog className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="pl-9"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-56">
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Clear All Button */}
        {(selectedRole || selectedStatus) && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition hover:bg-gray-50"
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
