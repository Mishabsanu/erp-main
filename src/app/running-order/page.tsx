'use client';

import { RunningOrderFilterBar } from '@/components/running-order/RunningOrderFilterBar';
import { Column, DataTable } from '@/components/shared/DataTable';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import withAuth from '@/components/withAuth';
import { RunningOrder } from '@/lib/types';
import { deleteRunningOrder, getRunningOrders } from '@/services/runningOrderApi';
import { format } from 'date-fns';
import {
    Filter,
    Edit2,
    BarChart2,
    Eye,
    Trash2,
    Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Order Placed': return '#3b82f6'; // Blue
        case 'Partially Completed': return '#0d9488'; // Teal
        case 'Completed': return '#059669'; // Green
        case 'On Hire': return '#8b5cf6'; // Violet
        case 'Partially Returned': return '#f59e0b'; // Amber
        case 'Closed': return '#475569'; // Slate
        default: return '#6b7280';
    }
};

const RunningOrdersPage = () => {
    const [orders, setOrders] = useState<RunningOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const { can } = useAuth();
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const router = useRouter();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            // Determine effective status:
            // 1. If statusFilter is explicitly set by user, use it.
            // 2. Else if activeTab is completed, use 'Completed'.
            // 3. Else if activeTab is pending, use 'Ongoing' (which means not Completed).
            const effectiveStatus = statusFilter || (activeTab === 'completed' ? 'Completed' : 'Ongoing');

            const {
                result,
                totalPages: fetchedTotalPages,
                totalCount: fetchedTotalCount,
            } = await getRunningOrders(
                searchTerm,
                currentPage,
                limit,
                effectiveStatus,
                typeFilter
            );

            setOrders(result ?? []);
            setTotalPages(fetchedTotalPages ?? 1);
            setTotalCount(fetchedTotalCount ?? 0);
        } catch (err) {
            console.error('Fetch orders error', err);
            setOrders([]);
            toast.error('Failed to load orders.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, currentPage, limit, statusFilter, typeFilter, activeTab]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleDelete = async (id: string) => {
        toast.custom((t) => (
            <div className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
                <p className="font-medium text-gray-800">Are you sure you want to delete this running order?</p>
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => toast.dismiss(t)} className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition">Cancel</button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t);
                            const loadingId = toast.loading('Deleting...');
                            try {
                                await deleteRunningOrder(id);
                                toast.dismiss(loadingId);
                                toast.success('Deleted successfully!');
                                fetchOrders();
                            } catch {
                                toast.dismiss(loadingId);
                                toast.error('Failed to delete.');
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

    const columns: Column<RunningOrder>[] = useMemo(() => {
        const baseColumns: Column<RunningOrder>[] = [
            {
                accessor: 'company_name',
                header: 'Company Name',
                width: '240px',
                render: (order) => (
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 text-sm uppercase leading-tight">{order.company_name || '---'}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.order_number}</span>
                    </div>
                )
            },
            {
                accessor: 'transaction_type',
                header: 'Service Type',
                width: '120px',
                render: (order) => (
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                    order.transaction_type === 'Hire' 
                      ? 'bg-purple-50 text-purple-700 border-purple-100' 
                      : order.transaction_type === 'Sale' 
                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                        : 'bg-slate-50 text-slate-700 border-slate-100'
                  }`}>
                    {order.transaction_type || 'Sale'}
                  </span>
                )
            },
            {
                accessor: 'invoice_number' as any,
                header: 'Invoice / PO',
                width: '140px',
                render: (order) => (
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-[#0f766e] uppercase tracking-widest">{order.invoice_number || '---'}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.po_number || '---'}</span>
                    </div>
                )
            },
            {
                accessor: 'sales_person',
                header: 'Sales Person',
                width: '150px',
                render: (order) => (
                    <span className="text-xs font-bold text-gray-600 uppercase">{order.sales_person || '---'}</span>
                )
            },
            { 
                accessor: 'ordered_date', 
                header: 'Order Date',
                width: '130px',
                render: (order) => (
                    <span className="text-xs font-bold text-gray-700">
                        {order.ordered_date ? format(new Date(order.ordered_date), 'dd MMM yyyy') : '--'}
                    </span>
                )
            },
            {
                accessor: 'status',
                header: 'Status',
                width: '160px',
                render: (order) => (
                    <span 
                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm"
                        style={{ backgroundColor: getStatusColor(order.status || '') }}
                    >
                        {order.status}
                    </span>
                )
            },
            {
                accessor: 'items' as any,
                header: 'Metrics',
                width: '110px',
                render: (order) => {
                    const totalQty = order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center bg-[#0f766e]/5 border border-[#0f766e]/10 rounded-lg px-2 py-1 min-w-[60px]">
                                <span className="text-[10px] font-black text-[#0f766e]">{totalQty}</span>
                                <span className="text-[7px] font-black text-[#0f766e]/30 uppercase">Total Qty</span>
                            </div>
                        </div>
                    );
                }
            },
        ];

        baseColumns.push({
            accessor: 'actions' as keyof RunningOrder,
            header: 'Actions',
            width: '180px',
            render: (order) => (
                <div className="flex items-center gap-2">
                    {can('running_order', 'view') && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/running-order/${(order as any)._id}/report`);
                            }}
                            className="w-9 h-9 flex items-center justify-center text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all border border-gray-100 hover:border-emerald-200"
                            title="Order Report"
                        >
                            <BarChart2 className="w-4 h-4" />
                        </button>
                    )}
                    {can('running_order', 'update') && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/running-order/edit/${(order as any)._id}`);
                            }}
                            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
                            title="Edit"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                    {can('running_order', 'delete') && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if ((order as any)._id) handleDelete((order as any)._id);
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

    return baseColumns;
  }, [orders, router, handleDelete, can]);

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
            <ListPageHeader
                eyebrow="Tracker your order"
                title="Active"
                highlight="Orders"
                description="Track your devliery status , return status and manage you orders"
                actions={
                    <>
                    <button
                        onClick={() => router.push('/running-order/add')}
                        className="page-header-button"
                    >
                        <Plus className="w-4 h-4" /> Add
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="page-header-button secondary"
                    >
                        <Filter className="w-4 h-4" /> {showFilters ? 'Hide' : 'Filter'}
                    </button>
                    </>
                }
            />

            {/* Tabs Section */}
            <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === 'pending' 
                        ? 'bg-white text-[#0f766e] shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    Ongoing Orders
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === 'completed' 
                        ? 'bg-white text-[#0f766e] shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    Completed
                </button>
            </div>

            {showFilters && (
                <RunningOrderFilterBar
                    onStatusChange={setStatusFilter}
                    onTransactionTypeChange={setTypeFilter}
                    onClearFilters={() => {
                        setSearchTerm('');
                        setStatusFilter(undefined);
                        setTypeFilter(undefined);
                        setCurrentPage(1);
                    }}
                    initialStatus={statusFilter}
                    initialTransactionType={typeFilter}
                    hideStatus={activeTab === 'completed'}
                />
            )}

            <div className="mb-6">
                <SearchInput
                    initialSearchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search by invoice, company or sales person..."
                />
            </div>

            {loading ? (
                <TableSkeleton />
            ) : (
                <DataTable
                    columns={columns}
                    data={orders}
                    onRowClick={(order) => {
                        if (can('running_order', 'view')) {
                            router.push(`/running-order/${(order as any)._id}`);
                        }
                    }}
                    serverSidePagination={true}
                    totalCount={totalCount}
                    currentPage={currentPage}
                    limit={limit}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    onLimitChange={setLimit}
                />
            )}
        </div>
    );
};

export default withAuth(RunningOrdersPage, [{ module: 'running_order', action: 'view' }]);
