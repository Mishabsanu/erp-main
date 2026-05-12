import { useAuth } from '@/contexts/AuthContext';
import {
    AttendanceStatusResponse,
    getAttendanceStatus,
    getAttendanceHistory,
    signInApi,
    signOutApi,
} from '@/services/attendanceApi';
import { triggerAttendanceUpdate } from '@/utils/attendanceEvents';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { Briefcase, Calendar, LogIn, LogOut, Timer, MapPin, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AttendanceStats() {
    const { user } = useAuth();
    const [status, setStatus] = useState<AttendanceStatusResponse['status']>('not_signed_in');
    const [data, setData] = useState<AttendanceStatusResponse['data']>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [liveDuration, setLiveDuration] = useState<number>(0);
    const [confirmSignOut, setConfirmSignOut] = useState(false);
    const [weeklyHistory, setWeeklyHistory] = useState<any[]>([]);

    // Calculate Week Days
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

    // Clock tick & Live Duration
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            if (status === 'signed_in' && data?.sessions) {
                const lastSession = data.sessions[data.sessions.length - 1];
                if (lastSession && lastSession.startTime && !lastSession.endTime) {
                    const start = new Date(lastSession.startTime).getTime();
                    const current = now.getTime();
                    const sessionDuration = current - start;
                    const previousDuration = data.sessions.slice(0, -1).reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
                    setLiveDuration(previousDuration + sessionDuration);
                }
            } else if (data?.totalDuration) {
                setLiveDuration(data.totalDuration);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [status, data]);

    // Load status & Weekly History
    const loadStatus = async () => {
        try {
            const res = await getAttendanceStatus();
            setStatus(res.status);
            setData(res.data);
            if (res.data?.totalDuration) {
                setLiveDuration(res.data.totalDuration);
            }

            const start = startOfCurrentWeek.toISOString();
            const end = addDays(startOfCurrentWeek, 6).toISOString();
            const history = await getAttendanceHistory(start, end);
            setWeeklyHistory(history);

        } catch (error) {
            console.error('Failed to load status/history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStatus();
        const handleUpdate = () => loadStatus();
        window.addEventListener('attendance-updated', handleUpdate);
        return () => window.removeEventListener('attendance-updated', handleUpdate);
    }, []);

    const handleSignIn = async () => {
        setActionLoading(true);
        try {
            const newData = await signInApi();
            setStatus('signed_in');
            setData(newData);
            const currentHour = new Date().getHours();
            const timeGreeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
            toast.success(`${timeGreeting}! You are now clocked in.`);
            triggerAttendanceUpdate();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to sign in');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSignOut = async () => {
        setActionLoading(true);
        try {
            const newData = await signOutApi();
            setStatus('signed_out');
            setData(newData);
            setConfirmSignOut(false);
            toast.success('You have clocked out.');
            triggerAttendanceUpdate();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to sign out');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDuration = (ms: number) => {
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${h}h ${m}m ${s}s`;
    };

    if (loading) return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 lg:col-span-2 h-72 bg-gray-100 animate-pulse rounded-3xl" />
            <div className="h-72 bg-gray-100 animate-pulse rounded-3xl" />
        </div>
    );

    const isOnline = status === 'signed_in';
    const hour = currentTime.getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: STATUS CARD */}
            <div className={`col-span-1 lg:col-span-2 rounded-[3rem] p-8 md:p-12 relative overflow-hidden flex items-center bg-white shadow-2xl shadow-slate-900/[0.03] border border-gray-100/50`}>

                {/* Visual Accent */}
                <div className={`absolute -right-20 -top-20 w-96 h-96 rounded-full transition-all duration-1000 blur-3xl ${isOnline ? 'bg-teal-500/10' : 'bg-slate-100/50'}`} />
                <div className={`absolute -left-10 -bottom-10 w-48 h-48 rounded-full transition-all duration-1000 blur-2xl ${isOnline ? 'bg-emerald-500/5' : 'bg-slate-50/30'}`} />

                <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center w-full gap-12">
                    <div className="flex-1 space-y-10">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-3 bg-[#0f766e] rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                                    {format(currentTime, 'EEEE, d MMMM yyyy')}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                                {greeting}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Member'}</span>
                            </h2>
                            <p className="text-sm font-bold text-gray-400 max-w-lg leading-relaxed">
                                {isOnline ? (
                                    <span className="flex items-center gap-2">
                                        <Activity className="text-emerald-500 animate-pulse" size={18} />
                                        Performance track active. Focused mode on.
                                    </span>
                                ) : "Ready to log your presence? Initialize your clock in below."}
                            </p>
                        </div>

                        <div className="pt-6">
                            {!isOnline ? (
                                <button
                                    onClick={handleSignIn}
                                    disabled={actionLoading}
                                    className="group relative px-10 py-5 bg-[#0f766e] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-teal-900/10 hover:bg-[#134e4a] transition-all flex items-center gap-4 active:scale-95 disabled:opacity-50"
                                >
                                    {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn size={18} strokeWidth={3} />}
                                    <span>Clock In</span>
                                </button>
                            ) : (
                                !confirmSignOut ? (
                                    <button
                                        onClick={() => setConfirmSignOut(true)}
                                        className="px-10 py-5 rounded-2xl border-2 border-gray-100 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center gap-4 active:scale-95"
                                    >
                                        <LogOut size={18} />
                                        <span>Clock Out</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-6 animate-in fade-in slide-in-from-left-6 duration-500">
                                        <button
                                            onClick={() => setConfirmSignOut(false)}
                                            className="px-10 py-5 rounded-2xl border-2 border-gray-100 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all"
                                        >
                                            Stay Online
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            disabled={actionLoading}
                                            className="px-12 py-5 rounded-2xl bg-rose-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-rose-900/10 hover:bg-rose-700 transition-all flex items-center gap-3 active:scale-95"
                                        >
                                            {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogOut size={18} strokeWidth={3} />}
                                            <span>Confirm Clock Out</span>
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center xl:items-end gap-8">
                        <div className="flex flex-col items-center xl:items-end group cursor-default">
                            <div className="flex items-baseline gap-1.5 transition-all duration-700 group-hover:scale-[1.02]">
                                <span className="text-7xl md:text-8xl font-black tracking-tighter tabular-nums gradient-text bg-gradient-to-br from-[#0f172a] via-[#0f766e] to-[#0f172a]">
                                    {format(currentTime, 'h:mm')}
                                </span>
                                <div className="flex flex-col items-start translate-y-[-10%]">
                                    <span className="text-2xl font-black text-[#0f766e] uppercase tracking-[0.2em] leading-none mb-1 opacity-90">{format(currentTime, 'aa')}</span>
                                    <span className="text-3xl font-black text-gray-300 tabular-nums leading-none tracking-tight opacity-60">{format(currentTime, ':ss')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Live Timer if Online */}
                        {isOnline ? (
                            <div className="bg-gradient-to-br from-[#0f766e] to-[#115e59] px-8 py-4 rounded-[2rem] shadow-xl shadow-teal-900/20 flex items-center gap-5 border border-white/20 group transition-all duration-500 hover:scale-105 relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                                <div className="relative flex items-center justify-center">
                                    <Activity size={24} className="text-white relative z-10" />
                                    <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-40 animate-pulse" />
                                </div>
                                <div className="flex flex-col relative z-10">
                                    <span className="text-xs text-teal-100 font-bold uppercase tracking-[0.25em] opacity-80">Operational Uptime</span>
                                    <span className="font-mono font-black tracking-[0.1em] tabular-nums text-4xl text-white">{formatDuration(liveDuration)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="px-8 py-5 rounded-[2rem] bg-gray-50 border border-gray-100 flex items-center gap-6 opacity-60">
                                <Timer size={24} className="text-gray-400" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Session Accumulation</span>
                                    <span className="font-mono font-black tracking-tight tabular-nums text-3xl text-gray-400 leading-none">{formatDuration(liveDuration)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: WEEKLY SUMMARY CHART */}
            <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-slate-900/[0.03] border border-gray-100/50 flex flex-col justify-between overflow-hidden relative group">

                {/* Top Info */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#0f766e] shadow-sm border border-teal-100 transition-transform group-hover:rotate-12">
                                <Briefcase size={22} />
                            </div>
                            <div>
                                <h3 className="font-black text-[#0f172a] text-[11px] uppercase tracking-widest leading-none mb-1">Weekly Pulse</h3>
                                <div className="w-8 h-0.5 bg-[#0f766e] rounded-full" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0f172a] p-5 rounded-2xl flex items-center justify-between shadow-xl shadow-slate-900/20 relative z-10">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mb-1.5 leading-none">Cycle Matrix</span>
                            <span className="text-[12px] font-black text-white tracking-tight leading-none">
                                {format(startOfCurrentWeek, 'd MMM')} — {format(addDays(startOfCurrentWeek, 6), 'd MMM yyyy')}
                            </span>
                        </div>
                        <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-[#14b8a6]">
                            <MapPin size={18} />
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 flex flex-col justify-center mt-12">
                    <div className="flex justify-between items-end gap-3 h-32 pb-2">
                        {weekDays.map((day) => {
                            const isToday = isSameDay(day, today);
                            const record = weeklyHistory.find((r: any) => isSameDay(new Date(r.date), day));
                            let duration = record?.totalDuration || 0;
                            if (isToday && isOnline) duration = liveDuration;

                            const hours = duration / 3600000;
                            const percentage = Math.min((hours / 12) * 100, 100);

                            return (
                                <div key={day.toISOString()} className="flex-1 flex flex-col items-center gap-4 group relative" title={`${hours.toFixed(1)} hrs`}>
                                    <div className="w-full bg-gray-50/80 rounded-2xl relative flex items-end overflow-hidden h-full border border-gray-100 group-hover:border-[#0f766e]/30 transition-all duration-500 shadow-inner">
                                        <div
                                            className={`w-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_10px_20px_rgba(15,118,110,0.2)] ${isToday ? 'bg-gradient-to-t from-[#0f766e] via-[#14b8a6] to-[#0f766e] animate-gradient-y' : (percentage > 0 ? 'bg-[#0f766e]' : 'bg-gray-200')}`}
                                            style={{ height: `${Math.max(percentage, 8)}%`, opacity: percentage > 0 ? 1 : 0.15 }}
                                        />
                                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                    <span className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-300 ${isToday ? 'text-[#0f766e] scale-110' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                        {format(day, 'EEE')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#0f766e] shadow-lg shadow-[#0f766e]/40" />
                            <span className="text-xs font-black uppercase tracking-widest text-[#0f172a]">Present</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded-full bg-gray-200" />
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Idle</span>
                        </div>
                    </div>
                    <div className="py-2 px-4 bg-gray-50 rounded-xl text-xs font-black text-[#0f766e] border border-gray-100 uppercase tracking-widest shadow-sm">
                        Baseline: 8h
                    </div>
                </div>
            </div>
        </div>
    );
}
