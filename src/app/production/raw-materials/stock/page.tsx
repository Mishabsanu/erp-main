'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { AlertTriangle, Layers, Plus, TrendingDown, History, Edit3, Trash2, TrendingUp } from 'lucide-react';
import { getRawMaterials, adjustRawMaterialStock, deleteRawMaterial } from '@/services/rawMaterialApi';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';

const RawMaterialStockPage = () => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getRawMaterials({ initialized: true });
            setMaterials(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Failed to load stock data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const filteredMaterials = useMemo(() => {
        return materials.filter(m => 
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            m.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [materials, searchTerm]);

    const lowStockCount = useMemo(() => {
        return materials.filter(m => m.availableQty <= m.reorderLevel).length;
    }, [materials]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this material? This will remove all stock history.')) return;
        try {
            await deleteRawMaterial(id);
            toast.success('Material deleted');
            fetchMaterials();
        } catch (error) {
            toast.error('Failed to delete material');
        }
    };

    const columns: Column<any>[] = [
        {
            accessor: 'itemCode',
            header: 'Resource Identity',
            render: (item) => (
                <div className="flex items-center gap-4 py-2">
                  <div className="w-11 h-11 bg-teal-50 rounded-2xl flex items-center justify-center text-[#0f766e] border border-teal-100 shadow-sm transition-transform hover:scale-110">
                    <Layers size={20} />
                  </div>
                  <div>
                    <div className="font-black text-[#0f172a] text-[15px] tracking-tight leading-none mb-1.5">{item.name || 'Unknown Material'}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2 opacity-70">
                      <span className="text-[#0f766e]">{item.itemCode || 'CODE-N/A'}</span>
                    </div>
                  </div>
                </div>
            )
        },
        {
            accessor: 'availableQty',
            header: 'Current Stock',
            render: (item) => {
                const isLow = item.availableQty <= item.reorderLevel;
                return (
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-black tracking-tighter tabular-nums ${isLow ? 'text-rose-600' : 'text-[#0f172a]'}`}>
                                {item.availableQty.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{item.unit}</span>
                        </div>
                        {isLow && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 mt-1 w-fit">
                                <AlertTriangle size={10} />
                                <span className="text-[8px] font-black uppercase tracking-widest">Critical Level</span>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            accessor: 'status',
            header: 'Resource Health',
            render: (item) => {
                const ratio = item.availableQty / (item.reorderLevel || 1);
                let statusColor = 'bg-emerald-500';
                let label = 'Healthy';
                
                if (ratio <= 1) { statusColor = 'bg-rose-500'; label = 'Restock Needed'; }
                else if (ratio <= 2) { statusColor = 'bg-amber-500'; label = 'Monitoring'; }

                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                        </div>
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${statusColor}`} 
                                style={{ width: `${Math.min(ratio * 50, 100)}%` }} 
                            />
                        </div>
                    </div>
                );
            }
        },
        {
            accessor: 'actions',
            header: 'Actions',
            render: (item) => (
                <div className="flex justify-end gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/production/raw-materials/view/${item._id}`); }} 
                        className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-xl border border-slate-100 transition-all active:scale-95 shadow-sm"
                        title="View Audit History"
                    >
                        <History size={16} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/production/raw-materials/stock/add?materialId=${item._id}`); }} 
                        className="w-10 h-10 flex items-center justify-center bg-teal-50 text-[#0f766e] hover:bg-[#0f766e] hover:text-white rounded-xl border border-teal-100 transition-all active:scale-95 shadow-sm"
                        title="Edit Stock Levels"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button 
                        onClick={(e) => handleDelete(item._id, e)} 
                        className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-100 transition-all active:scale-95 shadow-sm"
                        title="Delete Material"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
            <ListPageHeader
                eyebrow="Resource Monitoring"
                title="Stock"
                highlight="Management"
                description="Manage inventory levels and restock fabrication materials."
                actions={
                    <div className="flex gap-4">
                        <button onClick={() => router.push('/production/raw-materials')} className="page-header-button secondary">
                            <Layers size={16} />
                            Registry
                        </button>
                        <button 
                            onClick={() => router.push('/production/raw-materials/stock/add')} 
                            className="page-header-button"
                        >
                            <Plus size={16} />
                            Add Stock
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 mt-10">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Layers size={80} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Stocked Items</p>
                    <h3 className="text-3xl font-black text-[#0f172a]">{materials.length}</h3>
                </div>

                <div className={`p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group ${lowStockCount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-200/60'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingDown size={80} className={lowStockCount > 0 ? 'text-rose-600' : 'text-gray-400'} />
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>Under Threshold</p>
                    <h3 className={`text-3xl font-black ${lowStockCount > 0 ? 'text-rose-600' : '#0f172a'}`}>{lowStockCount}</h3>
                </div>
            </div>

            <div className="mb-6">
                <SearchInput 
                    initialSearchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search stock by material name or item code..."
                />
            </div>

            {loading ? (
                <TableSkeleton />
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredMaterials}
                    onRowClick={(item) => router.push(`/production/raw-materials/view/${item._id}`)}
                    serverSidePagination={false}
                />
            )}
        </div>
    );
};

export default withAuth(RawMaterialStockPage, [{ module: 'production', action: 'view' }]);
