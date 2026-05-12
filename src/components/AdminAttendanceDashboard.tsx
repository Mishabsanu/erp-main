'use client';

import {
    getAdminAttendanceRange,
    getAdminAttendanceStatus
} from '@/services/attendanceApi';
import {
    Calendar,
    Clock,
    Filter,
    RefreshCw,
    Users,
    UserCheck
} from 'lucide-react';
import {
    endOfMonth,
    format,
    startOfMonth
} from 'date-fns';
import { useEffect, useState, useMemo } from 'react';
import { SearchInput } from '@/components/shared/SearchInput';
import { Column, DataTable } from '@/components/shared/DataTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';

export default function AdminAttendanceDashboard() {
    // View State
    const [viewMode, setViewMode] = useState<'day' | 'range'>('day');

    // Day View State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [report, setReport] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ total: 0, present: 0, online: 0, absent: 0 });

    // Range View State
    const [rangeStart, setRangeStart] = useState<Date>(startOfMonth(new Date()));
    const [rangeEnd, setRangeEnd] = useState<Date>(endOfMonth(new Date()));
    const [rangeReport, setRangeReport] = useState<any[]>([]);
    const [rangeDates, setRangeDates] = useState<any[]>([]);

    // Shared
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Day Report
    const fetchDayReport = async () => {
        setLoading(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const data = await getAdminAttendanceStatus(dateStr);
            setReport(data.data);
            setStats(data.stats);
        } catch (error) {
            console.error('Failed to fetch admin day report', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Range Report
    const fetchRangeReport = async () => {
        setLoading(true);
        try {
            const startStr = format(rangeStart, 'yyyy-MM-dd');
            const endStr = format(rangeEnd, 'yyyy-MM-dd');
            const data = await getAdminAttendanceRange(startStr, endStr);
            setRangeReport(data.data);
            setRangeDates(data.range || []);
        } catch (error) {
            console.error('Failed to fetch admin range report', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'day') {
            fetchDayReport();
        } else {
            fetchRangeReport();
        }
    }, [viewMode, selectedDate, rangeStart, rangeEnd]);


    const formatDuration = (ms: number) => {
        if (!ms) return '--';
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        return `${h}h ${m}m`;
    };

    const safeFormat = (date: any, formatStr: string) => {
        if (!date) return '--';
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return '--';
            return format(d, formatStr);
        } catch (e) {
            return '--';
        }
    };

    // Filter Logic
    const filteredDayReport = report.filter(r =>
        r.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRangeReport = rangeReport.filter(r =>
        r.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // DataTable Columns for Day View
    const columns: Column<any>[] = useMemo(() => [
        {
            accessor: 'user',
            header: <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Personnel Member</span>,
            render: (row) => (
                <div className="flex items-center gap-2.5 py-1.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0f766e] to-[#14b8a6] text-white flex items-center justify-center font-black text-xs shadow-md">
                        {row.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                        <div className="font-black text-[#0f172a] text-[13px] tracking-tight mb-0.5">{row.user?.name || 'Unknown'}</div>
                        <div className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] leading-none">{row.user?.role || 'N/A'}</div>
                    </div>
                </div>
            )
        },
        {
            accessor: 'status',
            header: <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Status</span>,
            render: (row) => (
                <div className="text-center">
                    {row.isOnline ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-[0.1em] border border-emerald-100">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
                        </span>
                    ) : row.status === 'present' ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50 text-gray-400 text-[9px] font-black uppercase tracking-[0.1em] border border-gray-200/50">
                            Clocked Out
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-50 text-rose-500 text-[9px] font-black uppercase tracking-[0.1em] border border-rose-100">
                            Absent
                        </span>
                    )}
                </div>
            )
        },
        {
            accessor: 'loginTime',
            header: <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Clock In</span>,
            render: (row) => (
                <div className="text-center text-xs font-black text-gray-700 tabular-nums">
                    {safeFormat(row.loginTime, 'h:mm a')}
                </div>
            )
        },
        {
            accessor: 'logoutTime',
            header: <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Clock Out</span>,
            render: (row) => (
                <div className="text-center text-xs font-black text-gray-700 tabular-nums">
                    {row.logoutTime ? safeFormat(row.logoutTime, 'h:mm a') : (row.isOnline ? <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest animate-pulse">Running</span> : '--')}
                </div>
            )
        },
        {
            accessor: 'totalDuration',
            header: <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Operational Duration</span>,
            render: (row) => (
                <div className="text-center">
                    <span className="font-mono font-black text-xs text-[#0f172a] bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100/50">
                        {formatDuration(row.totalDuration)}
                    </span>
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 font-sans">

            {/* Header / Stats Cards - Only Show in Day View */}
            {viewMode === 'day' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard label="Total Personnel" value={stats.total} icon={Users} color="blue" />
                    <StatsCard label="Active Presence" value={stats.present} icon={UserCheck} color="green" />
                    <StatsCard label="Real-time Online" value={stats.online} icon={Clock} color="cyan" />
                    <StatsCard label="Zero Activity" value={stats.absent} icon={Users} color="red" />
                </div>
            )}

            {/* Main Content Card */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/[0.03] border border-gray-100/50 overflow-hidden min-h-[500px] flex flex-col relative">

                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/50 rounded-full -mr-32 -mt-32 blur-3xl opacity-40" />

                {/* Toolbar / Command Bar */}
                <div className="p-8 border-b border-gray-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10 overflow-hidden bg-white">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50/[0.3] to-transparent pointer-events-none" />

                    <div className="flex items-center gap-5 relative">
                        <div className="w-16 h-16 bg-[#0f766e] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-900/15 transition-transform hover:rotate-6">
                            <Users size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-3 bg-[#0f766e] rounded-full" />
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Operational Node</p>
                            </div>
                            <h4 className="text-2xl font-black text-[#0f172a] uppercase tracking-tighter">Personnel Presence <span className="text-[#0f766e]">Control</span></h4>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-5 relative">
                        {/* View Swiper */}
                        <div className="flex bg-gray-100/40 p-1 rounded-xl border border-gray-100 shadow-inner">
                            <button
                                onClick={() => setViewMode('day')}
                                className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2.5 ${viewMode === 'day'
                                    ? 'bg-white text-[#0f766e] shadow-md scale-105'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <Calendar size={14} />
                                Daily
                            </button>
                            <button
                                onClick={() => setViewMode('range')}
                                className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2.5 ${viewMode === 'range'
                                    ? 'bg-white text-[#0f766e] shadow-md scale-105'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <RefreshCw size={14} />
                                Periodic
                            </button>
                        </div>

                        <div className="h-8 w-px bg-gray-100 hidden lg:block" />

                        {/* Search & Refresh */}
                        <div className="flex items-center gap-3">
                            <div className="w-56">
                                <SearchInput
                                    initialSearchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    placeholder="Filter Personnel..."
                                />
                            </div>
                            <button
                                onClick={viewMode === 'day' ? fetchDayReport : fetchRangeReport}
                                disabled={loading}
                                className="p-3.5 rounded-xl bg-gray-50 text-[#0f766e] hover:bg-teal-600 hover:text-white transition-all border border-gray-100 group active:scale-95 disabled:opacity-50"
                            >
                                <RefreshCw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Date Selection Bar */}
                <div className="px-10 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center gap-8 relative z-10">
                    {viewMode === 'day' && (
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4">Snapshot Timeline:</span>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={format(selectedDate, 'yyyy-MM-dd')}
                                    onChange={(e) => e.target.valueAsDate && setSelectedDate(e.target.valueAsDate)}
                                    className="pl-6 pr-6 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-black text-[#0f766e] focus:outline-none focus:ring-4 focus:ring-teal-500/10 cursor-pointer shadow-sm"
                                />
                            </div>
                        </div>
                    )}

                    {viewMode === 'range' && (
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4">Cycle Range:</span>
                            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                <input
                                    type="date"
                                    value={format(rangeStart, 'yyyy-MM-dd')}
                                    onChange={(e) => e.target.valueAsDate && setRangeStart(e.target.valueAsDate)}
                                    className="bg-transparent border-none text-[11px] font-black px-2 py-1 text-[#0f766e] focus:outline-none"
                                />
                                <div className="w-3 h-0.5 bg-gray-200 rounded-full" />
                                <input
                                    type="date"
                                    value={format(rangeEnd, 'yyyy-MM-dd')}
                                    onChange={(e) => e.target.valueAsDate && setRangeEnd(e.target.valueAsDate)}
                                    className="bg-transparent border-none text-[11px] font-black px-2 py-1 text-[#0f766e] focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-auto p-10 relative z-10">

                    {/* --- DAY VIEW TABLE --- */}
                    {viewMode === 'day' && (
                        <div className="bg-white rounded-[2rem] border border-gray-50 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                            {loading ? (
                                <TableSkeleton />
                            ) : (
                                <DataTable
                                    columns={columns}
                                    data={filteredDayReport}
                                    serverSidePagination={false}
                                    totalCount={filteredDayReport.length}
                                    currentPage={1}
                                    limit={10}
                                    totalPages={Math.ceil(filteredDayReport.length / 10)}
                                    onPageChange={() => { }}
                                    onLimitChange={() => { }}
                                />
                            )}
                        </div>
                    )}

                    {/* --- RANGE VIEW (REGISTER) --- */}
                    {viewMode === 'range' && (
                        <div className="w-full relative overflow-hidden bg-white rounded-[2rem] border border-gray-50 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                            {loading ? (
                                <div className="p-8"><TableSkeleton /></div>
                            ) : (
                                <div className="overflow-auto max-h-[700px] no-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 z-30">
                                            <tr className="bg-white/95 backdrop-blur-xl text-gray-400 border-b border-gray-100">
                                                <th className="px-8 py-8 text-[9px] font-black uppercase tracking-[0.4em] sticky left-0 z-40 bg-white border-r border-gray-100 w-[240px] shadow-[8px_0_30px_rgba(0,0,0,0.02)] text-gray-500">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-4 bg-[#0f766e] rounded-full" />
                                                        Personnel Matrix
                                                    </div>
                                                </th>
                                                {rangeDates.map((dateStr: string) => (
                                                    <th key={dateStr} className="px-4 py-4 text-center border-r border-gray-100/50 min-w-[70px] hover:bg-gray-50/50 transition-colors group/th">
                                                        <div className="flex flex-col items-center gap-1 transition-transform group-hover/th:-translate-y-1 duration-500">
                                                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] leading-none mb-1">{format(new Date(dateStr), 'EEE')}</span>
                                                            <span className="text-lg font-black text-[#0f172a] tracking-tighter tabular-nums leading-none">{format(new Date(dateStr), 'dd')}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredRangeReport.length === 0 ? (
                                                <tr><td colSpan={rangeDates.length + 1} className="py-24 text-center text-gray-300 font-bold italic text-lg uppercase tracking-widest opacity-40">No entries detected</td></tr>
                                            ) : (
                                                filteredRangeReport.map((row: any) => (
                                                    <tr key={row.user._id} className="hover:bg-blue-50/20 transition-all group">
                                                        <td className="px-8 py-5 sticky left-0 z-20 bg-white border-r border-gray-100 group-hover:bg-teal-50/30 shadow-[8px_0_30px_rgba(0,0,0,0.01)] transition-colors">
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-[13px] text-[#0f172a] tracking-tight group-hover:text-[#0f766e] transition-colors leading-none mb-2">{row.user.name}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full group-hover:bg-[#0f766e] transition-colors" />
                                                                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-80">{row.user.role}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {rangeDates.map((dateStr: string) => {
                                                            const key = format(new Date(dateStr), 'yyyy-MM-dd');
                                                            const cellData = row.attendance[key] || { status: 'NA' };

                                                            let badge = (<span className="w-10 h-10 rounded-2xl bg-gray-50/30 text-gray-200 flex items-center justify-center text-xs font-black border border-transparent">-</span>);

                                                            if (cellData.status === 'P') {
                                                                badge = (
                                                                    <div
                                                                        className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 text-[#0f766e] flex items-center justify-center text-[15px] font-black border border-[#0f766e]/20 shadow-sm hover:scale-110 hover:bg-[#0f766e] hover:text-white transition-all cursor-help duration-500 active:scale-90 group/p"
                                                                        title={`Clock In: ${cellData.inTime ? format(new Date(cellData.inTime), 'h:mm a') : 'N/A'} | Out: ${cellData.outTime ? format(new Date(cellData.outTime), 'h:mm a') : 'Active'}`}
                                                                    >
                                                                        <span className="transition-transform duration-500">P</span>
                                                                    </div>
                                                                );
                                                            } else if (cellData.status === 'A') {
                                                                badge = (
                                                                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center text-[15px] font-black border border-rose-100 shadow-sm hover:bg-rose-500 hover:text-white transition-all duration-500 cursor-default group/a">
                                                                        <span className="group-hover/a:scale-110 transition-transform duration-500">A</span>
                                                                    </div>
                                                                );
                                                            } else if (cellData.status === 'WO') {
                                                                badge = (
                                                                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center text-[10px] font-black border border-slate-100 uppercase tracking-tighter opacity-60">
                                                                        WO
                                                                    </div>
                                                                );
                                                            } else if (cellData.status === 'HOL') {
                                                                badge = (
                                                                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-[13px] font-black border border-amber-100 shadow-sm hover:bg-amber-500 hover:text-white transition-all duration-500 cursor-default group/h">
                                                                        <span className="group-hover/h:scale-110 transition-transform duration-500">H</span>
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <td key={dateStr} className="px-2 py-4 text-center border-r border-gray-50/30">
                                                                    <div className="flex justify-center">
                                                                        {badge}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

const StatsCard = ({ label, value, icon: Icon, color }: any) => {
    // Optimized style mapping for high-fidelity aesthetics
    const styles: any = {
        blue: {
            bg: 'bg-blue-50 text-blue-600 border-blue-100/50',
            grad: 'from-blue-500/10 to-transparent',
            icon: 'bg-blue-50 text-blue-600 border-blue-100/50'
        },
        green: {
            bg: 'bg-emerald-50 text-emerald-600 border-emerald-100/50',
            grad: 'from-emerald-500/10 to-transparent',
            icon: 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
        },
        cyan: {
            bg: 'bg-cyan-50 text-cyan-600 border-cyan-100/50',
            grad: 'from-cyan-500/10 to-transparent',
            icon: 'bg-cyan-50 text-cyan-600 border-cyan-100/50'
        },
        red: {
            bg: 'bg-rose-50 text-rose-600 border-rose-100/50',
            grad: 'from-rose-500/10 to-transparent',
            icon: 'bg-rose-50 text-rose-600 border-rose-100/50'
        }
    };

    const style = styles[color] || styles.blue;

    return (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-900/[0.02] border border-gray-100/50 flex flex-col items-center justify-center gap-4 group transition-all duration-700 hover:-translate-y-1 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br transition-all duration-700 opacity-[0.05] group-hover:opacity-[0.1] -mr-12 -mt-12 ${style.grad}`} />
            <div className={`w-12 h-12 rounded-2xl ${style.icon} border-2 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-700`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
            <div className="text-center relative z-10">
                <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1.5 opacity-70 leading-none">{label}</p>
                <div className="flex items-baseline justify-center gap-1">
                    <p className="text-4xl font-black text-[#0f172a] tracking-tighter group-hover:text-[#0f766e] transition-colors tabular-nums">{value}</p>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};
