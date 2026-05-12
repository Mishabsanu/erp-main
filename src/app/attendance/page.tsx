'use client';

import { useState } from 'react';
import AttendanceStats from '@/components/AttendanceStats';
import AttendanceLogSection from '@/components/AttendanceLogSection';
import AdminAttendanceDashboard from '@/components/AdminAttendanceDashboard';
import ListPageHeader from '@/components/shared/ListPageHeader';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutGrid, UserCheck } from 'lucide-react';

function AttendancePage() {
    const { user } = useAuth();
    const [view, setView] = useState<'my' | 'admin'>('my');

    // Only allow admin view if user has permission
    const { can } = useAuth();
    const canViewAll = can('attendance', 'view');

    return (
        <div className="min-h-screen w-full py-8 px-4 md:px-10 bg-[#f8fafc]">
            <div className="max-w-[1600px] mx-auto space-y-8">
                <ListPageHeader
                    eyebrow="Presence & Productivity"
                    title={view === 'my' ? 'Personal' : 'Operational'}
                    highlight={view === 'my' ? 'Terminal' : 'Intelligence'}
                    description={view === 'my' ? 'Biometric synchronization and personal uptime analytics.' : 'Real-time workforce distribution and activity monitoring.'}
                    actions={canViewAll && (
                        <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                            <button
                                onClick={() => setView('my')}
                                className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${view === 'my' ? 'bg-white text-[#0f766e] shadow-lg shadow-teal-900/5' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <UserCheck className="w-4 h-4" />
                                Personal Hub
                            </button>
                            <button
                                onClick={() => setView('admin')}
                                className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${view === 'admin' ? 'bg-white text-[#0f766e] shadow-lg shadow-teal-900/5' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                Team Analytics
                            </button>
                        </div>
                    )}
                />

                <div className="relative">
                    {view === 'my' ? (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            {/* Stats/Timings Section */}
                            <AttendanceStats />

                            {/* Logs Section */}
                            <AttendanceLogSection />
                        </div>
                    ) : (
                        <AdminAttendanceDashboard />
                    )}
                </div>
            </div>
        </div>
    );
}

export default withAuth(AttendancePage, [{ module: 'attendance', action: 'view' }]);
