'use client';

import { X, Printer, Download, IndianRupee } from 'lucide-react';
import Image from 'next/image';

interface SalarySlipViewProps {
    slip: any;
    isOpen: boolean;
    onClose: () => void;
}

export const SalarySlipView: React.FC<SalarySlipViewProps> = ({
    slip,
    isOpen,
    onClose,
}) => {
    if (!isOpen || !slip) return null;

    const handlePrint = () => {
        window.print();
    };

    const monthName = new Date(0, slip.month - 1).toLocaleString('default', { month: 'long' });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:bg-white print:p-0">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto print:max-w-none print:shadow-none print:rounded-none">

                {/* Actions - Hidden in Print */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 print:hidden">
                    <div className="flex items-center gap-4">
                        <button onClick={handlePrint} className="flex items-center gap-2 bg-[#0f766e] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#134e4a] transition-all">
                            <Printer size={16} />
                            Print Slip
                        </button>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Slip Content */}
                <div id="salary-slip" className="p-12 space-y-12">
                    {/* Company Header */}
                    <div className="flex justify-between items-start border-b-2 border-[#0f766e] pb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-[#0f766e] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-slate-900/10">
                                AK
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-[#0f766e] tracking-tighter uppercase">Akod Tech</h1>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Enterprise Solutions & IT Services</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-black text-[#0f766e] uppercase tracking-widest border-2 border-teal-700 px-6 py-2 rounded-xl inline-block">Payslip</h2>
                            <p className="text-xs font-bold text-gray-400 mt-3 uppercase tracking-widest">For the month of {monthName} {slip.year}</p>
                        </div>
                    </div>

                    {/* Employee & Pay Info */}
                    <div className="grid grid-cols-2 gap-12 text-sm">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0f766e] border-b border-teal-100 pb-2">Employee Details</h3>
                            <div className="grid grid-cols-2 gap-y-3">
                                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Name</span>
                                <span className="font-black text-[#0f766e]">{slip.user?.name}</span>

                                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Email</span>
                                <span className="font-black text-[#0f766e]">{slip.user?.email}</span>

                                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Mobile</span>
                                <span className="font-black text-[#0f766e]">{slip.user?.mobile}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0f766e] border-b border-sky-100 pb-2">Payment Details</h3>
                            <div className="grid grid-cols-2 gap-y-3">
                                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Paid Days</span>
                                <span className="font-black text-[#0f766e]">{slip.paidDays} / {slip.totalDays} Days</span>

                                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Generated On</span>
                                <span className="font-black text-[#0f766e]">{new Date(slip.createdAt).toLocaleDateString()}</span>

                                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Payment Status</span>
                                <span className="font-black text-green-600 uppercase italic">{slip.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Earnings & Deductions Table */}
                    <div className="grid grid-cols-2 gap-12 border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        {/* Earnings Table */}
                        <div className="border-r-2 border-gray-100">
                            <div className="bg-gray-50 px-8 py-4 border-b-2 border-gray-100">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#0f766e]">Earnings</h4>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="flex justify-between items-center group">
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Basic Salary</span>
                                    <span className="font-black text-[#0f766e]">₹{slip.earningsSnapshot.basic.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">HRA</span>
                                    <span className="font-black text-[#0f766e]">₹{slip.earningsSnapshot.hra.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Conveyance</span>
                                    <span className="font-black text-[#0f766e]">₹{slip.earningsSnapshot.conveyance.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Special Allowance</span>
                                    <span className="font-black text-[#0f766e]">₹{slip.earningsSnapshot.specialAllowance.toLocaleString()}</span>
                                </div>
                                <div className="pt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                                    <span className="text-xs font-black text-[#0f766e] uppercase tracking-widest">Gross Total</span>
                                    <span className="text-lg font-black text-[#0f766e]">₹{slip.totalEarnings.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deductions Table */}
                        <div>
                            <div className="bg-teal-50/30 px-8 py-4 border-b-2 border-gray-100">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#0f766e]">Deductions</h4>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Provident Fund (PF)</span>
                                    <span className="font-black text-[#0f766e]">₹{slip.deductionsSnapshot.pf.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Employee Insurance (ESI)</span>
                                    <span className="font-black text-[#0f766e]">₹{slip.deductionsSnapshot.esi.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Income Tax (TDS)</span>
                                    <span className="font-black text-[#0f766e]">₹{slip.deductionsSnapshot.tds.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Other Deductions</span>
                                    <span className="font-black text-[#0f766e]">₹{slip.deductionsSnapshot.otherDeductions.toLocaleString()}</span>
                                </div>
                                <div className="pt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                                    <span className="text-xs font-black text-[#0f766e] uppercase tracking-widest">Total Deductions</span>
                                    <span className="text-lg font-black text-[#0f766e]">₹{slip.totalDeductions.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Final Net Section */}
                    <div className="bg-gradient-to-br from-[#0f766e] to-[#134e4a] p-12 rounded-[3rem] text-white flex justify-between items-center shadow-2xl shadow-slate-900/20">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-sky-400 mb-2">Net Salary Credits (In Words)</p>
                            <p className="text-sm font-bold italic text-gray-300">Total payable salary after all deductions</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0f766e] mb-2">Net Salary</p>
                            <p className="text-5xl font-black">₹{slip.netSalary.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="pt-12 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                        This is a computer-generated document and does not require a physical signature.
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #salary-slip, #salary-slip * {
            visibility: visible;
          }
          #salary-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\:hidden {
              display: none !important;
          }
        }
      `}</style>
        </div>
    );
};
