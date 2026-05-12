'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  Calendar, 
  Wrench, 
  ArrowLeft,
  Activity,
  History,
  TrendingUp,
  FileText,
  Clock,
  Gauge
} from 'lucide-react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { getMechanicalLogs, getVehicle } from '@/services/fleetApi';
import withAuth from '@/components/withAuth';
import { format, subDays, startOfToday } from 'date-fns';
import { MechanicalCheckup, Vehicle } from '@/lib/types';
import { Column, DataTable } from '@/components/shared/DataTable';

const VehicleHistoryDashboard = () => {
  const params = useParams();
  const vehicleId = (params?.vehicleId as string) || '';
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [logs, setLogs] = useState<MechanicalCheckup[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Period Filtering
  const [period, setPeriod] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchVehicleInfo = useCallback(async () => {
    try {
      if (typeof vehicleId === 'string') {
        const data = await getVehicle(vehicleId);
        setVehicle(data);
      }
    } catch (error) {
      toast.error('Failed to load vehicle details');
    }
  }, [vehicleId]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      let startDate = undefined;
      const today = startOfToday();
      
      if (period === 'today') startDate = format(today, 'yyyy-MM-dd');
      else if (period === 'week') startDate = format(subDays(today, 7), 'yyyy-MM-dd');
      else if (period === 'month') startDate = format(subDays(today, 30), 'yyyy-MM-dd');
      else if (period === 'year') startDate = format(subDays(today, 365), 'yyyy-MM-dd');

      const response = await getMechanicalLogs({
        vehicleId: vehicleId as string,
        page: currentPage,
        limit,
        startDate
      });
      
      setLogs(response.data.content);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [vehicleId, period, currentPage, limit]);

  useEffect(() => {
    fetchVehicleInfo();
  }, [fetchVehicleInfo]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const columns: Column<MechanicalCheckup>[] = useMemo(() => [
    {
      accessor: 'date',
      header: 'Inspection Date',
      render: (log) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{format(new Date(log.date), 'dd MMM yyyy')}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{format(new Date(log.date), 'EEEE')}</span>
        </div>
      )
    },
    {
      accessor: 'status',
      header: 'Diagnosis',
      render: (log) => {
        const colors = {
          Fit: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          'Needs Maintenance': 'bg-amber-50 text-amber-700 border-amber-100',
          Grounded: 'bg-red-50 text-red-700 border-red-100'
        };
        const Icon = log.status === 'Fit' ? CheckCircle2 : AlertTriangle;
        return (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${colors[log.status]}`}>
            <Icon size={12} />
            {log.status}
          </div>
        )
      }
    },
    {
      accessor: 'odometer',
      header: 'Kilometers',
      render: (log) => (
        <div className="flex items-center gap-2">
           <Gauge size={14} className="text-gray-400" />
           <span className="font-mono font-bold text-gray-700">{log.odometer.toLocaleString()} <span className="text-[9px] text-gray-400 uppercase">km</span></span>
        </div>
      )
    },
    {
       header: 'Components Health',
       accessor: 'partsCondition' as any,
       render: (log) => {
          const parts = Object.values(log.partsCondition).map(p => typeof p === 'object' ? (p as any).status : p);
          const healthy = parts.filter(s => s === 'Good' || s === 'OK' || s === 'Working').length;
          const total = parts.length;
          const percentage = Math.round((healthy / total) * 100);
          
          return (
            <div className="flex flex-col gap-1 w-32">
               <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Health Index</span>
                  <span className={percentage === 100 ? 'text-emerald-600' : 'text-amber-600'}>{percentage}%</span>
               </div>
               <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${percentage === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${percentage}%` }} />
               </div>
            </div>
          )
       }
    },
    {
       header: 'Actions',
       accessor: '_id' as any,
       render: (log) => (
         <button 
           onClick={() => router.push(`/fleet/mechanical/${log._id}`)}
           className="p-2 hover:bg-indigo-50 rounded-xl text-indigo-600 transition-all group"
         >
           <FileText size={18} className="group-hover:scale-110 transition-transform" />
         </button>
       )
    }
  ], []);

  if (!vehicle && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <History className="animate-spin text-indigo-600" size={48} />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reconstructing Diagnostic History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-[1600px]">
        <button 
          onClick={() => router.replace('/fleet/reports')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-indigo-600 mb-8 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Reports
        </button>

        <ListPageHeader
          eyebrow={`Fleet Diagnostic History — ${vehicle?.plateNo}`}
          title={vehicle?.name || 'Vehicle'}
          highlight="History"
          description={`Comprehensive diagnostic timeline and health analytics for ${vehicle?.name}. Analyze performance across different time periods.`}
        />

        {/* PERIOD SELECTOR & STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12 mb-10">
           {/* QUICK STATS */}
           <div className="lg:col-span-3 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 flex items-center justify-around">
              <div className="flex flex-col items-center">
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Audits</span>
                 <span className="text-2xl font-black text-gray-800">{totalCount}</span>
              </div>
              <div className="w-px h-10 bg-gray-100" />
              <div className="flex flex-col items-center">
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Odo</span>
                 <span className="text-2xl font-black text-emerald-600">{vehicle?.odometer.toLocaleString()} <span className="text-xs">km</span></span>
              </div>
              <div className="w-px h-10 bg-gray-100" />
              <div className="flex flex-col items-center">
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Health Trend</span>
                 <div className="flex items-center gap-2 text-emerald-600">
                    <TrendingUp size={18} />
                    <span className="text-base font-black uppercase">Stable</span>
                 </div>
              </div>
           </div>

           {/* PERIOD TABS */}
           <div className="lg:col-span-1 bg-gray-100 p-1.5 rounded-[1.5rem] flex items-center">
              {[
                { id: 'all', label: 'All' },
                { id: 'today', label: 'Day' },
                { id: 'week', label: 'Week' },
                { id: 'month', label: 'Month' },
                { id: 'year', label: 'Year' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPeriod(p.id as any); setCurrentPage(1); }}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p.id ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-900/10' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {p.label}
                </button>
              ))}
           </div>
        </div>

        {/* LOGS TABLE */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
           <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Activity size={20} />
                 </div>
                 <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Diagnostic Timeline</h3>
              </div>
              <div className="px-4 py-2 bg-gray-50 rounded-full border border-gray-100 flex items-center gap-2">
                 <Clock size={14} className="text-gray-400" />
                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Showing {logs.length} Diagnostic Events</span>
              </div>
           </div>

           <div className="p-4">
              {loading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                   <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Diagnostic History...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-4 text-center">
                   <AlertTriangle className="text-gray-200" size={64} />
                   <h4 className="text-lg font-black text-gray-400 uppercase tracking-tight">No Diagnostic Records Found</h4>
                   <p className="text-xs text-gray-400 max-w-xs px-10">There are no inspection logs available for the selected time period.</p>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={logs}
                  serverSidePagination={true}
                  totalCount={totalCount}
                  currentPage={currentPage}
                  limit={limit}
                  totalPages={Math.ceil(totalCount / limit)}
                  onPageChange={setCurrentPage}
                  onLimitChange={setLimit}
                />
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(VehicleHistoryDashboard, [{ module: 'fleet', action: 'view' }]);
