'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getExpenseById, getPayments } from '@/services/financeApi';
import { Expense, Payment } from '@/lib/types';
import { 
  ArrowLeft,
  RotateCcw,
  Clock,
  Download,
  FileBarChart2,
  DollarSign,
  TrendingUp,
  History,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

const SettlementReportPage = () => {
    const params = useParams();
    const id = (params?.id as string) || '';
    const router = useRouter();
    const [expense, setExpense] = useState<Expense | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const expenseData = await getExpenseById(id as string);
            setExpense(expenseData);
            
            // Fetch all payments linked to this expense
            const paymentsData = await getPayments({ 
                referenceId: id as string, 
                referenceType: 'Expense' 
            }, 1, 100);
            
            setPayments(paymentsData.payments);
        } catch (error) {
            console.error('Data Fetch Error:', error);
            toast.error('Failed to load settlement data');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDownloadPdf = async () => {
        if (!reportRef.current || !expense) return;
        
        setIsDownloading(true);
        toast.info('Generating PDF...');

        setTimeout(async () => {
            try {
                const element = reportRef.current!;
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    onclone: (clonedDoc) => {
                        // Fix for Tailwind 4 / Modern CSS color functions
                        const styleTags = clonedDoc.querySelectorAll('style');
                        styleTags.forEach(tag => {
                            if (tag.innerHTML) {
                                tag.innerHTML = tag.innerHTML
                                    .replace(/lab\([^)]+\)/g, '#000000')
                                    .replace(/oklch\([^)]+\)/g, '#000000');
                            }
                        });
                        
                        const elements = clonedDoc.querySelectorAll('[style*="lab"], [style*="oklch"]');
                        elements.forEach(el => {
                            const s = el.getAttribute('style');
                            if (s) {
                                el.setAttribute('style', s.replace(/lab\([^)]+\)/g, '#000000').replace(/oklch\([^)]+\)/g, '#000000'));
                            }
                        });
                    }
                });
                
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
                
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Settlement_Report_${expense.expenseId}.pdf`);
                
                toast.success('Report downloaded successfully');
            } catch (error) {
                console.error('PDF Generation Error:', error);
                toast.error('Failed to generate PDF. Try again.');
            } finally {
                setIsDownloading(false);
            }
        }, 100);
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50/50 p-10 flex flex-col items-center justify-center">
            <TableSkeleton />
        </div>
    );

    if (!expense) return (
        <div className="min-h-screen bg-gray-50/50 p-10 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-black text-gray-800 uppercase mb-4">Record Not Found</h1>
            <button onClick={() => router.back()} className="text-teal-600 font-black uppercase text-xs hover:underline tracking-widest">
                Go Back
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* ACTION HEADER (STICKY) */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40 print:hidden">
                <div className="max-w-[1000px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.back()}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-sm font-black text-gray-900 uppercase tracking-tight">Settlement Audit Trail</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expense ID: {expense.expenseId}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchData}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all"
                        >
                            <RotateCcw size={18} />
                        </button>
                        <button 
                            onClick={handleDownloadPdf}
                            disabled={isDownloading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/20 active:scale-95 disabled:opacity-70"
                        >
                            {isDownloading ? <Clock size={16} className="animate-spin" /> : <Download size={16} />}
                            {isDownloading ? 'Downloading...' : 'Export PDF'}
                        </button>
                    </div>
                </div>
            </div>

            {/* THE REPORT DOCUMENT */}
            <div className="max-w-[850px] mx-auto mt-10 print:mt-0 print:mx-0">
                <div ref={reportRef} className="bg-white text-black w-[210mm] min-h-[297mm] px-12 py-12 relative overflow-hidden text-[10pt] border border-slate-100 font-sans print:border-none print:shadow-none shadow-2xl">
                    
                    {/* --- HEADER --- */}
                    <div className="flex justify-between items-start mb-10 border-b-2 border-slate-900 pb-6">
                        <div className="text-[8pt] text-slate-700 space-y-0.5 pt-2">
                            <div className="flex items-center gap-1 mb-2">
                                <div className="w-1.5 h-1.5 bg-[#0f766e] rounded-full" />
                                <p className="font-black text-[10pt] text-slate-900 tracking-tighter uppercase">PROSERVE TRADING & SERVICES</p>
                            </div>
                            <p>Mob: +974 3030 3613 | P.O. Box: 9044</p>
                            <p className="font-black text-slate-900 mt-1 uppercase tracking-tight">Doha - State of Qatar</p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-40 h-16 mb-2">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                        </div>

                        <div className="text-right">
                            <h1 className="text-xl font-black uppercase text-[#0f766e] tracking-[0.05em] leading-none mb-2 text-wrap w-40">Expense Settlement Audit</h1>
                            <div className="text-[7pt] font-black uppercase text-slate-400 tracking-widest bg-slate-50 px-2 py-1 rounded inline-block">
                                Financial Reconcilation
                            </div>
                        </div>
                    </div>

                    {/* --- SUMMARY BOX --- */}
                    <div className="mb-10 overflow-hidden border-2 border-slate-900">
                        <div className="bg-slate-900 text-white px-4 py-2 text-[8pt] font-black uppercase tracking-[0.1em] flex justify-between">
                            <span>Executive Settlement Summary</span>
                            <span>{expense.status.replace('_', ' ')}</span>
                        </div>
                        <div className="grid grid-cols-3 divide-x-2 divide-slate-900 bg-slate-50 text-center">
                            <div className="p-4">
                                <span className="block text-[7pt] font-black text-slate-400 uppercase tracking-widest mb-1">Original Liability</span>
                                <span className="text-lg font-black text-slate-900">QAR {expense.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="p-4 bg-emerald-50">
                                <span className="block text-[7pt] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Settled</span>
                                <span className="text-lg font-black text-emerald-700">QAR {expense.paidTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="p-4 bg-rose-50">
                                <span className="block text-[7pt] font-black text-rose-600 uppercase tracking-widest mb-1">Current Balance</span>
                                <span className="text-lg font-black text-rose-700">QAR {expense.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* --- EXPENSE DETAILS GRID --- */}
                    <div className="grid grid-cols-2 gap-0 border border-slate-800 border-b-0 mb-10">
                        <div className="p-4 border-r border-b border-slate-800">
                            <span className="text-[7pt] font-black text-slate-400 uppercase tracking-widest block mb-1">Beneficiary</span>
                            <div className="text-sm font-black text-slate-900 uppercase">{(expense as any).companyName || 'N/A'}</div>
                        </div>
                        <div className="p-4 border-b border-slate-800 bg-slate-50/50">
                            <span className="text-[7pt] font-black text-slate-400 uppercase tracking-widest block mb-1">Expense Date</span>
                            <div className="text-sm font-black text-slate-800 uppercase">{format(new Date(expense.date), 'dd MMMM yyyy')}</div>
                        </div>
                        <div className="p-4 border-r border-b border-slate-800 bg-slate-50/50">
                            <span className="text-[7pt] font-black text-slate-400 uppercase tracking-widest block mb-1">Category</span>
                            <div className="text-sm font-black text-slate-800 uppercase">{expense.category}</div>
                        </div>
                        <div className="p-4 border-b border-slate-800">
                            <span className="text-[7pt] font-black text-slate-400 uppercase tracking-widest block mb-1">Reference No</span>
                            <div className="text-sm font-black text-slate-800 uppercase">{expense.referenceNo || 'N/A'}</div>
                        </div>
                    </div>

                    {/* --- SETTLEMENT TIMELINE --- */}
                    <div className="mb-10 min-h-[400px]">
                        <h3 className="text-[10pt] font-black uppercase tracking-tight text-slate-900 mb-4 ml-1 flex items-center gap-2">
                            <div className="w-1 h-4 bg-[#0f766e]" />
                            1. Payment Registry (Settlement History)
                        </h3>
                        <table className="w-full text-left border-collapse border-b border-slate-200">
                            <thead>
                                <tr className="bg-slate-100 border-y-2 border-slate-900 text-[8pt] font-black text-slate-900 uppercase">
                                    <th className="px-4 py-3 w-12 text-center">S/N</th>
                                    <th className="px-4 py-3">Payment details</th>
                                    <th className="px-4 py-3">Mode</th>
                                    <th className="px-4 py-3">Voucher/TXN</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[9pt]">
                                {payments.length > 0 ? payments.map((payment, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-black text-slate-900 uppercase">QAR Payment</div>
                                            <div className="text-[7pt] font-bold text-slate-400 tracking-widest uppercase">{format(new Date(payment.date), 'dd MMM yyyy')}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-[8pt] font-bold text-slate-600 uppercase italic">{payment.modeOfPayment}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-[8pt] font-black text-slate-700">{payment.voucherNo || payment.transactionId || '---'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-black text-emerald-700">QAR {payment.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-slate-400 italic font-medium uppercase tracking-widest text-[8pt]">
                                            No payment records found for this expense liability.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* --- CALCULATION FOOTER --- */}
                        {payments.length > 0 && (
                            <div className="flex justify-end mt-4">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between items-center text-[8pt] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Total Settled</span>
                                        <span className="text-slate-900">QAR {expense.paidTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10pt] font-black text-[#0f766e] uppercase border-t border-slate-200 pt-2">
                                        <span>Current Balance</span>
                                        <span>QAR {expense.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- FINAL CERTIFICATION --- */}
                    <div className="mt-auto border-t-2 border-slate-900 pt-10 pb-6">
                        <div className="grid grid-cols-2 gap-20">
                            <div className="text-center">
                                <div className="border-b-2 border-dotted border-slate-300 h-10 mb-2"></div>
                                <p className="text-[8pt] font-black uppercase text-slate-400 tracking-widest">Compiled By</p>
                                <p className="text-[10pt] font-black text-slate-900 mt-1 uppercase">{typeof expense.createdBy === 'object' ? (expense.createdBy as any).name : 'FINANCE DEPT.'}</p>
                            </div>
                            <div className="text-center">
                                <div className="border-b-2 border-dotted border-slate-400 h-10 mb-2"></div>
                                <p className="text-[8pt] font-black uppercase text-slate-400 tracking-widest">Authorized Internal Audit</p>
                                <p className="text-[10pt] font-black text-[#0f766e] mt-1 uppercase italic tracking-tighter underline">SETTLEMENT VERIFIED</p>
                            </div>
                        </div>
                        
                        <div className="mt-12 flex justify-between items-end border-t border-slate-100 pt-4">
                            <div className="flex items-center gap-2 text-[7pt] text-slate-400 font-bold uppercase tracking-widest">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                Official Financial Document • Confidential
                            </div>
                            <div className="text-[7pt] font-black text-slate-900">
                                PROSERVE &copy; {new Date().getFullYear()} ALL RIGHTS RESERVED
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withAuth(SettlementReportPage);
