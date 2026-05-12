'use client';

import React from 'react';
import { format } from 'date-fns';
import {
    Truck,
    RotateCcw as ReturnIcon,
} from 'lucide-react';
import { RunningOrder } from '@/lib/types';

interface RunningOrderReportProps {
    order: RunningOrder;
    fulfillment: any;
    reportDate?: Date;
}

const RunningOrderReport = React.forwardRef<HTMLDivElement, RunningOrderReportProps>(({ order, fulfillment, reportDate = new Date() }, ref) => {
    // Force A4 print styles matching Delivery Ticket
    const printStyles = `
        @page {
            size: A4;
            margin: 0mm;
        }
        @media print {
            html, body {
                overflow: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
                height: 100% !important;
                width: 100% !important;
            }
            * {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
            }
            *::-webkit-scrollbar {
                display: none !important;
            }
            body {
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .print\\:hidden, button, nav, aside, footer, .sidebar, .navbar, .no-print, header:not(.a4-container header) {
                display: none !important;
            }
            .a4-container {
                position: fixed !important;
                top: 13mm !important;
                left: -10mm !important;
                margin: 0 !important;
                padding: 10mm !important; 
                width: 210mm !important;
                height: 297mm !important;
                box-shadow: none !important;
                border: none !important;
                background: white !important;
                display: flex !important;
                flex-direction: column !important;
                overflow: hidden !important;
                box-sizing: border-box !important;
                z-index: 9999 !important;
            }
            table, th, td { 
                border-collapse: collapse !important; 
            }
            .bg-teal-600 { background-color: #0d9488 !important; }
            .bg-gray-100 { background-color: #f1f5f9 !important; }
        }
    `;

    const totalOrdered = fulfillment.items.reduce((sum: number, item: any) => sum + (Number(item.orderedQty) || 0), 0);
    const totalDispatched = fulfillment.items.reduce((sum: number, item: any) => sum + (Number(item.deliveredQty) || 0), 0);
    const totalReturned = fulfillment.items.reduce((sum: number, item: any) => sum + (Number(item.returnedQty) || 0), 0);

    return (
        <div ref={ref} className="bg-white text-black w-[210mm] h-[297mm] px-10 pt-10 pb-16 relative overflow-hidden font-sans text-[10pt] a4-container flex flex-col shadow-2xl print:shadow-none print:p-[10mm]">
            <style>{printStyles}</style>

            {/* 1. Header Section */}
            <div className="flex justify-between items-start mb-2 border-b border-[#0f766e] pb-1">
                <div className="w-[35%] text-[6.5pt] text-gray-700 space-y-0 pt-0.5">
                    <p className="font-bold text-[8pt] mb-0.5 text-[#0f766e]">AKOD TRADING & SERVICES WLL</p>
                    <p>Mob: +974 3030 3613</p>
                    <p>Tel: +974 4421 4042</p>
                    <p>E-mail: info@akod.com</p>
                    <p>Website: www.akod.com</p>
                </div>

                <div className="w-[30%] flex flex-col items-center">
                    <div className="w-32 h-12 mb-0.5">
                        <img
                            src="/logo.png"
                            alt="Company Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h2 className="text-[11pt] font-black uppercase text-gray-800 tracking-wider underline decoration-1 underline-offset-2 decoration-[#0f766e]">Running Order Report</h2>
                </div>

                <div className="w-[35%] text-[6.5pt] text-gray-700 space-y-0 pt-0.5 text-right">
                    <p>C.R. No: 147701</p>
                    <p>P.O. Box: 9044</p>
                    <p>Building No: 64</p>
                    <p>Street: 3083</p>
                    <p>Zone: 91</p>
                    <p className="font-semibold text-slate-800">Doha - Qatar</p>
                </div>
            </div>

            {/* 2. Grid Section - "AFFIX" Layout */}
            <div className="border border-gray-400 mb-2 text-sm">
                <div className="flex border-b border-gray-400 items-stretch">
                    <div className="w-[50%] border-r border-gray-400 p-0.5 flex flex-col justify-center items-center text-center bg-[#f0fdfa] relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600"></div>
                        <p className="text-[#0f766e] mb-0 text-[7px] font-black uppercase tracking-[0.2em] opacity-70">Client Entity / Consignee</p>
                        <p className="font-black uppercase text-[9.5pt] text-slate-900 leading-tight drop-shadow-sm px-2">{order.company_name}</p>
                    </div>

                    <div className="w-[50%] text-[7px] flex flex-col">
                        <div className="flex border-b border-gray-400 min-h-[20px] items-stretch">
                            <div className="w-32 p-1 border-r border-gray-400 bg-gray-100 font-bold flex items-center px-2 uppercase text-[6.5px]">Invoice Number</div>
                            <div className="flex-grow p-1 font-black pl-3 text-red-600 text-[8.5pt] break-words flex items-center">{order.invoice_number}</div>
                        </div>
                        <div className="flex border-b border-gray-400 min-h-[20px] items-stretch">
                            <div className="w-32 p-1 border-r border-gray-400 bg-gray-100 font-bold flex items-center px-2 uppercase text-[6.5px]">PO Number</div>
                            <div className="flex-grow p-1 pl-3 font-black text-emerald-600 text-[8pt] break-words flex items-center">{order.po_number || 'N/A'}</div>
                        </div>
                        <div className="flex min-h-[20px] items-stretch">
                            <div className="w-32 p-1 border-r border-gray-400 bg-gray-100 font-bold flex items-center px-2 uppercase text-[6.5px]">Report Date</div>
                            <div className="flex-grow p-1 pl-3 font-black text-[8pt] break-words flex items-center">{format(reportDate, 'dd MMM yyyy')}</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-stretch">
                    <div className="w-[50%] border-r border-gray-400 flex flex-col">
                        <div className="flex min-h-[28px] items-stretch flex-1">
                            <div className="w-32 p-1 border-r border-gray-400 bg-gray-100 font-bold flex items-center px-2 uppercase text-[6.5px]">Project Location</div>
                            <div className="flex-grow p-1 pl-3 font-medium text-slate-800 text-[8pt] break-words leading-tight flex items-center">{order.project_location || '---'}</div>
                        </div>
                    </div>

                    <div className="w-[50%] text-[8px] flex flex-col">
                        <div className="flex border-b border-gray-400 min-h-[28px] items-stretch flex-1">
                            <div className="w-32 p-1 border-r border-gray-400 bg-gray-50 font-bold flex items-center px-2 uppercase text-[6.5px]">Order Status</div>
                            <div className="flex-grow p-1 pl-3 uppercase font-black text-teal-700 text-[8pt] break-words flex items-center">{order.status}</div>
                        </div>
                        <div className="flex min-h-[28px] items-stretch flex-1">
                            <div className="w-32 p-1 border-r border-gray-400 bg-gray-50 font-bold flex items-center px-2 uppercase text-[6.5px]">Service Type</div>
                            <div className="flex-grow p-1 pl-3 uppercase font-black text-[8pt] break-words leading-tight flex items-center">{order.transaction_type}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Items Table - Matching Delivery/Return Note Style */}
            <div className="border border-gray-400 mb-1 bg-white">
                <table className="w-full text-[7.5pt] table-fixed border-collapse">
                    <thead>
                        <tr className="border-b border-gray-400 bg-gray-100">
                            <th className="w-10 border-r border-gray-400 py-1.5 font-black text-black uppercase text-[7px] tracking-widest text-center">S.N</th>
                            <th className="w-auto border-r border-gray-400 py-1.5 font-black text-black uppercase text-[7px] tracking-widest text-left pl-3">Item Description</th>
                            <th className="w-16 border-r border-gray-400 py-1.5 font-black text-black uppercase text-[7px] tracking-widest text-center">Ordered</th>
                            <th className="w-16 border-r border-gray-400 py-1.5 font-black text-black uppercase text-[7px] tracking-widest text-center">Dispatch</th>
                            <th className="w-16 border-r border-gray-400 py-1.5 font-black text-black uppercase text-[7px] tracking-widest text-center">Balance</th>
                            <th className="w-16 border-r border-gray-400 py-1.5 font-black text-black uppercase text-[7px] tracking-widest text-center">Return</th>
                            <th className="w-20 border-r border-gray-400 py-1.5 font-black text-black uppercase text-[7px] tracking-widest text-center">Stock</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {fulfillment.items.map((item: any, idx: number) => {
                            const siteBal = Math.max(0, item.deliveredQty - item.returnedQty);
                            const outBal = Math.max(0, item.orderedQty - item.deliveredQty);
                            return (
                                <tr key={idx} className="align-top min-h-[32px]">
                                    <td className="border-r border-gray-400 text-center text-gray-500 py-2 font-bold text-[7pt]">{idx + 1}</td>
                                    <td className="border-r border-gray-400 px-3 py-2 text-gray-800 uppercase leading-tight">
                                        <div className="font-bold text-[8.5pt] text-slate-900 mb-0.5">{item.name}</div>
                                        {item.itemCode && <div className="text-[6.5px] font-bold text-gray-400 tracking-wider uppercase">CODE: {item.itemCode}</div>}
                                    </td>
                                    <td className="border-r border-gray-400 text-center py-2 font-bold text-gray-600">{item.orderedQty}</td>
                                    <td className="border-r border-gray-400 text-center py-2 font-black text-[#0f766e] bg-slate-50/30">+{item.deliveredQty}</td>
                                    <td className="border-r border-gray-400 text-center py-2 font-black text-amber-600 italic">
                                        {outBal > 0 ? outBal : '-'}
                                    </td>
                                    <td className="border-r border-gray-400 text-center py-2 font-bold text-rose-500">
                                        {item.returnedQty > 0 ? `-${item.returnedQty}` : '-'}
                                    </td>
                                    <td className="border-r border-gray-400 text-center py-2 font-black text-[#0f766e] bg-teal-50">{siteBal}</td>
                                </tr>
                            );
                        })}
                        {/* Filler Rows */}
                        {fulfillment.items.length < 10 && Array(Math.max(0, 10 - fulfillment.items.length)).fill(0).map((_, i) => (
                            <tr key={`filler-${i}`} className="h-8">
                                <td className="border-r border-gray-400"></td>
                                <td className="border-r border-gray-400"></td>
                                <td className="border-r border-gray-400"></td>
                                <td className="border-r border-gray-400"></td>
                                <td className="border-r border-gray-400"></td>
                                <td className="border-r border-gray-400"></td>
                                <td className="border-r border-gray-400"></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50 uppercase tracking-widest font-black">
                        <tr className="border-t border-gray-400 h-9">
                            <td colSpan={2} className="text-right pr-6 border-r border-gray-400 text-gray-400 text-[7px] font-black">
                                Total Lifecycle Volume
                            </td>
                            <td className="border-r border-gray-400 bg-white text-center text-gray-600 text-[8pt] font-black">
                                {totalOrdered}
                            </td>
                            <td className="border-r border-gray-400 bg-white text-center text-[#0f766e] text-[8pt] font-black">
                                {totalDispatched}
                            </td>
                            <td className="border-r border-gray-400 bg-gray-50"></td>
                            <td className="border-r border-gray-400 bg-white text-center text-rose-600 text-[8pt] font-black">
                                {totalReturned}
                            </td>
                            <td className="bg-gray-50"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* 4. Logistics Appendices - Transaction History */}
            <div className="mt-4 mb-2">
                <h3 className="text-[8pt] font-black uppercase text-[#0f766e] tracking-[0.2em] mb-2 flex items-center gap-2">
                    <Truck size={12} /> Operational Transaction History (Delivery & Return Logs)
                </h3>
                <div className="grid grid-cols-2 gap-6">
                    {/* Delivery History Table */}
                    <div className="border border-gray-400 rounded-sm overflow-hidden flex flex-col">
                        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 flex items-center gap-2">
                            <Truck size={10} className="text-[#0f766e]" />
                            <span className="text-[7px] font-black uppercase tracking-widest text-gray-700">Delivery History (DN)</span>
                        </div>
                        <div className="flex-grow">
                            <table className="w-full text-[6.5pt] border-collapse table-fixed">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-300 text-gray-500 font-black uppercase">
                                        <th className="w-8 py-1 border-r border-gray-300 text-center">S.N</th>
                                        <th className="w-20 py-1 border-r border-gray-300 text-center">Date</th>
                                        <th className="w-auto py-1 border-r border-gray-300 text-center">Ticket No</th>
                                        <th className="w-12 py-1 text-center">Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fulfillment.tickets.deliveries.length > 0 ? fulfillment.tickets.deliveries.map((t: any, i: number) => (
                                        <tr key={i} className="border-b border-gray-200 hover:bg-gray-50/50">
                                            <td className="py-1 border-r border-gray-200 text-center text-gray-400">{i + 1}</td>
                                            <td className="py-1 border-r border-gray-200 text-center font-medium">{format(new Date(t.date), 'dd-MMM-yy')}</td>
                                            <td className="py-1 border-r border-gray-200 text-center font-bold text-slate-700 truncate px-1">{t.ticketNo}</td>
                                            <td className="py-1 text-center font-black text-[#0f766e]">+{t.qty}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="py-4 text-center text-gray-400 italic">No delivery records</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Return History Table */}
                    <div className="border border-gray-400 rounded-sm overflow-hidden flex flex-col">
                        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 flex items-center gap-2">
                            <ReturnIcon size={10} className="text-rose-700" />
                            <span className="text-[7px] font-black uppercase tracking-widest text-gray-700">Return History (RN)</span>
                        </div>
                        <div className="flex-grow">
                            <table className="w-full text-[6.5pt] border-collapse table-fixed">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-300 text-gray-500 font-black uppercase">
                                        <th className="w-8 py-1 border-r border-gray-300 text-center">S.N</th>
                                        <th className="w-20 py-1 border-r border-gray-300 text-center">Date</th>
                                        <th className="w-auto py-1 border-r border-gray-300 text-center">Ticket No</th>
                                        <th className="w-12 py-1 text-center">Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fulfillment.tickets.returns.length > 0 ? fulfillment.tickets.returns.map((t: any, i: number) => (
                                        <tr key={i} className="border-b border-gray-200 hover:bg-gray-50/50">
                                            <td className="py-1 border-r border-gray-200 text-center text-gray-400">{i + 1}</td>
                                            <td className="py-1 border-r border-gray-200 text-center font-medium">{format(new Date(t.date), 'dd-MMM-yy')}</td>
                                            <td className="py-1 border-r border-gray-200 text-center font-bold text-slate-700 truncate px-1">{t.ticketNo}</td>
                                            <td className="py-1 text-center font-black text-rose-600">-{t.qty}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="py-4 text-center text-gray-400 italic">No return records</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Footer Signatures */}
            <div className="mt-2 pt-2 border-t-2 border-[#0f766e]">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[7.5pt] font-bold text-slate-400 italic">E & O.E</p>
                    </div>
                    <div className="w-64 text-center">
                        <div className="border-b border-dotted border-gray-400 h-10 mb-1"></div>
                        <p className="text-[8pt] font-black uppercase text-gray-800">Authorized Signature</p>
                        <p className="text-[6.5pt] font-bold text-gray-400 uppercase tracking-widest">Sign & Date</p>
                    </div>
                </div>
            </div>

            {/* 6. Company Footer */}
            <div className="absolute bottom-0 left-0 right-0">
                <div className="text-center text-[6pt] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">
                    This is a Computer Generated Document.
                </div>
                <div className="text-center text-white font-sans bg-[#0f766e] py-2 px-10">
                    <div className="flex flex-col gap-0.5 text-[7.5pt] font-bold leading-tight tracking-wide">
                        <div className="flex items-center justify-center gap-3">
                            <span>Mob: +974 3030 3613</span>
                            <span className="w-0.5 h-0.5 bg-teal-400 rounded-full opacity-50" />
                            <span>Tel: +974 4421 4042</span>
                            <span className="w-0.5 h-0.5 bg-teal-400 rounded-full opacity-50" />
                            <span>E-mail: info@akod.com</span>
                            <span className="w-0.5 h-0.5 bg-teal-400 rounded-full opacity-50" />
                            <span>Website: www.akod.com</span>
                        </div>
                        <div className="border-t border-teal-400/20 pt-1 mt-1 text-[6.5pt] font-black uppercase tracking-widest flex items-center justify-center gap-4 opacity-80">
                            <span>C.R. No: 147701</span>
                            <span>P.O. Box: 9044</span>
                            <span>Bldg No: 64, Street: 3083, Zone: 91</span>
                            <span>Doha - State of Qatar</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
});

RunningOrderReport.displayName = 'RunningOrderReport';

export default RunningOrderReport;
