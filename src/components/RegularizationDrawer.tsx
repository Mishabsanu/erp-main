'use client';

import { X, MessageSquare, User, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { addRegularizationCommentApi } from '@/services/attendanceApi';
import { toast } from 'sonner';
import { triggerAttendanceUpdate } from '@/utils/attendanceEvents';

interface RegularizationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    request: any; // Using any for now, refine with proper type
}

export default function RegularizationDrawer({ isOpen, onClose, request }: RegularizationDrawerProps) {
    const [comment, setComment] = useState('');
    const [sending, setSending] = useState(false);

    if (!isOpen || !request) return null;

    const parseSafeDate = (val: any) => {
        if (!val) return null;
        if (typeof val === 'string') return new Date(val);
        if (val.$date) return new Date(val.$date);
        return new Date(val);
    };

    const handleAddComment = async () => {
        if (!comment.trim()) return;
        setSending(true);
        try {
            await addRegularizationCommentApi(request._id, comment);
            toast.success('Comment added');
            setComment('');
            triggerAttendanceUpdate();
        } catch (error) {
            toast.error('Failed to add comment');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col animate-in slide-in-from-right">

                {/* Header with improved styling */}
                <div className="flex items-center justify-between px-10 py-10 border-b border-gray-100 bg-white relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#0f766e] to-[#14b8a6] rounded-3xl flex items-center justify-center text-white shadow-xl shadow-teal-900/10">
                            <MessageSquare size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1 h-3 bg-[#0f766e] rounded-full" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Workforce Node</p>
                            </div>
                            <h2 className="text-3xl font-black text-[#0f172a] tracking-tight uppercase">Appeal <span className="text-[#0f766e]">Context</span></h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-600 transition-all active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* User Info Header matching mockup */}
                    <div className="flex items-center gap-4 border border-gray-100 p-4 rounded-xl shadow-sm bg-white">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-sky-50 relative group">
                            <div className="absolute inset-0 bg-[#5e50d1]/10 flex items-center justify-center text-[#5e50d1] font-bold text-xl">
                                {request.user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-bold text-[#0f766e] text-[0.9rem] tracking-tight">{request.user?.name || 'User Name'}</h3>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1 opacity-70">
                                Worker Instance • {format(parseSafeDate(request.requestedOn)!, 'd MMM yyyy')}
                            </p>
                        </div>
                    </div>

                    {/* Date Block - Calendar Card Style */}
                    <div className="flex items-center gap-6 p-2">
                        <div className="w-[100px] bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col items-center">
                            <div className="w-full bg-gray-50 py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 opacity-70">
                                {format(parseSafeDate(request.date)!, 'MMM')}
                            </div>
                            <div className="py-4 text-4xl font-black text-gray-800 tracking-tight">
                                {format(parseSafeDate(request.date)!, 'd')}
                            </div>
                            <div className="w-full bg-white pb-2.5 text-center text-xs font-bold text-gray-400 uppercase tracking-widest opacity-70">
                                {format(parseSafeDate(request.date)!, 'EEE')}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-gray-900 font-bold text-lg">Attendance Regularization Request</span>
                        </div>
                    </div>

                    {/* Conversation thread style matching the mockup */}
                    <div className="space-y-8 pt-4 border-t border-gray-50">
                        {/* Requester's initial note */}
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
                                <User size={18} className="text-gray-400" />
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-gray-900">{request.user?.name || 'Self'}</span>
                                    <span className="text-xs text-gray-400 font-medium">{format(parseSafeDate(request.requestedOn)!, 'd MMM yyyy hh:mm a')}</span>
                                </div>
                                <div className="text-[0.9rem] text-gray-600 bg-[#f8f9fb] p-6 rounded-tr-3xl rounded-br-3xl rounded-bl-3xl border border-gray-100 shadow-sm leading-relaxed">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0f766e] mr-3 block mb-2 opacity-70">Initial Subject Note</span>
                                    {request.note}
                                </div>
                            </div>
                        </div>

                        {/* Comment timeline */}
                        {(request.comments || []).map((c: any, i: number) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 text-[12px] font-bold text-[#5e50d1]">
                                    {c.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-gray-900">{c.user?.name || 'User'}</span>
                                        <span className="text-xs text-gray-400 font-medium">{format(parseSafeDate(c.timestamp)!, 'd MMM yyyy hh:mm a')}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 bg-white p-5 rounded-tr-3xl rounded-br-3xl rounded-bl-3xl border border-gray-100 shadow-sm">
                                        {c.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Footer / Comment input bar matching mockup */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50/30 focus-within:ring-2 focus-within:ring-[#5e50d1]/10 focus-within:border-[#5e50d1] transition-all">
                        <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            placeholder="Add comment"
                            disabled={sending}
                            className="flex-1 px-6 py-5 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-gray-800 font-medium placeholder:text-gray-400 disabled:opacity-50"
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={sending || !comment.trim()}
                            className="w-14 h-14 flex items-center justify-center bg-white text-gray-400 hover:text-[#5e50d1] border-l border-gray-100 transition-colors disabled:opacity-30"
                        >
                            <MessageSquare size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
