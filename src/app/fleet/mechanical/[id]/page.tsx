'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  Calendar, 
  User, 
  Wrench, 
  Droplets, 
  Zap, 
  ArrowLeft,
  Camera,
  MessageSquare,
  Activity,
  History,
  Eye
} from 'lucide-react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { getCheckupDetails } from '@/services/fleetApi';
import withAuth from '@/components/withAuth';
import { format } from 'date-fns';
import { MechanicalCheckup } from '@/lib/types';

const CheckupDetailPage = () => {
  const params = useParams();
  const id = (params?.id as string) || '';
  const router = useRouter();
  const [log, setLog] = useState<MechanicalCheckup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (typeof id === 'string') {
          const data = await getCheckupDetails(id);
          setLog(data);
        }
      } catch (error) {
        toast.error('Failed to load checkup details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Wrench className="animate-spin text-teal-600" size={48} />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Retrieving Inspection Data...</p>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50">
        <AlertTriangle size={64} className="text-red-500" />
        <h2 className="text-2xl font-black text-gray-900 uppercase">Report Not Found</h2>
        <button onClick={() => router.back()} className="page-header-button secondary">
           Go Back
        </button>
      </div>
    );
  }

  const v = log.vehicleId as any;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-[1600px]">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-teal-600 mb-8 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Return to Registry
        </button>

        <ListPageHeader
          eyebrow={`Inspection ID: ${log._id?.slice(-8).toUpperCase()}`}
          title="Diagnostic"
          highlight="Manifest"
          description={`Comprehensive health report for ${v?.name || 'Vehicle'} recorded on ${format(new Date(log.date), 'PPPP')}.`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12">
          {/* STATS COLUMN */}
          <div className="lg:col-span-1 space-y-8">
            {/* FIT STATUS CARD */}
            <div className={`p-10 rounded-[3rem] border-2 shadow-2xl flex flex-col items-center text-center transition-all ${
              log.status === 'Fit' 
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-900/40' 
                : log.status === 'Grounded'
                ? 'bg-red-600 border-red-500 text-white shadow-red-900/40'
                : 'bg-amber-500 border-amber-400 text-white shadow-amber-900/40'
            }`}>
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                 {log.status === 'Fit' ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Deployment Status</p>
              <h3 className="text-4xl font-black uppercase tracking-tighter mt-1">{log.status}</h3>
              <div className="mt-8 pt-8 border-t border-white/10 w-full flex flex-col gap-2">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Odometer Check</p>
                 <p className="text-2xl font-black">{log.odometer.toLocaleString()} <span className="text-xs opacity-60 uppercase font-black tracking-widest ml-1">KM</span></p>
              </div>
            </div>

            {/* VEHICLE IDENTITY */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-teal-600">
                    <Truck size={20} />
                  </div>
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Asset Details</h4>
               </div>
               <div className="space-y-4">
                  <div className="flex flex-col py-3 border-b border-gray-50">
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Name</span>
                     <span className="text-sm font-black text-gray-800">{v?.name || '--'}</span>
                  </div>
                  <div className="flex flex-col py-3 border-b border-gray-50">
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Plate No</span>
                     <span className="text-sm font-black text-teal-700 mt-1">{v?.plateNo || '--'}</span>
                  </div>
                  <div className="flex flex-col py-3">
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</span>
                     <span className="text-sm font-bold text-gray-700">{v?.type || '--'}</span>
                  </div>
               </div>
            </div>

            {/* INSPECTOR INFO */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <User size={20} />
                  </div>
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Audited By</h4>
               </div>
               <p className="text-base font-black text-gray-800">{(log.inspectorId as any)?.name || 'System Operator'}</p>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Certified Mechanic</p>
            </div>
          </div>

          {/* REPORT COLUMN */}
          <div className="lg:col-span-3 space-y-8">
            {/* DIAGNOSTIC TABLE */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-slate-200/50">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                      <Activity size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Technical Diagnostics</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Component-Level Inspection Matrix</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Water Wash</span>
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${log.isWaterWashed ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-400"}`}>
                           {log.isWaterWashed ? "Completed" : "Not Done"}
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Internal Cleaning</span>
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${log.isClean ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}`}>
                           {log.isClean ? "Spotless" : "Standard"}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="w-full overflow-hidden rounded-[2rem] border border-gray-100 mb-8">
                  <table className="w-full">
                     <thead className="bg-gray-50/50">
                        <tr>
                           <th className="text-left px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Component Name</th>
                           <th className="text-left px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Status</th>
                           <th className="text-left px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Inspector Notes</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {Object.entries(log.partsCondition).map(([part, condition]) => {
                          const isObject = typeof condition === 'object' && condition !== null;
                          const status = isObject ? (condition as any).status : condition;
                          const remarks = isObject ? (condition as any).remarks : '-';
                          const isAlert = status !== 'Good' && status !== 'OK' && status !== 'Working';
                          
                          return (
                            <tr key={part} className="hover:bg-gray-50/50 transition-all">
                              <td className="px-8 py-6">
                                <span className="text-sm font-black text-gray-700 uppercase tracking-tight">{part.replace(/([A-Z])/g, ' $1')}</span>
                              </td>
                              <td className="px-8 py-6">
                                 <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${isAlert ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isAlert ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{status as string}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="text-xs text-gray-500 font-medium italic">{remarks || 'No specific remarks'}</p>
                              </td>
                            </tr>
                          );
                        })}
                     </tbody>
                  </table>
               </div>

               {/* OVERALL REMARKS */}
               <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative shadow-2xl shadow-slate-900/40">
                  <div className="absolute top-8 left-8">
                     <MessageSquare size={48} className="text-white/10" />
                  </div>
                  <div className="pl-16">
                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-4">Diagnostic Narrative Summary</p>
                    <p className="text-lg font-medium leading-relaxed opacity-90 italic">
                      "{log.remarks || 'The vehicle has undergone a full mechanical evaluation. All systems identified above were checked for operational integrity. No additional summary remarks provided.'}"
                    </p>
                  </div>
               </div>
            </div>

            {/* PHOTOS SLIDER */}
            {log.photos && log.photos.length > 0 && (
               <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
                      <Camera size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Visual Audit <span className="text-indigo-600">Evidence</span></h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">High-Resolution Damage & Maintenance Capture</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                     {log.photos.map((photo, i) => (
                       <a key={i} href={photo.startsWith('http') ? photo : `http://localhost:5000/${photo}`} target="_blank" rel="noreferrer" className="aspect-square bg-gray-100 rounded-3xl overflow-hidden border-2 border-transparent hover:border-indigo-600 transition-all group relative">
                          <img src={photo.startsWith('http') ? photo : `http://localhost:5000/${photo}`} alt={`Ins-Photo-${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <Eye size={24} className="text-white" />
                          </div>
                       </a>
                     ))}
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(CheckupDetailPage, [{ module: 'fleet', action: 'view' }]);
