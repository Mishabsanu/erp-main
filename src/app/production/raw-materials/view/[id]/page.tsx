'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRawMaterialById, adjustRawMaterialStock } from '@/services/rawMaterialApi';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { Section } from '@/components/ui/Section';
import { 
    ArrowLeft, 
    Layers, 
    History, 
    TrendingUp, 
    TrendingDown, 
    Calendar, 
    User, 
    Plus, 
    FileText,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import RawMaterialStockAdjustmentForm from '@/components/production/RawMaterialStockAdjustmentForm';
import withAuth from '@/components/withAuth';

const RawMaterialHistoryPage = () => {
    const params = useParams();
    const id = (params?.id as string) || '';
    const router = useRouter();
    const [material, setMaterial] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getRawMaterialById(id as string);
            setMaterial(data);
        } catch (error) {
            toast.error('Failed to load material history');
            router.push('/production/raw-materials/stock');
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleAdjustment = async (matId: string, quantity: number, note?: string) => {
        try {
            await adjustRawMaterialStock(matId, quantity, note);
            toast.success('Stock adjusted successfully');
            fetchDetails();
        } catch (error) {
            throw error;
        }
    };

    if (loading) return <div className="p-10"><TableSkeleton /></div>;
    if (!material) return null;

    const sortedHistory = [...(material.history || [])].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
            <div className="mb-8">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-teal-700 transition-all font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={16} />
                    Back to Stock List
                </button>
            </div>

            <ListPageHeader
                eyebrow="Inventory Audit Report"
                title={material.name}
                highlight={`[${material.itemCode}]`}
                description={material.description || "Historical stock movement and ledger records for this material."}
                actions={
                    <button 
                        onClick={() => router.push(`/production/raw-materials/stock/add?materialId=${material._id}`)}
                        className="page-header-button"
                    >
                        <Plus size={16} />
                        Adjust Stock
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                <div className="lg:col-span-1 space-y-6">
                    <Section title="Item Specifications">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Standard Unit</label>
                                <span className="text-sm font-bold text-gray-700 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">{material.unit}</span>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Alert Threshold</label>
                                <span className="text-sm font-bold text-rose-600">{material.reorderLevel.toLocaleString()} {material.unit}</span>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Registry Status</label>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    material.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                }`}>
                                    {material.status}
                                </span>
                            </div>
                        </div>
                    </Section>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/40 flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Current Availability</p>
                                <h3 className={`text-4xl font-black ${material.availableQty <= material.reorderLevel ? 'text-rose-600' : 'text-teal-700'}`}>
                                    {material.availableQty.toLocaleString()}
                                </h3>
                            </div>
                            <div className={`p-4 rounded-2xl ${material.availableQty <= material.reorderLevel ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-700'} group-hover:scale-110 transition-transform`}>
                                <Layers size={32} />
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/40 flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Stock Health</p>
                                <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
                                    {material.availableQty <= material.reorderLevel ? 'Restock Required' : 'Adequate'}
                                </h3>
                            </div>
                            <div className={`p-4 rounded-2xl ${material.availableQty <= material.reorderLevel ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'} group-hover:scale-110 transition-transform`}>
                                {material.availableQty <= material.reorderLevel ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
                            </div>
                        </div>
                    </div>

                    <Section title="Stock Ledger / Audit History">
                        <div className="overflow-hidden rounded-[2rem] border border-gray-50 shadow-sm bg-white">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] uppercase font-black tracking-widest text-gray-400">
                                        <th className="px-8 py-5">Date & Time</th>
                                        <th className="px-8 py-5">Adjustment Type</th>
                                        <th className="px-8 py-5 text-right">Qty Change</th>
                                        <th className="px-8 py-5">Reference / Notes</th>
                                        <th className="px-8 py-5">Managed By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {sortedHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-10 text-center text-gray-400 italic font-bold">No historical movements recorded.</td>
                                        </tr>
                                    ) : (
                                        sortedHistory.map((entry, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/30 transition-all font-bold text-sm text-gray-700">
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900">{new Date(entry.date).toLocaleDateString()}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        {entry.quantity > 0 ? (
                                                            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={12} /></div>
                                                        ) : (
                                                            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><TrendingDown size={12} /></div>
                                                        )}
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{entry.type.replace('_', ' ')}</span>
                                                    </div>
                                                </td>
                                                <td className={`px-8 py-5 text-right font-black ${entry.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {entry.quantity > 0 ? `+${entry.quantity.toLocaleString()}` : entry.quantity.toLocaleString()}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 max-w-[200px]">
                                                        <FileText size={12} className="text-gray-300 shrink-0" />
                                                        <span className="text-xs text-gray-500 font-medium italic line-clamp-1">{entry.note || 'Internal movement'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 text-[10px] font-black uppercase">
                                                            {(entry.user?.name || 'A')[0]}
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{entry.user?.name || 'System Auto'}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Section>
                </div>
            </div>

        </div>
    );
};

export default withAuth(RawMaterialHistoryPage, [{ module: 'production', action: 'view' }]);
