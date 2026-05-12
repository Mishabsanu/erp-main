'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Edit3, Filter, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { getUsers } from '@/services/userApi';
import { getAllBreakups } from '@/services/payrollApi';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/AuthContext';

function SalaryBreakupsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [breakups, setBreakups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { can } = useAuth();
  
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, breakupsData] = await Promise.all([
        getUsers({ status: 'active' }, 1, 100),
        getAllBreakups(),
      ]);
      setUsers(usersData.users || []);
      setBreakups(breakupsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleActionMenu = (id: string) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const getBreakupForUser = (userId: string) => {
    return breakups.find((b) => b.user?._id === userId || b.user === userId);
  };

  const columns: Column<any>[] = useMemo(() => {
    const baseColumns: Column<any>[] = [
      {
        accessor: 'name',
        header: 'Employee',
        render: (user) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
              {user.name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessor: 'role' as any,
        header: 'Designation',
        render: (user) => (
          <span className="text-sm text-gray-600">{user.role?.name || '-'}</span>
        ),
      },
      {
        accessor: 'gross' as any,
        header: 'Gross Salary',
        render: (user) => {
          const breakup = getBreakupForUser(user._id);
          if (!breakup) return <span className="text-gray-300 italic text-xs">Not Configured</span>;
          const gross = (breakup.basic || 0) + (breakup.hra || 0) + (breakup.conveyance || 0) + (breakup.specialAllowance || 0);
          return <span className="font-semibold text-gray-800">₹{gross.toLocaleString()}</span>;
        },
      },
      {
        accessor: 'net' as any,
        header: 'Net Payable',
        render: (user) => {
          const breakup = getBreakupForUser(user._id);
          if (!breakup) return '-';
          const gross = (breakup.basic || 0) + (breakup.hra || 0) + (breakup.conveyance || 0) + (breakup.specialAllowance || 0);
          const deductions = (breakup.pf || 0) + (breakup.esi || 0) + (breakup.tds || 0) + (breakup.otherDeductions || 0);
          return <span className="font-bold text-teal-700">₹{(gross - deductions).toLocaleString()}</span>;
        },
      },
      {
        accessor: 'status' as any,
        header: 'Status',
        render: (user) => {
          const hasBreakup = !!getBreakupForUser(user._id);
          return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              hasBreakup ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {hasBreakup ? 'Configured' : 'Pending'}
            </span>
          );
        },
      },
      {
        accessor: 'actions' as any,
        header: 'Actions',
        render: (user) => (
          <div className="flex items-center gap-2">
            {can('payroll', 'update') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/hr/payroll/breakups/config/${user._id}`);
                }}
                className="w-9 h-9 flex items-center justify-center text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-all border border-gray-100 hover:border-sky-200"
                title="Configure Salary"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
      },
    ];
    return baseColumns;
  }, [users, breakups, openMenu, router]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <ListPageHeader
        eyebrow="Finance Node"
        title="Salary"
        highlight="Breakups"
        description="Personnel compensation frameworks and automated fiscal ledger configurations."
        actions={
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="page-header-button secondary"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        }
      />

      {showFilters && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl mb-8 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-3 bg-teal-600 rounded-full" />
            <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Filtering Criteria</h3>
          </div>
          <p className="text-xs text-gray-400 italic">Advanced filters coming soon...</p>
        </div>
      )}

      <div className="mb-6 mt-10">
        <SearchInput
          initialSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search employees by name or email..."
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          serverSidePagination={false}
        />
      )}
    </div>
  );
}

export default withAuth(SalaryBreakupsPage, [{ module: 'payroll', action: 'view' }]);
