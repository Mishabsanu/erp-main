'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { Plus, Edit3, Trash2, Layers, PackageSearch, Tag, Hash, Upload } from 'lucide-react';
import { getRawMaterials, deleteRawMaterial } from '@/services/rawMaterialApi';
import { RawMaterialBulkImportModal } from '@/components/production/RawMaterialBulkImportModal';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';

const RawMaterialRegistryPage = () => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getRawMaterials();
            setMaterials(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Failed to load raw materials');
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

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        
        toast.custom((t) => (
            <div className="flex flex-col gap-4 bg-white p-6 rounded-[1.5rem] shadow-2xl border border-slate-100 min-w-[320px] animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3 text-rose-600">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                        <Trash2 size={20} />
                    </div>
                    <p className="font-bold text-slate-800">Confirm Deletion</p>
                </div>
                
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Are you sure you want to permanently remove this material definition? This will affect linked inventory records.
                </p>

                <div className="flex justify-end gap-3 mt-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t);
                            toast.info('Deletion cancelled.', { duration: 2000 });
                        }}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t);
                            const loadingId = toast.loading('Executing resource removal...');
                            try {
                                const response = await deleteRawMaterial(id);
                                toast.dismiss(loadingId);
                                
                                if (response.success) {
                                    toast.success(response.message || 'Material definition purged');
                                    fetchMaterials();
                                } else {
                                    toast.error(response.message || 'Purge failed');
                                }
                            } catch (error: any) {
                                toast.dismiss(loadingId);
                                const errorMessage = error.response?.data?.message || 'Network failure during purge';
                                toast.error(errorMessage);
                            }
                        }}
                        className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/20 active:scale-95"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        ), {
            id: `delete-confirm-${id}`,
            duration: Infinity,
            position: 'top-right',
        });
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
            accessor: 'unit',
            header: 'Metric',
            render: (item) => (
                <div className="flex flex-col">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gray-50 text-gray-600 text-[10px] font-black w-fit mb-2 border border-gray-100 shadow-sm">
                        <Tag size={12} className="text-[#0f766e]" /> {item.unit}
                    </div>
                </div>
            )
        },
        {
            accessor: 'reorderLevel',
            header: 'Safety Threshold',
            render: (item) => (
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#0f172a] tracking-tighter tabular-nums">{item.reorderLevel.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{item.unit}</span>
                    </div>
                    <div className="w-8 h-1 bg-rose-500/20 rounded-full mt-1" />
                </div>
            )
        },
        {
            accessor: 'description',
            header: 'Technical Specifications',
            render: (item) => <span className="text-xs text-gray-400 font-medium line-clamp-1 max-w-[250px]">{item.description || 'No specifications provided.'}</span>
        },
        {
            accessor: 'actions',
            header: 'Actions',
            render: (item) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/production/raw-materials/edit/${item._id}`); }}
                        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-gray-100 hover:border-[#0f766e]/20"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button
                        onClick={(e) => handleDelete(item._id, e)}
                        className="w-9 h-9 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-100 hover:border-red-200"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-2 md:p-4">
            <ListPageHeader
                eyebrow="Production Hub"
                title="Material"
                highlight="Registry"
                description="Define resource blueprints and fabrication specifications."
                actions={
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsImportModalOpen(true)} 
                            className="page-header-button secondary"
                        >
                            <Upload size={16} />
                            Bulk Import
                        </button>
                        <button onClick={() => router.push('/production/raw-materials/stock')} className="page-header-button secondary">
                            <PackageSearch size={16} />
                            View Stock
                        </button>
                        <button onClick={() => router.push('/production/raw-materials/add')} className="page-header-button">
                            <Plus size={16} />
                            Add
                        </button>
                    </div>
                }
            />

            <div className="mb-6 mt-10">
                <SearchInput 
                    initialSearchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search registry by name or item code..."
                />
            </div>

            {loading ? (
                <TableSkeleton />
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredMaterials}
                    onRowClick={(item) => router.push(`/production/raw-materials/edit/${item._id}`)}
                    serverSidePagination={false}
                />
            )}

            <RawMaterialBulkImportModal 
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={fetchMaterials}
            />
        </div>
    );
};

export default withAuth(RawMaterialRegistryPage, [{ module: 'production', action: 'view' }]);
