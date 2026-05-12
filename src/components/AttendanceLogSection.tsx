'use client';

import {
    AttendanceRecord,
    getAttendanceHistory,
    getAttendanceStatus,
    getRegularizationRequestsApi,
    RegularizationRequest
} from '@/services/attendanceApi';

import {
    AlertCircle,
    ArrowDownLeft,
    ArrowUpRight,
    Calendar,
    CheckCircle,
    Clock,
    Edit3,
    Filter,
    MessageSquare
} from 'lucide-react';

import {
    eachDayOfInterval,
    endOfMonth,
    format,
    isFuture,
    isSameDay,
    isToday,
    subMonths,
    startOfMonth
} from 'date-fns';
import { useEffect, useState, useMemo } from 'react';
import { Column, DataTable } from '@/components/shared/DataTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';

import { getHoliday } from '@/data/holidays';
import AttendanceMapModal from './AttendanceMapModal';
import AttendanceRegularizationModal from './AttendanceRegularizationModal';
import RegularizationDrawer from './RegularizationDrawer';

const parseSafeDate = (val: any) => {
    if (!val) return null;
    if (typeof val === 'string') return new Date(val);
    if (val.$date) return new Date(val.$date);
    return new Date(val);
};

export default function AttendanceLogSection() {
    const [activeTab, setActiveTab] = useState<'log' | 'requests'>('log');
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

    const [history, setHistory] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState<Date | null>(null);

    // Modals
    const [isRegularizationOpen, setIsRegularizationOpen] = useState(false);
    const [selectedDateForRegularization, setSelectedDateForRegularization] = useState<Date | null>(null);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [selectedDateForMap, setSelectedDateForMap] = useState<Date | null>(null);
    const [selectedSessionsForMap, setSelectedSessionsForMap] = useState<any[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    // Requests
    const [requests, setRequests] = useState<RegularizationRequest[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(false);

    // Generate last 6 months for filter
    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), i));

    const fetchRequests = async () => {
        setRequestsLoading(true);
        try {
            const data = await getRegularizationRequestsApi();
            setRequests(data);
        } catch (e) {
            console.error(e);
        } finally {
            setRequestsLoading(false);
        }
    };

    const fetchHistoryAndStatus = async () => {
        setLoading(true);
        try {
            const status = await getAttendanceStatus();
            setStartDate(status.attendanceStartDate ? new Date(status.attendanceStartDate) : null);

            const start = startOfMonth(selectedMonth);
            const end = endOfMonth(selectedMonth);

            const data = await getAttendanceHistory(start.toISOString(), end.toISOString());
            setHistory(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchAll = async () => {
        await Promise.all([fetchHistoryAndStatus(), fetchRequests()]);
    };

    useEffect(() => {
        fetchAll();
        const handleUpdate = () => fetchAll();
        window.addEventListener('attendance-updated', handleUpdate);
        return () => window.removeEventListener('attendance-updated', handleUpdate);
    }, [selectedMonth]);

    const daysInterval = { start: startOfMonth(selectedMonth), end: endOfMonth(selectedMonth) };
    const displayDays = eachDayOfInterval(daysInterval).reverse().filter(d => {
        if (isFuture(d) && !isToday(d)) return false; // Show today
        if (!startDate) return true; // Default to showing if no start date
        const sd = new Date(startDate);
        sd.setHours(0, 0, 0, 0);
        return d >= sd;
    });

    const handleViewRequest = (req: any) => {
        setSelectedRequest(req);
        setIsDrawerOpen(true);
    };

    // DataTable Columns for Requests
    const requestColumns: Column<RegularizationRequest>[] = useMemo(() => [
        {
            accessor: 'date',
            header: 'Date',
            render: (row) => (
                <span className="font-bold text-gray-800 tracking-tight">
                    {format(parseSafeDate(row.date)!, 'd MMM yyyy')}
                </span>
            )
        },
        {
            accessor: 'type',
            header: 'Type',
            render: (row) => (
                <div className="text-gray-500 font-extrabold text-[9px] text-center uppercase tracking-normal bg-gray-50 px-2 py-1 rounded-md border border-gray-100 inline-block w-full">
                    {row.type}
                </div>
            )
        },
        {
            header: 'Requested On',
            accessor: 'requestedOn',
            render: (row: RegularizationRequest) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-gray-800 font-extrabold tracking-tight text-xs">{format(parseSafeDate(row.requestedOn)!, 'd MMM yyyy')}</span>
                    <span className="text-[9px] text-[#0f766e] font-black uppercase tracking-[0.1em] opacity-80">
                        by {typeof row.createdBy === 'object' ? (row.createdBy as any).name : 'Self'}
                    </span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row: RegularizationRequest) => {
                const colors = {
                    Pending: 'bg-amber-50 text-amber-600 border-amber-100',
                    Approved: 'bg-green-50 text-green-600 border-green-100',
                    Rejected: 'bg-red-50 text-red-600 border-red-100'
                };
                return (
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${colors[row.status]}`}>
                        {row.status}
                    </span>
                );
            }
        },
        {
            accessor: 'note',
            header: 'Note',
            render: (row) => (
                <div className="text-gray-400 text-xs leading-relaxed max-w-[180px] line-clamp-1 font-medium italic opacity-80">
                    "{row.note}"
                </div>
            )
        },
        {
            accessor: 'lastActionBy',
            header: 'Last Action',
            render: (row) => (
                <div className="flex flex-col gap-0.5 min-w-[120px]">
                    <span className="text-gray-800 font-extrabold text-xs tracking-tight">{row.lastActionBy?.name || '--'}</span>
                    {row.lastActionOn && (
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">on {format(parseSafeDate(row.lastActionOn)!, 'd MMM yyyy')}</span>
                    )}
                </div>
            )
        },
        {
            accessor: '_id',
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center justify-end">
                    <button
                        onClick={() => handleViewRequest(row)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-lg transition-all border border-transparent hover:border-[#0f766e]/10"
                    >
                        <MessageSquare size={16} strokeWidth={2.5} />
                    </button>
                </div>
            )
        }
    ], []);

    return (
        <div className="flex flex-col gap-8 font-sans animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-900/[0.03] border border-gray-100/50 min-h-[600px] flex flex-col relative">
                
                <div className="absolute top-0 left-0 w-96 h-96 bg-teal-50/30 rounded-full -ml-48 -mt-48 blur-3xl opacity-60" />

                {/* TABS AREA */}
                <div className="flex bg-gray-50/80 backdrop-blur-xl px-12 relative z-10 border-b border-gray-100/50">
                    <button
                        onClick={() => setActiveTab('log')}
                        className={`group flex items-center gap-5 py-6 border-b-4 transition-all duration-700 relative ${activeTab === 'log'
                            ? 'border-[#0f766e] text-[#0f172a]'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <div className={`p-2.5 rounded-xl transition-all duration-700 ${activeTab === 'log' ? 'bg-[#0f766e] text-white shadow-xl shadow-teal-900/20 rotate-0' : 'bg-white text-gray-300 group-hover:rotate-12 border border-gray-100'}`}>
                            <Calendar size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col text-left">
                           <span className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${activeTab === 'log' ? 'opacity-100' : 'opacity-60'}`}>
                                Workforce
                           </span>
                           <span className={`text-sm font-black transition-all duration-700 ${activeTab === 'log' ? 'translate-x-0' : '-translate-x-1 opacity-60'}`}>
                                Timeline Matrix
                           </span>
                        </div>
                        {activeTab === 'log' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#0f766e] rotate-45 translate-y-1"></div>}
                    </button>
                    
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`group flex items-center gap-5 py-6 border-b-4 ml-12 transition-all duration-700 relative ${activeTab === 'requests'
                            ? 'border-[#0f766e] text-[#0f172a]'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <div className={`p-2.5 rounded-xl transition-all duration-700 ${activeTab === 'requests' ? 'bg-[#0f766e] text-white shadow-xl shadow-teal-900/20 rotate-0' : 'bg-white text-gray-300 group-hover:rotate-12 border border-gray-100'}`}>
                            <MessageSquare size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col text-left">
                           <span className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${activeTab === 'requests' ? 'opacity-100' : 'opacity-60'}`}>
                                Appeals
                           </span>
                           <span className={`text-sm font-black transition-all duration-700 ${activeTab === 'requests' ? 'translate-x-0' : '-translate-x-1 opacity-60'}`}>
                                Registry Requests
                           </span>
                        </div>
                        {requests.length > 0 && (
                            <span className="absolute top-5 -right-3 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-rose-900/30 border-2 border-white">
                                {requests.length}
                            </span>
                        )}
                        {activeTab === 'requests' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#0f766e] rotate-45 translate-y-1"></div>}
                    </button>
                </div>

                {activeTab === 'log' ? (
                    <>
                        {/* MONTH FILTER BAR */}
                        <div className="flex flex-col md:flex-row justify-between items-center px-10 py-6 bg-white border-b border-gray-50 relative z-10 overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-60" />
                            
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#0f766e] to-[#14b8a6] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-900/10 transition-transform hover:rotate-6">
                                    <Filter size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <div className="w-1 h-3 bg-[#0f766e] rounded-full" />
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Temporal Archive</p>
                                    </div>
                                    <h4 className="text-xl font-black text-[#0f172a] uppercase tracking-tight leading-none">Timeline Selection</h4>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 relative z-10 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                                {months.map((m) => {
                                    const isSelected = isSameDay(startOfMonth(m), startOfMonth(selectedMonth));
                                    return (
                                        <button
                                            key={m.toISOString()}
                                            onClick={() => setSelectedMonth(m)}
                                            className={`px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap ${isSelected
                                                ? 'bg-[#0f766e] text-white shadow-xl shadow-teal-900/20 scale-105 active:scale-95'
                                                : 'bg-white text-gray-400 hover:text-[#0f766e] border border-gray-100 hover:bg-gray-50'
                                                }`}
                                        >
                                            {format(m, 'MMM yy')}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto bg-white relative p-8 no-scrollbar">
                            {displayDays.length === 0 && !loading ? (
                                <div className="flex flex-col items-center justify-center py-48 text-center px-12">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 border border-gray-100 grayscale opacity-40">
                                        <Calendar size={40} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-300 uppercase tracking-[0.2em]">Zero Activity Records</h3>
                                    <p className="text-gray-400 font-bold mt-4 max-w-sm">No biometric synchronization detected for the selected timeline cycle.</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-2xl shadow-slate-900/[0.02]">
                                    <table className="w-full text-left border-collapse">
                                         <thead className="sticky top-0 z-20">
                                          <tr className="bg-gray-50/50 backdrop-blur-md text-gray-400 border-b border-gray-100/50">
                                                 <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">
                                                     <div className="flex items-center gap-2">
                                                         <div className="w-1 h-3 bg-[#0f766e] rounded-full" />
                                                         Temporal Cycle
                                                     </div>
                                                 </th>
                                                 <th className="px-4 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Attendance Visual</th>
                                                 <th className="px-4 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Net Usage</th>
                                                 <th className="px-4 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Gross Session</th>
                                                 <th className="px-4 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Protocol</th>
                                                 <th className="px-6 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Registry</th>
                                             </tr>
                                         </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {displayDays.map((day) => {
                                                const record = history.find((h) => isSameDay(new Date(h.date), day));
                                                const isWO = day.getDay() === 0;
                                                const holiday = getHoliday(day);

                                                // Default Values
                                                let effectiveHoursStr = '--';
                                                let grossHoursStr = '--';
                                                let arrivalContent = <span className="text-gray-300 font-black tracking-widest">--</span>;
                                                let logIcon = <div className="w-6 h-6 rounded-full border-2 border-gray-100 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div></div>;
                                                let statusLabel = 'No Data';

                                                // Timeline Data
                                                let timelineLeft = 0;
                                                let timelineWidth = 0;
                                                let startTimeStr = '';
                                                let endTimeStr = '';
                                                let hasRecord = false;

                                                if (record) {
                                                    hasRecord = true;

                                                    // Calculate Hours
                                                    if (record.totalDuration) {
                                                        const h = Math.floor(record.totalDuration / 3600000);
                                                        const m = Math.floor((record.totalDuration % 3600000) / 60000);
                                                        effectiveHoursStr = `${h}h ${m}m`;
                                                        grossHoursStr = `${h}h ${m}m`;
                                                    }

                                                    // Timeline Logic
                                                    if (record.sessions?.[0]?.startTime) {
                                                        const start = parseSafeDate(record.sessions[0].startTime);
                                                        let end = record.sessions[record.sessions.length - 1].endTime
                                                            ? parseSafeDate(record.sessions[record.sessions.length - 1].endTime)
                                                            : new Date();

                                                        const startOfDay = new Date(day);
                                                        startOfDay.setHours(8, 0, 0, 0);
                                                        const totalWindowMs = 13 * 60 * 60 * 1000;

                                                        if (start && end) {
                                                            const startOffsetMs = start.getTime() - startOfDay.getTime();
                                                            let durationMs = end.getTime() - start.getTime();

                                                            let adjustedStartOffset = startOffsetMs;
                                                            if (adjustedStartOffset < 0) {
                                                                durationMs += adjustedStartOffset;
                                                                adjustedStartOffset = 0;
                                                            }

                                                            timelineLeft = (adjustedStartOffset / totalWindowMs) * 100;
                                                            if (timelineLeft < 0) timelineLeft = 0;
                                                            if (timelineLeft > 100) timelineLeft = 100;

                                                            const widthPc = (durationMs / totalWindowMs) * 100;
                                                            timelineWidth = widthPc;
                                                            if (timelineLeft + timelineWidth > 100) {
                                                                timelineWidth = 100 - timelineLeft;
                                                            }
                                                            if (timelineWidth < 0) timelineWidth = 0;

                                                            startTimeStr = format(start, 'h:mm a');
                                                            endTimeStr = format(end, 'h:mm a');
                                                        }
                                                    }

                                                    // Arrival
                                                    if (record.sessions?.[0]?.startTime) {
                                                        const sTime = parseSafeDate(record.sessions[0].startTime)!;
                                                        const limit = new Date(sTime);
                                                        limit.setHours(9, 15, 0, 0);

                                                        if (sTime <= limit) {
                                                            arrivalContent = (
                                                                <div className="flex items-center gap-2 justify-center text-emerald-600 bg-emerald-50/50 px-5 py-2 rounded-full border border-emerald-100/50">
                                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                                    <span className="text-xs font-black uppercase tracking-[0.15em]">Early Pulse</span>
                                                                </div>
                                                            );
                                                        } else {
                                                            arrivalContent = (
                                                                <div className="flex items-center gap-2 justify-center text-teal-600 bg-teal-50/50 px-5 py-2 rounded-full border border-teal-100/50">
                                                                    <div className="w-2 h-2 bg-teal-500 rounded-full" />
                                                                    <span className="text-xs font-black uppercase tracking-[0.15em]">Shift Delay</span>
                                                                </div>
                                                            );
                                                        }
                                                    }

                                                    // Log Icon Logic
                                                    if (record.sessions?.some(s => !s.endTime) && isToday(day)) {
                                                        logIcon = <div className="w-6 h-6 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shadow-lg shadow-emerald-500/10 animate-pulse"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div></div>;
                                                        statusLabel = 'Active';
                                                    } else if (record.sessions?.every(s => s.endTime)) {
                                                        logIcon = <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0f766e] flex items-center justify-center border border-teal-100 transition-all group-hover:scale-110 group-hover:shadow-lg"><CheckCircle size={22} strokeWidth={2.5} /></div>;
                                                        statusLabel = 'Present';
                                                    } else {
                                                        logIcon = <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100"><AlertCircle size={22} strokeWidth={2.5} /></div>;
                                                        statusLabel = 'Incomplete';
                                                    }
                                                } else {
                                                    if (!isFuture(day) && !isToday(day) && !isWO && !holiday) {
                                                        logIcon = <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-400 flex items-center justify-center border border-rose-100/50 opacity-60"><AlertCircle size={22} strokeWidth={2.5} /></div>;
                                                        statusLabel = 'Absent';
                                                    } else if (isWO) {
                                                        statusLabel = 'Weekly Cycle';
                                                    } else if (holiday) {
                                                        statusLabel = 'Festive Break';
                                                    }
                                                }

                                                return (
                                                    <tr key={day.toISOString()} className={`transition-all duration-300 group/row hover:bg-[#0f766e]/[0.02] border-b border-gray-50/50 ${!hasRecord && !isWO && !holiday ? 'opacity-80' : ''}`}>
                                                        {/* DATE AS CARD */}
                                                        <td className="px-8 py-6 whitespace-nowrap relative overflow-hidden">
                                                            <div className="flex items-center gap-5 relative z-10">
                                                                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border transition-all duration-500 shadow-sm group-hover/row:scale-110 group-hover/row:rotate-3 ${isWO || holiday
                                                                    ? 'bg-rose-50 border-rose-100 text-rose-500 shadow-rose-900/5'
                                                                    : 'bg-white border-gray-100 text-gray-500 group-hover/row:border-teal-200 group-hover/row:bg-white shadow-slate-900/5'
                                                                    }`}>
                                                                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-70 leading-none mb-1">{format(day, 'EEE')}</span>
                                                                    <span className="text-lg font-black tracking-tighter leading-none">{format(day, 'dd')}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[#0f172a] font-black text-base tracking-tight group-hover/row:text-[#0f766e] transition-colors leading-none mb-1.5">
                                                                        {format(day, 'MMMM')}
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-1 h-2.5 rounded-full ${isWO || holiday ? 'bg-rose-400' : 'bg-[#0f766e] opacity-40'}`} />
                                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] opacity-60">
                                                                            {holiday ? holiday.name : isWO ? 'Weekly Break' : 'Standard Shift'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/50 rounded-full -mr-12 -mt-12 blur-2xl opacity-0 group-hover/row:opacity-100 transition-opacity" />
                                                        </td>

                                                        {/* ATTENDANCE VISUAL - GLASS STYLE */}
                                                        <td className="px-4 py-6 min-w-[280px]">
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex-1 h-12 relative flex items-center bg-gray-100/30 rounded-xl border border-gray-100/50 overflow-hidden shadow-inner group/timeline group-hover/row:border-teal-100 transition-all">
                                                                    <div className="absolute inset-0 flex justify-between pointer-events-none opacity-[0.03]">
                                                                        {Array.from({ length: 18 }).map((_, i) => (
                                                                            <div key={i} className="w-[1px] h-full bg-[#0f766e]"></div>
                                                                        ))}
                                                                    </div>

                                                                    {hasRecord ? (
                                                                        <div
                                                                            className="absolute h-8 bg-gradient-to-r from-[#0f766e] via-[#14b8a6] to-[#0f766e] rounded-2xl group/bar transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-help shadow-[0_12px_30px_rgba(20,184,166,0.3)] border-2 border-white/40 overflow-hidden group-hover/row:h-10 transition-all"
                                                                            style={{ left: `${timelineLeft}%`, width: `${timelineWidth}%` }}
                                                                        >
                                                                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer" style={{ backgroundSize: '100% 100%' }}></div>
                                                                            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                                                                <div className="w-full h-[1px] bg-white/50" />
                                                                            </div>
                                                                            
                                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 hidden group-hover/bar:block z-[50]">
                                                                                <div className="bg-[#0f172a] text-white px-6 py-4 rounded-[1.5rem] whitespace-nowrap shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col items-center border border-white/10 ring-8 ring-teal-500/10 scale-105 animate-in zoom-in-95">
                                                                                    <span className="uppercase tracking-[0.3em] text-teal-400 text-[10px] mb-2 leading-none font-black">Temporal Range</span>
                                                                                    <span className="tabular-nums text-base font-black tracking-tight">{startTimeStr} — {endTimeStr}</span>
                                                                                </div>
                                                                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0f172a] rotate-45 border-r border-b border-white/10"></div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-full flex items-center justify-center gap-3">
                                                                            <div className="w-2 h-2 rounded-full bg-gray-200" />
                                                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] italic opacity-50">
                                                                                {holiday ? 'Festive Intermission' : isWO ? 'Cycle Suspension' : 'Matrix Empty'}
                                                                            </span>
                                                                            <div className="w-2 h-2 rounded-full bg-gray-200" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* NET USAGE */}
                                                        <td className="px-4 py-6 text-center">
                                                            <div className="flex flex-col items-center justify-center">
                                                                <span className="font-black text-lg text-[#0f172a] tracking-tighter tabular-nums mb-1 group-hover/row:text-[#0f766e] transition-colors leading-none">
                                                                    {effectiveHoursStr}
                                                                </span>
                                                                <div className="w-6 h-0.5 bg-gray-100 rounded-full group-hover/row:w-10 group-hover/row:bg-[#0f766e]/20 transition-all mt-1" />
                                                            </div>
                                                        </td>

                                                        {/* GROSS SESSION */}
                                                        <td className="px-4 py-6 text-center">
                                                            <span className="text-[0.9rem] font-bold text-gray-400 tabular-nums tracking-tight">
                                                                {grossHoursStr}
                                                            </span>
                                                        </td>

                                                        {/* PROTOCOL */}
                                                        <td className="px-4 py-6 text-center">
                                                            <div className="flex justify-center transition-all duration-500 group-hover/row:scale-105 group-hover/row:rotate-1">
                                                                {arrivalContent}
                                                            </div>
                                                        </td>

                                                        {/* REGISTRY */}
                                                        <td className="px-6 py-6 text-center relative">
                                                            <div className="flex justify-center group/log cursor-pointer relative z-10 transition-transform duration-500 hover:scale-110">
                                                                {logIcon}                                                                {/* DETAILED POPOVER */}
                                                                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 z-50 w-[260px] hidden group-hover/log:block animate-in fade-in zoom-in-95 slide-in-from-right-4 duration-500 no-scrollbar perspective-1000">
                                                                    <div className="bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-gray-100 text-left overflow-hidden ring-1 ring-black/[0.03]">
                                                                        
                                                                        {/* Header */}
                                                                        <div className="bg-gradient-to-br from-gray-50/80 to-white p-5 border-b border-gray-100">
                                                                            <div className="flex justify-between items-center mb-4">
                                                                                <div>
                                                                                    <div className="flex items-center gap-1.5 mb-1">
                                                                                        <div className="w-1 h-2.5 bg-[#0f766e] rounded-full" />
                                                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none opacity-70">Session Matrix</p>
                                                                                    </div>
                                                                                    <h5 className="font-black text-[#0f172a] text-lg tracking-tighter leading-none">Daily <span className="text-[#0f766e]">Presence</span></h5>
                                                                                </div>
                                                                                <span className={`text-[7px] border px-3 py-1 rounded-lg font-black uppercase tracking-[0.1em] shadow-sm ${statusLabel === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                                    statusLabel === 'Absent' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                                                        statusLabel === 'Incomplete' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                                                                                            'bg-white text-gray-400 border-gray-200'}`}>
                                                                                    {statusLabel}
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-gray-400 text-[8px] font-black flex items-center gap-2.5 uppercase tracking-[0.1em] opacity-80 bg-white/50 px-3 py-1.5 rounded-lg border border-gray-100/50 inline-flex">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#0f766e] animate-pulse"></div>
                                                                                09:00 — 18:00
                                                                            </div>
                                                                        </div>

                                                                        {/* Interaction Zone */}
                                                                        <div className="p-2 bg-white">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedDateForRegularization(day);
                                                                                    setIsRegularizationOpen(true);
                                                                                }}
                                                                                className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-xl transition-all duration-500 group/btn border border-gray-50 hover:border-gray-100 active:scale-95 shadow-sm hover:shadow-lg hover:shadow-teal-900/[0.03]"
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-9 h-9 rounded-lg bg-[#0f766e] flex items-center justify-center text-white shadow-xl shadow-teal-900/30 group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-all">
                                                                                        <Edit3 size={14} strokeWidth={3} />
                                                                                    </div>
                                                                                    <div className="flex flex-col text-left">
                                                                                        <span className="text-sm font-black text-[#0f172a] tracking-tight leading-none mb-1">Regularize</span>
                                                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.15em] opacity-60">Correction</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 group-hover/btn:text-[#0f766e] transition-all group-hover/btn:translate-x-1 group-hover/btn:bg-white border border-transparent group-hover/btn:border-teal-100">
                                                                                    <ArrowUpRight size={14} />
                                                                                </div>
                                                                            </button>
                                                                        </div>

                                                                        {/* Temporal Logs */}
                                                                        {record && record.sessions?.length ? (
                                                                            <div className="p-4 bg-gray-50/50 max-h-[160px] overflow-y-auto no-scrollbar border-t border-gray-100/50">
                                                                                <div className="text-[7px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 opacity-80">
                                                                                    Sequence
                                                                                    <div className="flex-1 h-px bg-gray-200/50"></div>
                                                                                </div>
                                                                                <div className="space-y-3">
                                                                                    {record.sessions.map((s, idx) => (
                                                                                        <div key={idx} className="flex flex-col gap-2 relative pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#0f766e] before:rounded-full before:opacity-10 hover:before:opacity-100 transition-all duration-500">
                                                                                            <div className="flex items-center justify-between">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <div className="w-1 h-1 rounded-full bg-[#0f766e]"></div>
                                                                                                    <span className="text-[10px] font-mono font-black text-[#0f172a] tracking-tight">{format(parseSafeDate(s.startTime)!, 'hh:mm:ss aa')}</span>
                                                                                                </div>
                                                                                                <span className="text-[6px] font-black text-emerald-600 uppercase tracking-[0.1em] bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100/50">Clock In</span>
                                                                                            </div>
                                                                                            <div className="flex items-center justify-between">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <div className="w-1 h-1 rounded-full bg-rose-500"></div>
                                                                                                    {s.endTime ? (
                                                                                                        <span className="text-[10px] font-mono font-black text-[#0f172a] tracking-tight">{format(parseSafeDate(s.endTime)!, 'hh:mm:ss aa')}</span>
                                                                                                    ) : (
                                                                                                        <span className="italic text-gray-400 text-[8px] font-black uppercase tracking-[0.1em] animate-pulse">Active...</span>
                                                                                                    )}
                                                                                                </div>
                                                                                                <span className="text-[6px] font-black text-rose-500 uppercase tracking-[0.1em] bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100/50">Clock Out</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="p-12 text-center">
                                                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-inner">
                                                                                     <Clock size={24} className="text-gray-300 opacity-50" />
                                                                                </div>
                                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">No Matrix Detected</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* PREMIUM REQUESTS TABLE */
                    <div className="flex-1 overflow-auto bg-white p-12 no-scrollbar">
                        <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-2xl shadow-slate-900/[0.02] overflow-hidden">
                            {requestsLoading && requests.length === 0 ? (
                                <TableSkeleton />
                            ) : (
                                <DataTable
                                    columns={requestColumns}
                                    data={requests}
                                    serverSidePagination={false}
                                    totalCount={requests.length}
                                    currentPage={1}
                                    limit={10}
                                    totalPages={Math.ceil(requests.length / 10)}
                                    onPageChange={() => {}}
                                    onLimitChange={() => {}}
                                />
                            )}
                        </div>
                    </div>
                )
                }

                {/* OVERLAYS & MODALS */}
                <AttendanceRegularizationModal
                    isOpen={isRegularizationOpen}
                    onClose={() => setIsRegularizationOpen(false)}
                    date={selectedDateForRegularization}
                    requests={requests}
                />

                <AttendanceMapModal
                    isOpen={isMapOpen}
                    onClose={() => setIsMapOpen(false)}
                    date={selectedDateForMap}
                    sessions={selectedSessionsForMap}
                />

                <RegularizationDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    request={selectedRequest}
                />
            </div >
        </div >
    );
}
