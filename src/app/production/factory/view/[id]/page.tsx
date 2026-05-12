'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProductionById } from '@/services/productionApi';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { Section } from '@/components/ui/Section';
import { 
    ArrowLeft, 
    Building2, 
    Layers, 
    Calendar, 
    User, 
    FileText,
    CheckCircle2,
    Clock,
    Package,
    Hash,
    ImageIcon,
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import withAuth from '@/components/withAuth';
import { format } from 'date-fns';

interface ViewProductionPageProps {
  params: Promise<{ id: string }>;
}

const ViewProductionPage = ({ params: paramsPromise }: ViewProductionPageProps) => {
    const router = useRouter();
    const params = use(paramsPromise);
    const { id } = params;
    
    const [production, setProduction] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProductionById(id as string);
            setProduction(data);
        } catch (error) {
            toast.error('Failed to load production details');
            router.push('/production/factory');
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (id) fetchDetails();
    }, [id, fetchDetails]);

    if (loading) return <div className="p-10"><TableSkeleton /></div>;
    if (!production) return null;

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
            <div className="mb-8">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-teal-700 transition-all font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={16} />
                    Back to Production List
                </button>
            </div>

            <ListPageHeader
                eyebrow="Production Lifecycle Report"
                title={`Batch ${production.batchNumber}`}
                highlight={`[${production.productId?.name}]`}
                description={`Detailed log of production cycle executed on ${production.manufacturingDate ? format(new Date(production.manufacturingDate), 'PPP') : 'N/A'}.`}
                actions={
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                            production.status === 'approved' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                            {production.status}
                        </span>
                        <button 
                            onClick={() => router.push(`/production/factory/edit/${production._id}`)}
                            className="page-header-button"
                        >
                            <FileText size={16} />
                            Edit Record
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* LEFT: CORE METRICS */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/40 flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Output Volume</p>
                                <h3 className="text-4xl font-black text-teal-700 tracking-tighter">
                                    {production.quantity.toLocaleString()} <span className="text-sm text-gray-400 font-bold uppercase tracking-widest ml-1">{production.productId?.unit}</span>
                                </h3>
                            </div>
                            <div className="p-4 rounded-2xl bg-teal-50 text-teal-700 group-hover:scale-110 transition-transform">
                                <Package size={32} />
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/40 flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Execution Status</p>
                                <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
                                    {production.status === 'approved' ? 'Inventory Synced' : 'Pending Approval'}
                                </h3>
                            </div>
                            <div className={`p-4 rounded-2xl ${production.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'} group-hover:scale-110 transition-transform`}>
                                {production.status === 'approved' ? <CheckCircle2 size={32} /> : <Clock size={32} />}
                            </div>
                        </div>
                    </div>

                    <Section title="Resource Consumption Ledger">
                        <div className="overflow-hidden rounded-[2rem] border border-gray-50 shadow-sm bg-white">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] uppercase font-black tracking-widest text-gray-400">
                                        <th className="px-8 py-5">Raw Material</th>
                                        <th className="px-8 py-5">Item Code</th>
                                        <th className="px-8 py-5 text-right">Consumed Qty</th>
                                        <th className="px-8 py-5">Unit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {production.rawMaterials?.map((rm: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-50/30 transition-all font-bold text-sm text-gray-700">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                                                        <Layers size={14} />
                                                    </div>
                                                    <span className="text-gray-900">{rm.material?.name || 'Unknown Material'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-slate-400 uppercase text-[10px] tracking-widest">
                                                {rm.material?.itemCode || 'N/A'}
                                            </td>
                                            <td className="px-8 py-5 text-right font-black text-[#0f766e]">
                                                {rm.quantity.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {rm.material?.unit}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FileText size={14} />
                            Process Remarks
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                            {production.remarks || "No additional shift notes recorded for this batch."}
                        </p>
                    </div>
                </div>

                {/* RIGHT: DOCUMENTATION & IMAGE */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={14} />
                            Batch Documentation
                        </h4>

                        {production.image ? (
                            <div className="space-y-4">
                                <div className="group relative aspect-square bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden shadow-inner">
                                    <img 
                                        src={production.image.startsWith('http') ? production.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${production.image}`} 
                                        alt="Batch Documentation"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <a 
                                            href={production.image.startsWith('http') ? production.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${production.image}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all active:scale-90"
                                        >
                                            <ExternalLink size={24} />
                                        </a>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 text-center italic font-medium">Click image to expand in new tab</p>
                            </div>
                        ) : (
                            <div className="aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 grayscale opacity-60">
                                <ImageIcon size={48} className="text-slate-300 mb-4" />
                                <p className="text-xs font-bold text-slate-400">No batch image uploaded</p>
                                <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest">Documentation missing</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Audit Information</label>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Recorded By</p>
                                            <p className="text-xs font-bold">{production.createdBy?.name || 'System'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                                            <Calendar size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Manufacturing Date</p>
                                            <p className="text-xs font-bold">{production.manufacturingDate ? format(new Date(production.manufacturingDate), 'PPP') : 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                                            <Hash size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Batch Identification</p>
                                            <p className="text-xs font-bold text-teal-400">{production.batchNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withAuth(ViewProductionPage, [{ module: 'production', action: 'view' }]);
