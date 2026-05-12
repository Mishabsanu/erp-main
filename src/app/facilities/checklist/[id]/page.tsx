'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAuditReport } from '@/services/facilityApi';
import { FacilityChecklist } from '@/lib/types';
import { formatDate } from '@/app/utils/formatDate';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  ClipboardCheck, 
  User, 
  Clock, 
  MapPin, 
  Building2,
  FileText,
  Camera,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const AuditDetailView: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [report, setReport] = useState<FacilityChecklist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getAuditReport(id as string);
        setReport(data);
      } catch (error) {
        toast.error('Audit report not found');
        router.push('/facilities/checklist');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!report) return null;

  const facility = report.facilityId as any;
  const inspector = report.inspectorId as any;

  const checkItems = [
    { label: 'Cleanliness', value: report.isClean },
    { label: 'Water Availability', value: report.isWaterAvailable },
    { label: 'Electricity / Power', value: report.isElectricityOK },
    { label: 'Fire Safety', value: report.isFireSafetyOK },
    { label: 'AC & Ventilation', value: report.isACVentilationOK },
    { label: 'Equipment Working', value: report.isEquipmentOK },
    { label: 'Internet Connectivity', value: report.isInternetOK },
    { label: 'Pest Control', value: report.isPestControlOK },
    { label: 'PPE Compliance', value: report.isPPEComplianceOK },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-6 md:p-10">
      <div className="w-full">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-8 font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Audit Logs
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-widest">
                {report.checkFrequency} Audit
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                #{report._id?.toString().slice(-8).toUpperCase()}
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
              Inspection <span className="text-emerald-600">Report</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
             <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
               <Clock size={24} />
             </div>
             <div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Conducted On</div>
               <div className="font-bold text-slate-700">{formatDate(report.date)}</div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Summary */}
          <div className="lg:col-span-1 space-y-8">
            {/* Facility Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[5rem] -mr-10 -mt-10 opacity-50" />
               <div className="relative z-10">
                 <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 mb-6">
                   <Building2 size={28} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 mb-1">{facility?.name || '---'}</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">{facility?.type || 'Node'}</p>
                 
                 <div className="space-y-4 pt-6 border-t border-slate-100">
                   <div className="flex items-center gap-3 text-slate-600">
                     <MapPin size={16} className="text-emerald-600" />
                     <span className="text-sm font-medium">{facility?.location || 'Main Site'}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-600">
                     <User size={16} className="text-emerald-600" />
                     <span className="text-sm font-medium">Inspector: {inspector?.name || 'System'}</span>
                   </div>
                 </div>
               </div>
            </div>

            {/* Remarks Card */}
            <div className="bg-slate-800 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-slate-200">
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-tl-[5rem] -mr-10 -mb-10" />
               <FileText className="text-emerald-400 mb-6" size={28} />
               <h3 className="text-lg font-bold mb-4">Inspector Remarks</h3>
               <p className="text-slate-300 text-sm leading-relaxed italic">
                 "{report.remarks || 'No additional remarks provided for this audit.'}"
               </p>
            </div>
          </div>

          {/* Right Column: Checklist */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
               <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-3">
                   <ClipboardCheck className="text-emerald-600" size={20} />
                   <h3 className="text-lg font-bold text-slate-800">Compliance Checklist</h3>
                 </div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   {checkItems.filter(i => i.value).length} / {checkItems.filter(i => i.value !== undefined).length} Passed
                 </div>
               </div>

               <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                 {checkItems.map((item, idx) => (
                   item.value !== undefined && (
                     <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50">
                       <span className="text-sm font-semibold text-slate-600">{item.label}</span>
                       {item.value ? (
                         <div className="flex items-center gap-2 text-emerald-600">
                           <span className="text-[10px] font-black uppercase tracking-widest">OK</span>
                           <CheckCircle2 size={20} fill="currentColor" className="text-white" />
                         </div>
                       ) : (
                         <div className="flex items-center gap-2 text-rose-500">
                           <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Fail</span>
                           <AlertTriangle size={20} />
                         </div>
                       )}
                     </div>
                   )
                 ))}
               </div>

               {report.photos && report.photos.length > 0 && (
                 <div className="px-10 pb-10">
                   <div className="flex items-center gap-3 mb-6 pt-6 border-t border-slate-100">
                     <Camera className="text-emerald-600" size={20} />
                     <h3 className="text-lg font-bold text-slate-800">Evidence Photos</h3>
                   </div>
                   <div className="flex flex-wrap gap-4">
                     {report.photos.map((photo, idx) => (
                       <div key={idx} className="group relative w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-transform hover:scale-105">
                         <img 
                           src={photo} 
                           alt={`Evidence ${idx + 1}`}
                           className="w-full h-full object-cover"
                         />
                       </div>
                     ))}
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(AuditDetailView, [{ module: 'facility_audit', action: 'view' }]);
