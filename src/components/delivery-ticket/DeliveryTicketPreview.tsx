"use client"

import { DeliveryTicket } from '@/lib/types';
import html2pdf from 'html2pdf.js';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeliveryTicketPreviewProps {
    data: Partial<DeliveryTicket>;
    onBack?: () => void;
    onConfirm?: () => void;
    onEdit?: () => void;
    isSubmitting?: boolean;
    mode?: 'create' | 'view';
}

const DeliveryTicketPreview = ({
    data,
    onBack,
    onConfirm,
    onEdit,
    isSubmitting = false,
    mode = 'create',
}: DeliveryTicketPreviewProps) => {
    // Force A4 print styles
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
                top: -0mm !important;
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
            /* Force table borders and standard colors */
            table, th, td { 
                border: 0.5pt solid #94a3b8 !important; 
                border-collapse: collapse !important; 
            }
            .border-gray-400, .border-r, .border-b, .border-t, .border-l, .border {
                border-color: #94a3b8 !important;
            }
            .bg-gray-100 { background-color: #f1f5f9 !important; }
            .bg-gray-50 { background-color: #f8fafc !important; }
            .bg-teal-600 { background-color: #0d9488 !important; }
            
            * {
                --color-teal-600: #0d9488 !important;
                --color-teal-700: #0f766e !important;
                --color-red-600: #dc2626 !important;
                --color-slate-900: #0f172a !important;
                --color-emerald-600: #059669 !important;
                --color-gray-100: #f1f5f9 !important;
                --color-gray-400: #94a3b8 !important;
            }
        }
    `;

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        // Format: DD-Mon-YYYY (e.g. 29-Nov-2025)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${d.getDate().toString().padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    };

    /*
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (isDownloading) return;

        const element = document.querySelector('.a4-container') as HTMLElement;
        if (!element) {
            toast.error('Preview element not found');
            return;
        }

        setIsDownloading(true);
        const toastId = toast.loading('Generating PDF...');

        try {
            const html2pdf = (await import('html2pdf.js')).default;

            // Fix for images: Convert logo to Base64 to avoid CORS issues during capture
            const logoImg = element.querySelector('img[alt="Company Logo"]') as HTMLImageElement;
            let logoBase64 = '';
            if (logoImg) {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = logoImg.naturalWidth;
                    canvas.height = logoImg.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(logoImg, 0, 0);
                        logoBase64 = canvas.toDataURL('image/png');
                    }
                } catch (e) {
                    console.warn('Could not convert logo to base64', e);
                }
            }

            const opt = {
                margin: 0,
                filename: `DeliveryNote_${data.ticketNo || 'Draft'}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    onclone: (clonedDoc: Document) => {
                        // 1. Clean the clone: Remove ALL UI elements that are not the A4 container
                        const uiElements = clonedDoc.querySelectorAll('nav, aside, button, .sidebar, .navbar, .no-print, header:not(.a4-container header)');
                        uiElements.forEach(el => el.remove());

                        // 2. Replace logo with Base64
                        if (logoBase64) {
                            const clonedLogo = clonedDoc.querySelector('img[alt="Company Logo"]') as HTMLImageElement;
                            if (clonedLogo) clonedLogo.src = logoBase64;
                        }

                        // 2. COMPATIBILITY FIX: Override Tailwind 4 variables with safe colors
                        // Instead of removing links, we override the variables they use.
                        const styleOverride = clonedDoc.createElement('style');
                        styleOverride.innerHTML = `
                            :root, .a4-container {
                                --color-teal-600: #0d9488 !important;
                                --color-teal-700: #0f766e !important;
                                --color-emerald-600: #059669 !important;
                                --color-red-600: #dc2626 !important;
                                --color-slate-900: #0f172a !important;
                                --color-gray-100: #f3f4f6 !important;
                                --color-gray-400: #9ca3af !important;
                                --color-gray-500: #6b7280 !important;
                            }
                            // Force standard colors for common classes used in the document
                            .text-teal-600 { color: #0d9488 !important; }
                            .text-red-600 { color: #dc2626 !important; }
                            .text-emerald-600 { color: #059669 !important; }
                            .bg-teal-600 { background-color: #0d9488 !important; }
                            .bg-emerald-600 { background-color: #059669 !important; }
                            .bg-gray-100 { background-color: #f3f4f6 !important; }
                            .bg-gray-50 { background-color: #f9fafb !important; }
                            .border-gray-400 { border-color: #9ca3af !important; }
                            .border-teal-600 { border-color: #0d9488 !important; }
                            
                            // Ensure container is clean and has same padding as print
                            .a4-container { 
                                box-shadow: none !important; 
                                margin: 0 !important;
                                padding: 10mm !important;
                                border: none !important;
                                width: 210mm !important;
                                height: 297mm !important;
                                background-color: white !important;
                                box-sizing: border-box !important;
                                position: relative !important;
                                top: -3mm !important;
                                left: -11mm !important;
                            }
                            table, th, td { border: 0.5pt solid #94a3b8 !important; border-collapse: collapse !important; }
                        `;
                        clonedDoc.head.appendChild(styleOverride);

                        // 3. SANITIZATION: Clean any remaining problematic syntax in existing style tags
                        const colorRegex = /(oklch|okrgb|lab|oklab)\s*\([^)]+\)/gi;
                        const styles = Array.from(clonedDoc.getElementsByTagName('style'));
                        styles.forEach(style => {
                            if (style.innerHTML && style !== styleOverride) {
                                style.innerHTML = style.innerHTML.replace(colorRegex, '#111827');
                            }
                        });
                    }
                },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            await html2pdf().from(element).set(opt).save();
            toast.success('PDF downloaded successfully', { id: toastId });
        } catch (err: any) {
            console.error('PDF Error:', err);
            toast.error(`Download failed: \${err.message || 'Unknown error'}. Please use Print button.`, { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };
    */

    // Fill empty rows to maintain document height
    const MAX_ROWS = 14
    const filledRows = [...(data.items || [])];
    const emptyRowsCount = Math.max(0, MAX_ROWS - filledRows.length);
    const emptyRows = Array(emptyRowsCount).fill(null);

    const totalQuantity = data.items?.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0) || 0;

    return (
        <div className="w-full min-h-screen bg-gray-200 py-4 px-4 flex flex-col items-center print:bg-white print:py-0 print:px-0">
            <style>{printStyles}</style>
            {/* Action Bar */}
            <div className="mb-6 flex gap-4 print:hidden w-full max-w-[210mm] justify-between items-center">
                <div className="text-sm text-gray-600 font-medium">
                    {mode === 'create' ? `Preview Mode - ${filledRows.length} Items` : 'Document Viewer'}
                </div>
                <div className="flex gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-gray-600 text-white rounded shadow hover:bg-gray-700 transition font-medium text-sm"
                        >
                            {mode === 'create' ? 'Back' : 'Go Back'}
                        </button>
                    )}
                    {mode === 'view' && onEdit && (
                        <button
                            onClick={onEdit}
                            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition font-bold text-sm"
                        >
                            Edit Ticket
                        </button>
                    )}
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded shadow hover:bg-emerald-700 transition font-bold flex items-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print
                    </button>
                    {/* 
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className={`px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition font-bold flex items-center gap-2 text-sm ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isDownloading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Downloading...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Download PDF
                            </>
                        )}
                    </button>
                    */}
                    {mode === 'create' && onConfirm && (
                        <button
                            onClick={onConfirm}
                            disabled={isSubmitting}
                            className={`px-6 py-2 text-white rounded shadow-md transition font-bold flex items-center gap-2 text-sm ${isSubmitting ? 'bg-gray-400' : 'bg-sky-700 hover:bg-sky-800'
                                }`}
                        >
                            {isSubmitting ? 'Confirming...' : 'Confirm & Create'}
                        </button>
                    )}
                </div>
            </div>

            {/* A4 Container */}
            <div className="bg-white text-black shadow-2xl w-[210mm] h-[297mm] px-10 pt-10 pb-16 relative print:shadow-none print:w-[210mm] print:h-[297mm] overflow-hidden font-sans text-[10pt] a4-container flex flex-col">

                {/* 1. Header Section */}
                <div className="flex justify-between items-start mb-2 border-b border-[#0f766e] pb-1">
                    {/* Left: Contact Info */}
                    <div className="w-[35%] text-[6.5pt] text-gray-700 space-y-0 pt-0.5">
                        <p className="font-bold text-[8pt] mb-0.5 text-[#0f766e]">AKOD TRADING & SERVICES WLL</p>
                        <p>Mob: +974 3030 3613</p>
                        <p>Tel: +974 4421 4042</p>
                        <p>E-mail: info@akod.com</p>
                        <p>Website: www.akod.com</p>
                    </div>

                    {/* Center: Logo & Title */}
                    <div className="w-[30%] flex flex-col items-center">
                        <div className="w-32 h-12 mb-0.5">
                            <img
                                src="/logo.png"
                                alt="Company Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <h2 className="text-[11pt] font-black uppercase text-gray-800 tracking-wider underline decoration-1 underline-offset-2 decoration-[#0f766e]">Delivery Note</h2>
                    </div>

                    {/* Right: Address Info */}
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
                    {/* Row 1 - Customer and DN Details */}
                    <div className="flex border-b border-gray-400 items-stretch">
                        {/* Top Left: Customer Details */}
                        <div className="w-[50%] border-r border-gray-400 p-0.5 flex flex-col justify-center items-center text-center bg-[#f0fdfa] relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600"></div>
                            <p className="text-[#0f766e] mb-0 text-[7px] font-black uppercase tracking-[0.2em] opacity-70">Company Name</p>
                            <p className="font-black uppercase text-[9.5pt] text-slate-900 leading-tight drop-shadow-sm px-2">{data.customerName}</p>
                        </div>

                        {/* Top Right: DN Details */}
                        <div className="w-[50%] text-[7px] flex flex-col">
                            <div className="flex border-b border-gray-400 min-h-[20px] items-stretch">
                                <div className="w-32 p-1 border-r border-gray-400 bg-gray-100 font-bold flex items-center px-2 uppercase text-[6.5px]">Delivery Note No.</div>
                                <div className="flex-grow p-1 font-black pl-3 text-red-600 text-[8.5pt] break-words flex items-center">{data.ticketNo}</div>
                            </div>
                            <div className="flex border-b border-gray-400 min-h-[20px] items-stretch">
                                <div className="w-32 p-1 border-r border-gray-400 bg-gray-100 font-bold flex items-center px-2 uppercase text-[6.5px]">Date</div>
                                <div className="flex-grow p-1 pl-3 font-black text-[8pt] break-words flex items-center">{formatDate(data.deliveryDate)}</div>
                            </div>
                            <div className="flex border-b border-gray-400 min-h-[20px] items-stretch">
                                <div className="w-32 p-1 border-r border-gray-400 bg-gray-100 font-bold flex items-center px-2 uppercase text-[6.5px]">Invoice Number</div>
                                <div className="flex-grow p-1 pl-3 font-black text-emerald-600 text-[8pt] break-words flex items-center">{data.invoiceNo || 'N/A'}</div>
                            </div>
                            <div className="flex border-b border-gray-400 min-h-[20px] items-stretch">
                                <div className="w-32 p-1 border-r border-gray-400 bg-gray-100 font-bold flex items-center px-2 uppercase text-[6.5px]">Service Type</div>
                                <div className="flex-grow p-1 pl-3 font-black uppercase text-[8pt] break-words flex items-center">{data.noteCategory}</div>
                            </div>
                            <div className="flex min-h-[20px] items-stretch">
                                <div className="w-32 p-1 bg-gray-100 font-bold flex items-center border-r border-gray-400 px-2 uppercase text-[6.5px]">LPO NO.</div>
                                <div className="flex-grow p-1 pl-3 font-black uppercase text-[8pt] break-words flex items-center">{data.poNo}</div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Row */}
                    <div className="flex items-stretch border-b border-gray-400">
                        {/* Middle Left: Location */}
                        <div className="w-[50%] border-r border-gray-400 flex flex-col">
                            <div className="flex border-b border-gray-400 min-h-[28px] items-stretch flex-1">
                                <div className="w-28 p-1 border-r border-gray-400 bg-gray-100 font-bold flex items-center px-2 uppercase text-[6.5px]">Delivered From</div>
                                <div className="flex-grow p-1 pl-3 font-medium text-slate-800 text-[8pt] break-words leading-tight flex items-center">{data.subject}</div>
                            </div>
                            <div className="flex min-h-[28px] items-stretch flex-1">
                                <div className="w-28 p-1 border-r border-gray-400 bg-gray-100 font-bold flex items-center px-2 uppercase text-[6.5px]">Delivery Location</div>
                                <div className="flex-grow p-1 pl-3 font-medium text-slate-800 text-[8pt] break-words leading-tight flex items-center">{data.projectLocation}</div>
                            </div>
                        </div>

                        {/* Middle Right: Vehicle & Driver */}
                        <div className="w-[50%] text-[8px] flex flex-col">
                            <div className="flex border-b border-gray-400 min-h-[28px] items-stretch flex-1">
                                <div className="w-32 p-1 border-r border-gray-400 bg-gray-50 font-bold flex items-center px-2 uppercase text-[6.5px]">Vehicle No</div>
                                <div className="flex-grow p-1 pl-3 uppercase font-black text-gray-900 text-[8pt] break-words flex items-center">{data.vehicleNo}</div>
                            </div>
                            <div className="flex min-h-[28px] items-stretch flex-1">
                                <div className="w-32 p-1 border-r border-gray-400 bg-gray-50 font-bold flex items-center px-2 uppercase text-[6.5px]">Driver Name</div>
                                <div className="flex-grow p-1 pl-3 uppercase font-black text-[8pt] break-words leading-tight flex items-center">{data.driverName || ''}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Items Table - Fixed 10 Row Layout */}
                <div className="border border-gray-400 mb-1 bg-white">
                    <table className="w-full text-[7.5pt] table-fixed border-collapse">
                        <thead>
                            <tr className="border-b border-gray-400 bg-gray-100">
                                <th className="w-10 border-r border-gray-400 py-1.5 font-black text-black uppercase text-[7px] tracking-widest text-center">S.N</th>
                                <th className="w-auto border-r border-gray-400 py-1.5 font-black text-black uppercase text-[7px] tracking-widest text-left pl-3">Item Description</th>
                                <th className="w-24 border-r border-gray-400 py-1.5 font-black text-black uppercase text-[7px] tracking-widest text-center">Quantity</th>
                                <th className="w-36 border-r border-gray-400 py-1.5 font-black text-black uppercase text-[7px] tracking-widest text-left pl-3">Remark / Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filledRows.map((item, idx) => (
                                <tr key={idx} className="align-top min-h-[32px]">
                                    <td className="border-r border-gray-400 text-center text-gray-500 py-2 font-bold text-[7pt]">{idx + 1}</td>
                                    <td className="border-r border-gray-400 px-3 py-2 text-gray-800 uppercase leading-tight">
                                        <div className="font-bold text-[8.5pt] text-slate-900 mb-0.5">{item.name}</div>
                                        {item.itemCode && <div className="text-[6.5px] font-bold text-gray-400 tracking-wider">CODE: {item.itemCode}</div>}
                                    </td>
                                    <td className="border-r border-gray-400 text-center py-2 bg-slate-50/30">
                                        <div className="font-black text-[10pt] leading-none text-[#0f766e]">{item.quantity}</div>
                                        <div className="text-[6.5px] font-bold text-gray-500 uppercase tracking-tighter mt-1">{item.unit}</div>
                                    </td>
                                    <td className="border-r border-gray-400 px-3 py-2 text-gray-600 text-[7.5pt] font-medium normal-case break-words leading-tight">
                                        {item.description || ''}
                                    </td>
                                </tr>
                            ))}
                            {/* Empty Filler Rows to maintain structure */}
                            {emptyRows.map((_, idx) => (
                                <tr key={`empty-${idx}`} className="h-8">
                                    <td className="border-r border-gray-400"></td>
                                    <td className="border-r border-gray-400"></td>
                                    <td className="border-r border-gray-400"></td>
                                    <td className="border-r border-gray-400"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Total Quantity Row - Perfectly Aligned with Qty Column */}
                    <div className="border-t border-gray-400 flex text-xs font-black h-9 items-center bg-gray-50 uppercase tracking-widest">
                        {/* Spans SN and Item Description columns */}
                        <div className="flex-grow text-right pr-6 border-r border-gray-400 h-full flex items-center justify-end text-gray-400 text-[7px] font-black">
                            Total Quantity
                        </div>
                        {/* Aligned with Quantity column (w-24) */}
                        <div className="w-24 border-r border-gray-400 h-full bg-white flex items-center justify-center">
                            <div className="text-center text-[#0f766e] text-[11pt] tabular-nums font-black">{totalQuantity}</div>
                        </div>
                        {/* Aligned with Remark column (w-36) */}
                        <div className="w-36 h-full bg-gray-50"></div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-1 px-2 mt-2">
                    <div className="text-right text-[7.5pt] font-bold italic tracking-widest text-gray-400">Received above items in good condition</div>
                    <div className="text-right text-[7.5pt] font-bold italic tracking-widest text-gray-400">E & O.E</div>
                </div>

                {/* 4. Footer Signatures - AKOD Style Dotted */}
                <div className="mt-2 pt-0.5 pb-1">
                    <div className="flex justify-between items-start gap-12 font-bold text-xs text-gray-800 uppercase tracking-tight">
                        <div className="w-1/2 flex flex-col gap-2">
                            <div className="flex border-b border-dotted border-gray-300 pb-0.5 items-baseline">
                                <span className="w-20 flex-shrink-0 text-gray-400 text-[7px] font-black uppercase">Delivered By:</span>
                                <span className="flex-grow px-2 text-slate-900 font-bold text-[8.5pt] tracking-tight">{data.deliveredBy?.deliveredByName || ''}</span>
                            </div>
                            <div className="flex border-b border-dotted border-gray-300 pb-0.5 items-baseline">
                                <span className="w-20 flex-shrink-0 text-gray-400 text-[7px] font-black uppercase">Mob No:</span>
                                <span className="flex-grow px-2 font-bold text-[8.5pt] tracking-tight">{data.deliveredBy?.deliveredByMobile}</span>
                            </div>
                            <div className="flex border-b border-dotted border-gray-300 pb-0.5 items-baseline">
                                <span className="w-20 flex-shrink-0 text-gray-400 text-[7px] font-black uppercase">Date:</span>
                                <span className="flex-grow px-2 font-bold text-[8.5pt] tracking-tight">{formatDate(data.deliveredBy?.deliveredDate)}</span>
                            </div>
                            {/* Spacer to align with Right side QID field - Completely Invisible */}
                            <div className="flex pb-0.5 items-baseline">
                                <span className="w-20 flex-shrink-0 text-gray-400 text-[7px] font-black uppercase invisible">Spacer:</span>
                                <span className="flex-grow px-2 font-bold text-[8.5pt] tracking-tight invisible">Placeholder</span>
                            </div>
                            <div className="flex border-b border-dotted border-gray-300 pb-0.5 items-baseline mt-0.5">
                                <span className="w-20 flex-shrink-0 text-gray-400 text-[7px] font-black uppercase">Signature:</span>
                                <div className="flex-grow h-4"></div>
                            </div>
                        </div>

                        {/* Right: Received By */}
                        <div className="w-1/2 flex flex-col gap-2">
                            <div className="flex border-b border-dotted border-gray-300 pb-0.5 items-baseline">
                                <span className="w-20 flex-shrink-0 text-gray-400 text-[7px] font-black uppercase">Received By:</span>
                                <span className="flex-grow px-2 text-slate-900 font-bold text-[8.5pt] tracking-tight truncate">{data.receivedBy?.receivedByName}</span>
                            </div>
                            <div className="flex border-b border-dotted border-gray-300 pb-0.5 items-baseline">
                                <span className="w-20 flex-shrink-0 text-gray-400 text-[7px] font-black uppercase">Mob No:</span>
                                <span className="flex-grow px-2 font-bold text-[8.5pt] tracking-tight">{data.receivedBy?.receivedByMobile}</span>
                            </div>
                            <div className="flex border-b border-dotted border-gray-300 pb-0.5 items-baseline">
                                <span className="w-20 flex-shrink-0 text-gray-400 text-[7px] font-black uppercase">Date:</span>
                                <span className="flex-grow px-2 font-bold text-[8.5pt] tracking-tight">{formatDate(data.receivedBy?.receivedDate)}</span>
                            </div>
                            <div className="flex border-b border-dotted border-gray-300 pb-0.5 items-baseline">
                                <span className="w-20 flex-shrink-0 text-gray-400 text-[7px] font-black uppercase">QID:</span>
                                <span className="flex-grow px-2 font-bold text-[8.5pt] tracking-tight">{data.receivedBy?.qatarId || ''}</span>
                            </div>
                            <div className="flex border-b border-dotted border-gray-300 pb-0.5 items-baseline mt-0.5">
                                <span className="w-20 flex-shrink-0 text-gray-400 text-[7px] font-black uppercase">Signature:</span>
                                <div className="flex-grow h-4"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. Company Footer - Solid Green Bar */}
                <div className="absolute bottom-0 left-0 right-0">
                    {/* 5. Bottom Note */}
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
        </div>

    );

};

export default DeliveryTicketPreview;
