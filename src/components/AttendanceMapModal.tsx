'use client';

import { X, ArrowUpRight, ArrowDownLeft, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    sessions?: { startTime: string; endTime?: string }[];
}

export default function AttendanceMapModal({
    isOpen,
    onClose,
    date,
    sessions,
}: AttendanceMapModalProps) {
    if (!isOpen || !date) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white z-10">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                        MAP VIEW - {format(date, 'd MMM yyyy').toUpperCase()}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-y-auto p-6 space-y-8">
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">Web Clock In</div>
                            {sessions?.map((session, idx) => (
                                <div key={`in-${idx}`} className="mb-6 relative pl-4 border-l-2 border-green-100">
                                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                                    <div className="flex items-center gap-2 text-green-600 font-semibold mb-1">
                                        <ArrowUpRight size={14} />
                                        {format(new Date(session.startTime), 'hh:mm aa')}
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono mb-0.5">103.70.198.170</div>
                                    <div className="text-[10px] text-gray-400">Location details are not found</div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">Web Clock Out</div>
                            {sessions?.map((session, idx) => session.endTime && (
                                <div key={`out-${idx}`} className="mb-6 relative pl-4 border-l-2 border-teal-100">
                                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-teal-500 rounded-full border-2 border-white shadow-sm"></div>
                                    <div className="flex items-center gap-2 text-teal-700 font-semibold mb-1">
                                        <ArrowDownLeft size={14} />
                                        {format(new Date(session.endTime), 'hh:mm aa')}
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono mb-0.5">157.46.11.50</div>
                                    <div className="text-[10px] text-gray-400">Location details are not found</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Map Area (Mock) */}
                    <div className="flex-1 bg-gray-100 relative group overflow-hidden">
                        {/* Mock Map Background - Using a blurred pattern to simulate map */}
                        <div className="absolute inset-0 bg-[#e5e7eb] opacity-50"
                            style={{
                                backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)',
                                backgroundSize: '30px 30px'
                            }}>
                        </div>

                        {/* Road-like lines mock */}
                        <div className="absolute top-0 left-1/4 w-8 h-full bg-white/60 -skew-x-12 border-l border-r border-gray-300"></div>
                        <div className="absolute top-1/3 left-0 w-full h-6 bg-white/60 skew-y-6 border-t border-b border-gray-300"></div>

                        {/* Map Pins */}
                        <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 text-green-600 drop-shadow-lg animate-bounce">
                            <MapPin size={40} fill="currentColor" className="text-green-600" />
                        </div>

                        <div className="absolute bottom-1/4 right-1/4 transform -translate-x-1/2 -translate-y-1/2 text-teal-500 drop-shadow-lg">
                            <MapPin size={40} fill="currentColor" className="text-teal-500" />
                        </div>

                        {/* Attributions / Controls Mock */}
                        <div className="absolute bottom-4 right-4 bg-white/90 px-2 py-1 text-[10px] text-gray-500 rounded shadow-sm">
                            Leaflet | © OpenStreetMap contributors
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
