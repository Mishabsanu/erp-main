'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import RunningOrderReport from '@/components/running-order/RunningOrderReport';
import { useAuth } from '@/contexts/AuthContext';
import { RunningOrder } from '@/lib/types';
import { getRunningOrderById, getRunningOrderFulfillment } from '@/services/runningOrderApi';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  FileText,
  Hash,
  History,
  Layers,
  Package,
  Truck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Order placed': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Production going on': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
    case 'Ready to dispatch': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
    case 'Loaded': return { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' };
    case 'On the way to port': return { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' };
    case 'Arrive at port': return { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' };
    case 'Depart from port': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'In transit to destination': return { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'Arrived at destination': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
    case 'Completed': return { bg: 'bg-emerald-700', text: 'text-white', border: 'border-emerald-800' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  }
};

interface ViewRunningOrderPageProps {
  params: Promise<{ id: string }>;
}

const ViewRunningOrderPage = ({ params: paramsPromise }: ViewRunningOrderPageProps) => {
  const router = useRouter();
  const params = use(paramsPromise);
  const { id } = params;
  const { can } = useAuth();

  const [order, setOrder] = useState<RunningOrder | null>(null);
  const [fulfillment, setFulfillment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!order) return;
    if (!reportRef.current) {
      toast.error('Report is not ready for download. Please wait a moment.');
      return;
    }

    setIsDownloading(true);
    toast.info('Generating PDF...');

    // Small timeout to keep UI responsive
    setTimeout(async () => {
      try {
        const element = reportRef.current!;

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          onclone: (clonedDoc) => {
            // Robust fix for Tailwind 4 / Modern CSS color functions
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
        pdf.save(`Audit_Report_${order.order_number}.pdf`);

        toast.success('Audit Report downloaded successfully');
      } catch (error) {
        console.error('PDF Generation Error:', error);
        toast.error('Failed to generate PDF. Try again.');
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  };

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const [orderData, fulfillmentData] = await Promise.all([
          getRunningOrderById(id as string),
          getRunningOrderFulfillment(id as string)
        ]);
        setOrder(orderData);
        setFulfillment(fulfillmentData);
      } catch (error) {
        toast.error('Failed to fetch order details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center text-center p-6">
      <h2 className="text-2xl font-black text-gray-800 mb-4">Order record not found</h2>
      <button onClick={() => router.push('/running-order')} className="text-[#0f766e] font-black uppercase tracking-widest text-xs hover:underline">
        Return to list
      </button>
    </div>
  );

  const statusStyle = getStatusColor(order.status);
  const totalQty = order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] pb-20">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/running-order')}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                  {order.invoice_number}
                </h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Running Order Details • {order.po_number || 'NO PO'} • Authorized By {typeof (order as any).createdBy === 'object' ? (order as any).createdBy.name : 'System'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {can('running_order', 'view') && (
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className={`flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-xl shadow-sky-900/10 transition-all \${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isDownloading ? (
                    <Clock className="animate-spin" size={16} />
                  ) : (
                    <Download size={16} />
                  )}
                  {isDownloading ? 'Generating...' : 'Audit PDF'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-xl shadow-emerald-900/10 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Print Report
                </button>
              </div>
            )}
            {can('running_order', 'update') && (
              <button
                onClick={() => router.push(`/running-order/edit/${id}`)}
                className="flex items-center justify-center gap-2 bg-[#0f766e] hover:bg-[#0d9488] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-xl shadow-teal-900/10 transition-all"
              >
                <Edit2 size={16} />
                Modify Order
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* STATS OVERVIEW */}
          <div className="lg:col-span-2 space-y-10">
            {/* CORE METADATA CARD */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/40 p-10">
              <h2 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                <FileText size={14} className="text-[#0f766e]" />
                Order Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <DetailItem label="Company Name" value={order.company_name || '---'} icon={Truck} />
                <DetailItem label="Order Date" value={order.ordered_date ? format(new Date(order.ordered_date), 'dd MMM yyyy') : '---'} icon={Calendar} />
                <DetailItem label="Invoice Number" value={order.invoice_number || '---'} icon={FileText} />
                <DetailItem label="PO Number" value={order.po_number || '---'} icon={Hash} />
                <DetailItem label="Service Type" value={order.transaction_type || 'Sale'} icon={Layers} />
                <DetailItem label="Sales Person" value={order.sales_person || '---'} icon={CheckCircle2} />
              </div>
            </div>

            {/* FULFILLMENT & TRACKING MANIFEST */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/40 p-10">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Package size={14} className="text-[#0f766e]" />
                  Fulfillment & Tracking Manifest
                </h2>
                <div className="bg-[#0f766e]/5 border border-[#0f766e]/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#0f766e] uppercase">{totalQty} Ordered Units</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="pb-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Product details</th>
                      <th className="pb-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Ordered</th>
                      <th className="pb-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Delivered</th>
                      <th className="pb-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Returned</th>
                      <th className="pb-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">Status / Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(fulfillment?.items || order.items)?.map((item: any, index: number) => {
                      const pendingQty = item.pendingQty ?? (item.quantity - (item.deliveredQty || 0));
                      return (
                        <tr key={index} className="group hover:bg-gray-50/50 transition-all">
                          <td className="py-6 pl-2">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-gray-800 uppercase tracking-tight">{item.name}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.itemCode || '---'}</span>
                            </div>
                          </td>
                          <td className="py-6 px-4 text-center">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{item.orderedQty || item.quantity} {item.unit}</span>
                          </td>
                          <td className="py-6 px-4 text-center">
                            <span className="text-xs font-black text-[#0f766e] uppercase tracking-widest">{item.deliveredQty || 0}</span>
                          </td>
                          <td className="py-6 px-4 text-center">
                            <span className="text-xs font-black text-rose-500 uppercase tracking-widest">{item.returnedQty || 0}</span>
                          </td>
                          <td className="py-6 pr-2 text-right">
                            <div className={`inline-flex items-center px-4 py-1.5 rounded-full 
                              ${item.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : item.status === 'Partially Completed'
                                  ? 'bg-teal-50 text-teal-700 border border-teal-100'
                                  : 'bg-amber-50 text-amber-600 border border-amber-100'
                              }`}>
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                {item.status || 'Pending'}
                              </span>
                            </div>
                            {item.status !== 'Completed' && (
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-1 mr-2">
                                {pendingQty} Units Left
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TICKET LOG / HISTORY */}
            {fulfillment && (fulfillment.tickets.deliveries.length > 0 || fulfillment.tickets.returns.length > 0) && (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/40 p-10">
                <h2 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                  <History size={14} className="text-[#0f766e]" />
                  Operational History (DN/RN Log)
                </h2>

                <div className="space-y-4">
                  {[...fulfillment.tickets.deliveries.map((d: any) => ({ ...d, type: 'DN' })),
                  ...fulfillment.tickets.returns.map((r: any) => ({ ...r, type: 'RN' }))]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((ticket, idx) => (
                      <div key={idx} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:border-teal-200 transition-all group">
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${ticket.type === 'DN' ? 'bg-sky-100 text-sky-700 border-sky-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                            {ticket.type === 'DN' ? <ArrowUpRight size={18} /> : <History size={18} />}
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-900 tracking-tight uppercase">{ticket.type === 'DN' ? 'Delivery Note' : 'Return Note'} • {ticket.ticketNo}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(new Date(ticket.date), 'dd MMM yyyy')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-gray-800">{ticket.qty} Units</p>
                          <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.1em] opacity-0 group-hover:opacity-100 transition-all cursor-pointer">View Ticket</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR LOGISTICS */}
          <div className="space-y-10 text-left">
            <div className="bg-[#0f172a] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/20">
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                <Activity size={14} className="text-[#14b8a6]" />
                Process Health
              </h2>

              <div className="space-y-6">
                <StatusStep label="Order Initiated" date={order.ordered_date} active={true} completed={true} />
                <StatusStep label="Current State" date={format(new Date(), 'dd MMM yyyy')} active={true} status={order.status} />
                {order.etd && <StatusStep label="Estimated Departure" date={order.etd} active={false} />}
                {order.eta && <StatusStep label="Estimated Arrival" date={order.eta} active={false} />}
              </div>

              <div className="mt-10 pt-10 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Clock className="text-[#14b8a6]" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Last Updated</p>
                    <p className="text-xs font-bold text-gray-200">
                      {(order as any).updatedAt ? format(new Date((order as any).updatedAt), 'dd MMM yyyy HH:mm') : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {order.remarks && (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-xl shadow-slate-200/40">
                <h2 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-6">Internal Remarks</h2>
                <div className="p-6 bg-slate-50 rounded-2xl text-xs font-medium text-gray-600 italic leading-relaxed">
                  "{order.remarks}"
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden Report Container for PDF Generation & Printing */}
        {order && fulfillment && (
          <div className="fixed left-[-9999px] top-[-9999px] pointer-events-none print:static print:left-0 print:top-0 print:pointer-events-auto">
            <RunningOrderReport
              ref={reportRef}
              order={order}
              fulfillment={fulfillment}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-[#0f766e]">
        <Icon size={14} />
      </div>
      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-sm font-black text-gray-700 tracking-tight pl-9 uppercase">{value}</span>
  </div>
);

const StatusStep = ({ label, date, active, completed, status }: { label: string, date?: string, active: boolean, completed?: boolean, status?: string }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${active || completed ? 'bg-[#14b8a6]' : 'bg-gray-800'} ${active ? 'ring-4 ring-[#14b8a6]/20' : ''}`}>
        {completed && <CheckCircle2 size={10} className="text-white" />}
      </div>
      <div className="w-0.5 h-12 bg-white/5 mt-1" />
    </div>
    <div className="pt-0.5">
      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${active ? 'text-white' : 'text-gray-500'}`}>{label}</p>
      {status && <p className="text-xs font-bold text-[#14b8a6] mb-1">{status}</p>}
      <p className="text-[10px] font-medium text-gray-500">{date ? (date.includes(':') ? date : format(new Date(date), 'dd MMM yyyy')) : 'TBD'}</p>
    </div>
  </div>
);

export default ViewRunningOrderPage;
