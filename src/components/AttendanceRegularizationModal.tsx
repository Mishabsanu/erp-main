'use client';

import { X, Info, FileText } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { requestRegularizationApi } from '@/services/attendanceApi';
import { toast } from 'sonner';
import { triggerAttendanceUpdate } from '@/utils/attendanceEvents';

interface AttendanceRegularizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    requests: any[]; // Pass all requests to calculate count
}

export default function AttendanceRegularizationModal({
    isOpen,
    onClose,
    date,
    requests = [],
}: AttendanceRegularizationModalProps) {
    // If no date provided, default to today
    const [targetDate, setTargetDate] = useState<Date>(date || new Date());
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    // Calculate limit
    const currentMonthRequests = requests.filter(r => {
        const d = new Date(r.requestedOn); // Use requestedOn date to count against the month made
        return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
    });
    const monthlyCount = currentMonthRequests.length;
    const limit = 7;
    const remaining = Math.max(0, limit - monthlyCount);
    const isLimitReached = remaining <= 0;

    // Determine if we should update state when prop changes
    if (date && date.getTime() !== targetDate.getTime() && isOpen) {
       // setTargetDate(date); // This could cause too many re-renders if not handled
    }

    const handleSubmit = async () => {
        if (!note.trim()) {
            toast.error('Please provide a reason for the request');
            return;
        }

        setLoading(true);
        try {
            await requestRegularizationApi(targetDate.toISOString(), note);
            toast.success('Regularization request submitted successfully');
            triggerAttendanceUpdate();
            onClose();
            setNote('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Floating Modal */}
            <div className="relative w-full max-w-[420px] bg-white shadow-[0_50px_100px_-20px_rgba(15,23,42,0.25)] rounded-[2.5rem] flex flex-col animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-500 max-h-[90vh] overflow-hidden border border-gray-100/50">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0f766e] to-[#14b8a6] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-900/10">
                            <FileText size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <div className="w-1 h-2.5 bg-[#0f766e] rounded-full" />
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Workforce Node</p>
                            </div>
                            <h2 className="text-xl font-black text-[#0f172a] tracking-tight uppercase">Presence <span className="text-[#0f766e]">Appeal</span></h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body - Compact with scroll if needed */}
                <div className="flex-1 overflow-y-auto p-8 space-y-5 no-scrollbar">

                    {/* Selected Date Card */}
                    <div className="flex gap-4 items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100 relative group">
                        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-center min-w-[75px] shadow-sm">
                            <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest opacity-60 mb-0.5">{format(targetDate, 'MMM')}</div>
                            <div className="text-2xl font-black text-[#0f172a] tracking-tighter leading-none">{format(targetDate, 'd')}</div>
                            <div className="text-[8px] text-gray-400 uppercase font-black tracking-widest opacity-50 mt-0.5">{format(targetDate, 'EEE')}</div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 opacity-70">
                                Target Date
                            </label>
                            <div className="font-black text-[#0f766e] text-base tracking-tight">
                                {format(targetDate, 'd MMMM yyyy')}
                            </div>
                        </div>

                        {/* Date Picker Overlay */}
                        <div className="absolute inset-0 opacity-0 cursor-pointer">
                            <input
                                type="date"
                                className="w-full h-full cursor-pointer"
                                value={format(targetDate, 'yyyy-MM-dd')}
                                onChange={(e) => {
                                    if (e.target.valueAsDate) setTargetDate(e.target.valueAsDate);
                                }}
                            />
                        </div>
                        <div className="mr-1 text-[8px] font-black text-[#0f766e] border border-[#0f766e]/20 bg-[#0f766e]/5 px-3 py-1.5 rounded-lg pointer-events-none uppercase tracking-widest">
                            Change
                        </div>
                    </div>

                    {/* Policy Selection */}
                    <div className="border border-sky-100 bg-sky-50/30 rounded-xl p-3">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <input
                                    type="radio"
                                    checked
                                    readOnly
                                    className="w-3 h-3 text-[#0f766e] border-gray-300 focus:ring-[#0f766e]"
                                />
                            </div>
                             <div>
                                <span className="text-[11px] font-black text-[#0f172a] block mb-0.5 leading-none">Attendance Regularization Policy</span>
                                <p className="text-[10px] text-gray-400 leading-tight font-medium">
                                    Exempt this day from penalization policy.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Balance Information */}
                    <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-dashed border-gray-200 relative">
                        <div className="p-1.5 bg-white rounded-lg text-[#0f766e] shadow-sm">
                            <Info size={12} />
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium tracking-tight">
                            Available Balance: <span className={`font-black ${isLimitReached ? 'text-rose-600' : 'text-[#0f172a]'}`}>{remaining} requests</span>
                        </span>

                        <div className="ml-auto relative group">
                            <button className="text-[8px] font-black text-[#0f766e] hover:underline focus:outline-none uppercase tracking-[0.2em] opacity-80">
                                Details
                            </button>

                            {/* Popover */}
                            <div className="absolute bottom-full right-0 mb-3 w-[260px] hidden group-hover:block z-20">
                                <div className="bg-[#0f172a] text-white rounded-xl shadow-2xl p-1 relative animate-in fade-in slide-in-from-bottom-2 duration-200 border border-white/10">
                                    <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-[#0f172a] border-b border-r border-white/10 rotate-45"></div>
                                    <div className="grid grid-cols-2 gap-3 p-3">
                                        <div className="text-[9px] font-black text-teal-400 uppercase tracking-widest opacity-70">Window</div>
                                        <div className="text-[9px] text-white text-right font-medium">Monthly Cycle</div>
                                        <div className="text-[9px] font-black text-teal-400 uppercase tracking-widest opacity-70">Used</div>
                                        <div className="text-[9px] text-white text-right font-medium">{monthlyCount} / {limit}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Note Input */}
                    <div>
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5 flex items-center gap-2 opacity-70">
                            <FileText size={12} className="text-[#0f766e]" />
                            Registry Note
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Provide a detailed reason..."
                            className="w-full px-4 py-3.5 border border-gray-100 rounded-xl focus:ring-4 focus:ring-[#0f766e]/5 focus:border-[#0f766e] outline-none transition-all resize-none h-28 text-[11px] font-medium bg-gray-50 focus:bg-white overflow-hidden shadow-inner"
                        />
                        {isLimitReached && (
                            <p className="text-[9px] text-rose-500 font-bold mt-2 uppercase tracking-widest text-center">
                                Monthly Cycle Limit Reached
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-50 bg-white flex justify-end items-center gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3.5 rounded-xl border border-gray-100 text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all active:scale-95"
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || isLimitReached}
                        className="flex-[2] py-3.5 rounded-xl bg-[#0f766e] text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-teal-900/15 hover:bg-[#134e4a] transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                    >
                        {loading ? 'Processing...' : 'Authorize Appeal'}
                    </button>
                </div>
            </div>
        </div>
    );
}
