'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    getRunningOrderById,
    getRunningOrderFulfillment
} from '@/services/runningOrderApi';
import { RunningOrder } from '@/lib/types';
import {
    ArrowLeft,
    RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import RunningOrderReport from '@/components/running-order/RunningOrderReport';

const ReportPage = () => {
    const params = useParams();
    const id = (params?.id as string) || '';
    const router = useRouter();
    const [order, setOrder] = useState<RunningOrder | null>(null);
    const [fulfillment, setFulfillment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const reportRef = React.useRef<HTMLDivElement>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [orderRes, fulfillmentRes] = await Promise.all([
                getRunningOrderById(id as string),
                getRunningOrderFulfillment(id as string)
            ]);
            setOrder(orderRes);
            setFulfillment(fulfillmentRes);
        } catch (error) {
            console.error('Error fetching report data:', error);
            toast.error('Failed to load report data');
        } finally {
            setLoading(false);
        }
    }, [id]);



    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="p-10"><TableSkeleton /></div>;
    if (!order || !fulfillment) return <div className="p-10 text-center">Order data unavailable.</div>;

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 flex flex-col items-center font-sans print:bg-white print:py-0 print:px-0">

            {/* 1. STICKY ACTION BAR */}
            <div className="mb-8 w-full max-w-[210mm] flex justify-between items-center print:hidden bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white shadow-xl shadow-slate-200/50 sticky top-4 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-500 hover:text-slate-800"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Document Explorer</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Status: Ready for Audit</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={fetchData}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        title="Refresh"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print Report
                    </button>
                </div>
            </div>

            {/* 2. THE SHARED REPORT DOCUMENT */}
            <div className="shadow-2xl print:shadow-none bg-white">
                <RunningOrderReport ref={reportRef} order={order} fulfillment={fulfillment} />
            </div>

            {/* Global Print Overrides */}
            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: A4; }
                    body { background: white !important; margin: 0; }
                }
            `}</style>
        </div>
    );
};

export default withAuth(ReportPage, [{ module: 'running_order', action: 'view' }]);
