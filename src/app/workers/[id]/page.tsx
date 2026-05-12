'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFileUrl } from '@/app/utils/fileUtils';
import { 
  User, Mail, Phone, MapPin, Calendar, ArrowLeft, 
  Package, FileText, ShieldCheck, Briefcase, Plus, 
  Trash2, History, CheckCircle2, Globe, CreditCard, 
  Fingerprint, Award, DollarSign, Clock, AlertCircle,
  Share2, Printer, Shield, Heart, GraduationCap, Download,
  ExternalLink, Menu, Minus, Zap, ShieldAlert,
  CalendarCheck, PieChart, Wallet, Receipt
} from 'lucide-react';
import { getWorker } from '@/services/workerApi';
import { getWorkerUtilities, issueBulkUtilities, deleteUtility, updateUtilityStatus } from '@/services/workerUtilityApi';
import { Worker, WorkerUtility } from '@/lib/types';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/app/utils/formatDate';
import { getSlips } from '@/services/payrollApi';
import { getUtilityDropdown } from '@/services/utilityItemApi';

const calculateTenure = (joinDate: string) => {
  if (!joinDate) return 'N/A';
  const start = new Date(joinDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) return `${diffDays} Days`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} Months`;
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  return `${years}Y ${months > 0 ? `${months}M` : ''}`;
};

const getExpiryStatus = (date: string | undefined) => {
  if (!date) return { label: 'Not Set', color: 'text-slate-400', bg: 'bg-slate-50', icon: <Shield size={12} /> };
  const expiry = new Date(date);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { label: 'Expired', color: 'text-rose-600', bg: 'bg-rose-50', icon: <ShieldAlert size={12} /> };
  if (diffDays <= 30) return { label: `${diffDays}d Left`, color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={12} /> };
  return { label: `${diffDays}d Valid`, color: 'text-teal-600', bg: 'bg-teal-50', icon: <CheckCircle2 size={12} /> };
};

const calculateDaysUntilBirthday = (dob: string | undefined) => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

function WorkerProfilePage() {
  const params = useParams();
  const id = (params?.id as string) || '';
  const router = useRouter();
  const { can } = useAuth();
  
  const [worker, setWorker] = useState<Worker | null>(null);
  const [utilities, setUtilities] = useState<WorkerUtility[]>([]);
  const [latestSlip, setLatestSlip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'utilities' | 'attendance' | 'leave' | 'payroll'>('overview');
  const [utilityMaster, setUtilityMaster] = useState<any[]>([]);
  
  // Issuance states
  const [showIssuanceForm, setShowIssuanceForm] = useState(false);
  const [forceIssue, setForceIssue] = useState(false);
  const [utilityItems, setUtilityItems] = useState([
    { utilityItemId: '', itemName: '', size: '', quantity: 1, cost: 0, isRecoverable: false, issueDate: new Date().toISOString().split('T')[0], expiryDate: '', autoExpiry: true }
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [workerData, utilsData, slipsData, utilityMasterData] = await Promise.all([
        getWorker(id as string),
        getWorkerUtilities(id as string),
        getSlips({ user: id as string }),
        getUtilityDropdown()
      ]);
      setWorker(workerData);
      setUtilities(utilsData);
      setUtilityMaster(utilityMasterData.data || utilityMasterData);
      if (slipsData && slipsData.length > 0) {
         setLatestSlip(slipsData[0]);
      }
    } catch (error) {
      console.error('Error fetching worker data:', error);
      toast.error('Failed to load personnel profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addUtilityRow = () => {
    setUtilityItems([...utilityItems, { 
      utilityItemId: '',
      itemName: '', 
      size: '',
      quantity: 1, 
      cost: 0, 
      isRecoverable: false, 
      issueDate: new Date().toISOString().split('T')[0], 
      expiryDate: '',
      autoExpiry: true
    }]);
  };

  const removeUtilityRow = (index: number) => {
    if (utilityItems.length === 1) return;
    setUtilityItems(utilityItems.filter((_, i) => i !== index));
  };

  const updateUtilityRow = (index: number, field: string, value: any) => {
    const updated = [...utilityItems];
    (updated[index] as any)[field] = value;
    
    if (field === 'itemName') {
      const variants = utilityMaster.filter(u => u.name === value);
      if (variants.length > 0) {
        updated[index].size = variants[0].size || 'N/A';
        updated[index].cost = variants[0].rate || 0;
        updated[index].utilityItemId = variants[0]._id;
      }
    }

    if (field === 'size') {
      const variant = utilityMaster.find(u => u.name === updated[index].itemName && u.size === value);
      if (variant) {
        updated[index].cost = variant.rate || 0;
        updated[index].utilityItemId = variant._id;
      }
    }

    if (field === 'autoExpiry' && value === true) {
      const issueDate = new Date(updated[index].issueDate);
      issueDate.setFullYear(issueDate.getFullYear() + 1);
      updated[index].expiryDate = issueDate.toISOString().split('T')[0];
    } else if (field === 'issueDate' && updated[index].autoExpiry) {
      const issueDate = new Date(value);
      issueDate.setFullYear(issueDate.getFullYear() + 1);
      updated[index].expiryDate = issueDate.toISOString().split('T')[0];
    }
    
    setUtilityItems(updated);
  };

  const handleIssueBulk = async () => {
    if (utilityItems.some(i => !i.itemName)) return toast.error('Check item names');
    
    try {
      await issueBulkUtilities(id as string, utilityItems, forceIssue);
      toast.success('Utilities issued successfully');
      setShowIssuanceForm(false);
      setUtilityItems([{ utilityItemId: '', itemName: '', size: '', quantity: 1, cost: 0, isRecoverable: false, issueDate: new Date().toISOString().split('T')[0], expiryDate: '', autoExpiry: true }]);
      setForceIssue(false);
      fetchData();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Conflict detected: Some items are still valid. Enable "Force Issuance" to proceed.');
      } else {
        toast.error('Failed to issue utilities');
      }
    }
  };

  const handleDeleteUtility = async (utilId: string) => {
    toast.warning('Remove this utility record?', {
      action: {
        label: 'Remove',
        onClick: async () => {
          try {
            await deleteUtility(utilId);
            toast.success('Utility record removed');
            fetchData();
          } catch (error) {
            toast.error('Failed to remove record');
          }
        }
      }
    });
  };

  const handleWhatsAppShare = () => {
    if (!worker) return;
    let salaryText = '';
    if (latestSlip) {
      const monthName = new Date(latestSlip.year, latestSlip.month - 1).toLocaleString('default', { month: 'long' });
      salaryText = `\n*Latest Salary Slip (${monthName} ${latestSlip.year})*\nNet Salary: ${latestSlip.netSalary} QAR\nStatus: ${latestSlip.status.toUpperCase()}`;
    }

    const text = `*Personnel Profile Report - Akod ERP*\n\nName: ${worker.name}\nID: ${worker.workerId}\nDesignation: ${worker.designation}\nJoin Date: ${formatDate(worker.joinDate)}\nTenure: ${calculateTenure(worker.joinDate || '')}${salaryText}\n\n_Generated via Akod ERP System_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading || !worker) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-8 md:p-12 space-y-12 animate-in fade-in duration-700">
         <div className="flex items-center gap-6 mb-12">
            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 shadow-sm" />
            <div className="space-y-2">
               <div className="h-3 w-32 bg-slate-100 rounded-full animate-pulse" />
               <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
               <div key={i} className="h-40 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8" />
            ))}
         </div>
         <div className="h-[500px] bg-white rounded-[4rem] border border-slate-100 shadow-sm" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50/30 p-6 md:p-12 print:p-0 print:bg-white">
      {/* ── TOP NAV ACTIONS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 print:hidden">
         <div className="flex items-center gap-5">
            <button 
               onClick={() => router.back()}
               className="w-14 h-14 bg-white rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:text-teal-700 border border-slate-100 shadow-xl shadow-slate-200/50 transition-all hover:-translate-x-1 active:scale-90"
            >
               <ArrowLeft size={22} strokeWidth={2.5} />
            </button>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">Personnel Operations / Workstation</p>
               <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight flex items-center gap-3">
                 Profile <span className="w-2 h-2 bg-primary rounded-full animate-pulse" /> <span className="text-primary">{worker.workerId}</span>
               </h1>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button 
               onClick={() => window.print()}
               className="flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/40 hover:bg-slate-50 transition-all"
            >
               <Printer size={16} /> Print Report
            </button>
            <button 
               onClick={handleWhatsAppShare}
               className="flex items-center gap-3 px-8 py-3.5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-teal-900/20 hover:scale-105 active:scale-95 transition-all"
            >
               <Share2 size={16} /> WhatsApp Share
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* ── LEFT: VISUAL ID CARD ── */}
        <div className="xl:col-span-3 space-y-8 print:col-span-4">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 relative overflow-hidden text-center group">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
              <div className="relative inline-block mb-8">
                 <div className="w-40 h-40 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-300 border-4 border-white shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    {worker.photo ? (
                      <img src={getFileUrl(worker.photo)} alt={worker.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={80} strokeWidth={1} />
                    )}
                 </div>
                 <div className={`absolute bottom-2 right-2 w-8 h-8 rounded-full border-4 border-white shadow-xl ${worker.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              </div>
              
              <h2 className="text-2xl font-black text-[#0f172a] mb-2 tracking-tight">{worker.name}</h2>
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-10 bg-teal-50/50 py-2 rounded-full border border-teal-100/50">{worker.designation || 'Specialist Staff'}</p>
              
              <div className="space-y-5 text-left border-t border-slate-50 pt-10">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                       <Globe size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Origin</span>
                    </div>
                    <span className="text-xs font-black text-slate-700 uppercase">{worker.nationality || '--'}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                       <Phone size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Mobile</span>
                    </div>
                    <span className="text-xs font-black text-slate-700">{worker.mobile || '--'}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                       <MapPin size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Facility</span>
                    </div>
                    <span className="text-xs font-black text-slate-700 uppercase">{(worker.facilityId as any)?.name || 'N/A'}</span>
                 </div>
              </div>
           </div>

           <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl shadow-teal-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
              <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                 <ShieldCheck size={12} className="text-white" /> Operational Readiness
              </p>
              <div className="space-y-6">
                 {[
                   { label: 'QID Status', val: worker.qidExpiryDate },
                   { label: 'Passport Status', val: worker.passportExpiryDate }
                 ].map((doc, idx) => {
                   const status = getExpiryStatus(doc.val);
                   return (
                     <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/50">
                           <span>{doc.label}</span>
                           <span className={status.color.replace('text-teal-600', 'text-white')}>{status.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                           <div className={`h-full rounded-full bg-white`} style={{ width: doc.val ? '100%' : '0%' }} />
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>
        </div>

        {/* ── RIGHT: INTERACTIVE WORKSTATION ── */}
        <div className="xl:col-span-9 space-y-10 print:col-span-8">
           <div className="flex items-center gap-3 p-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 w-fit overflow-x-auto print:hidden no-scrollbar">
              {[
                { id: 'overview', label: 'Summary', icon: <Briefcase size={16} /> },
                { id: 'utilities', label: 'Gear', icon: <Package size={16} /> },
                { id: 'documents', label: 'Vault', icon: <ShieldCheck size={16} /> },
                { id: 'attendance', label: 'Attendance', icon: <CalendarCheck size={16} /> },
                { id: 'leave', label: 'Leave', icon: <PieChart size={16} /> },
                { id: 'payroll', label: 'Financials', icon: <Wallet size={16} /> }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-white shadow-2xl shadow-teal-900/30 scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
           </div>

           {activeTab === 'overview' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Clock size={20} /></div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Tenure</span>
                       </div>
                       <p className="text-2xl font-black text-[#0f172a] tracking-tight">{calculateTenure(worker.joinDate || '')}</p>
                       <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Joined: {formatDate(worker.joinDate)}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center"><Heart size={20} /></div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Birthday</span>
                       </div>
                       <p className="text-2xl font-black text-[#0f172a] tracking-tight">{calculateDaysUntilBirthday(worker.dateOfBirth)} Days</p>
                       <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{formatDate(worker.dateOfBirth)}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center"><DollarSign size={20} /></div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary Snapshot</span>
                       </div>
                       <p className="text-2xl font-black text-primary tracking-tight">{latestSlip ? `${latestSlip.netSalary} QAR` : '--'}</p>
                       <p className="text-[10px] font-bold text-primary mt-1 uppercase">Latest: {latestSlip ? `${latestSlip.month}/${latestSlip.year}` : 'No Record'}</p>
                    </div>
                 </div>

                 <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/30 relative">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-2 h-8 bg-teal-700 rounded-full" />
                       <h3 className="text-[14px] font-black text-[#0f172a] uppercase tracking-[0.4em]">Professional Persona</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Engagement Remarks</p>
                          <div className="p-10 bg-slate-50/50 rounded-[3rem] text-sm text-slate-600 font-medium leading-relaxed min-h-[200px] border border-slate-100 border-dashed">
                             {worker.remarks || 'No internal disciplinary or recognition records found for this member.'}
                          </div>
                       </div>
                       
                       <div className="space-y-8">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Specialized Certifications</p>
                          <div className="space-y-4">
                             {worker.skills?.length > 0 ? worker.skills.map((skill: any, idx: number) => (
                               <div key={idx} className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100 hover:border-teal-200 transition-all shadow-sm">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center"><Award size={18} /></div>
                                     <span className="text-xs font-black text-slate-700 uppercase">{skill.skillName}</span>
                                  </div>
                                  {skill.certificateDoc && (
                                    <a href={getFileUrl(skill.certificateDoc)} target="_blank" className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"><ExternalLink size={16} /></a>
                                  )}
                               </div>
                             )) : (
                               <div className="p-10 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                  <GraduationCap className="mx-auto text-slate-300 mb-3" size={32} />
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No certifications linked</p>
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'utilities' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                 <div className="flex justify-between items-end">
                    <div>
                       <div className="flex items-center gap-3 mb-3">
                          <div className="w-1.5 h-6 bg-teal-700 rounded-full" />
                          <h3 className="text-[12px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Operational Gear Ledger</h3>
                       </div>
                       <p className="text-slate-400 text-[11px] font-bold px-4 uppercase tracking-widest">Tracking industrial assets and safety equipment issued.</p>
                    </div>
                    <button 
                       onClick={() => setShowIssuanceForm(!showIssuanceForm)}
                       className={`px-8 py-4 ${showIssuanceForm ? 'bg-slate-100 text-slate-600' : 'bg-teal-700 text-white'} rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-teal-950/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3`}
                    >
                      {showIssuanceForm ? <Minus size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                      {showIssuanceForm ? 'Cancel Issuance' : 'Issue Item(s)'}
                    </button>
                 </div>

                 {showIssuanceForm && (
                    <div className="bg-white rounded-[4rem] shadow-2xl border border-teal-100/30 p-12 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/30 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                       <div className="flex justify-between items-start mb-12 relative">
                         <div>
                           <h3 className="text-2xl font-black text-[#0f172a] mb-2 uppercase tracking-tight">New <span className="text-teal-700">Issuance</span></h3>
                           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Assign items and manage financial recovery cycles.</p>
                         </div>
                         <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Force Overwrite</span>
                           <button 
                             onClick={() => setForceIssue(!forceIssue)}
                             className={`w-12 h-6 rounded-full transition-all relative ${forceIssue ? 'bg-rose-500' : 'bg-slate-200'}`}
                           >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${forceIssue ? 'left-7' : 'left-1'}`} />
                           </button>
                         </div>
                       </div>
                       
                       <div className="space-y-6">
                          {utilityItems.map((item, idx) => {
                            const availableSizes = Array.from(new Set(utilityMaster.filter(u => u.name === item.itemName).map(u => u.size || 'N/A')));
                            const uniqueNames = Array.from(new Set(utilityMaster.map(u => u.name)));
                            
                            return (
                            <div key={idx} className="grid grid-cols-12 gap-6 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 group animate-in slide-in-from-left duration-300 relative">
                               <div className="col-span-3 space-y-3">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Item Description</label>
                                  <select 
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:border-teal-700 transition-all cursor-pointer shadow-sm"
                                    value={item.itemName}
                                    onChange={(e) => updateUtilityRow(idx, 'itemName', e.target.value)}
                                  >
                                    <option value="">Select Gear / Item</option>
                                    {uniqueNames.map((name) => (
                                      <option key={name} value={name}>{name}</option>
                                    ))}
                                  </select>
                               </div>
                               <div className="col-span-1 space-y-3">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 text-center block">Size</label>
                                  <select 
                                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-teal-700 outline-none focus:border-teal-700 transition-all cursor-pointer shadow-sm"
                                    value={item.size}
                                    disabled={!item.itemName}
                                    onChange={(e) => updateUtilityRow(idx, 'size', e.target.value)}
                                  >
                                    {availableSizes.length > 0 ? availableSizes.map((s) => (
                                      <option key={s} value={s}>{s}</option>
                                    )) : <option value="N/A">N/A</option>}
                                  </select>
                               </div>
                               <div className="col-span-1 space-y-3 text-center">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 block">Qty</label>
                                  <input 
                                    type="number" 
                                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:border-teal-700 transition-all text-center shadow-sm"
                                    value={item.quantity}
                                    onChange={(e) => updateUtilityRow(idx, 'quantity', parseInt(e.target.value))}
                                  />
                               </div>
                               <div className="col-span-2 space-y-3">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Value (QAR)</label>
                                  <div className="relative">
                                     <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                     <input 
                                       type="number" 
                                       className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:border-teal-700 transition-all shadow-sm"
                                       value={item.cost}
                                       onChange={(e) => updateUtilityRow(idx, 'cost', parseFloat(e.target.value))}
                                     />
                                  </div>
                               </div>
                               <div className="col-span-1 space-y-3 text-center">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Recover?</label>
                                  <div className="h-[52px] flex items-center justify-center">
                                     <input 
                                       type="checkbox" 
                                       className="w-6 h-6 accent-teal-700 cursor-pointer rounded-lg"
                                       checked={item.isRecoverable}
                                       onChange={(e) => updateUtilityRow(idx, 'isRecoverable', e.target.checked)}
                                     />
                                  </div>
                               </div>
                               <div className="col-span-3 space-y-3">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 text-center block">Validity Cycle</label>
                                  <div className="h-[52px] flex items-center justify-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-4">
                                     <button 
                                       onClick={() => updateUtilityRow(idx, 'autoExpiry', !item.autoExpiry)}
                                       className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${item.autoExpiry ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}
                                     >
                                       <Zap size={10} strokeWidth={3} />
                                       <span className="text-[9px] font-black uppercase">1Y Auto</span>
                                     </button>
                                     {!item.autoExpiry && (
                                       <input 
                                         type="date" 
                                         className="text-[10px] font-black bg-transparent outline-none text-teal-700" 
                                         value={item.expiryDate} 
                                         onChange={(e) => updateUtilityRow(idx, 'expiryDate', e.target.value)} 
                                       />
                                     )}
                                  </div>
                               </div>
                               <div className="col-span-1 flex items-end justify-center pb-2">
                                  {utilityItems.length > 1 && (
                                    <button 
                                      onClick={() => removeUtilityRow(idx)}
                                      className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  )}
                               </div>
                            </div>
                          )})}
                       </div>

                       <div className="mt-12 pt-10 border-t border-slate-50 flex justify-between items-center relative">
                          <button 
                            onClick={addUtilityRow}
                            className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-100 text-teal-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-50 transition-all shadow-sm"
                          >
                            <Plus size={16} strokeWidth={3} /> Add More Items
                          </button>
                          <div className="flex gap-4">
                             <button 
                               onClick={() => {
                                 setShowIssuanceForm(false);
                                 setUtilityItems([{ utilityItemId: '', itemName: '', size: '', quantity: 1, cost: 0, isRecoverable: false, issueDate: new Date().toISOString().split('T')[0], expiryDate: '', autoExpiry: true }]);
                               }}
                               className="px-10 py-4 rounded-2xl border border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                             >
                               Discard
                             </button>
                             <button 
                               onClick={handleIssueBulk}
                               disabled={loading || utilityItems.some(item => !item.itemName)}
                               className="px-12 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-teal-900/30 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                             >
                               Finalize Issuance
                             </button>
                          </div>
                       </div>
                    </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {utilities.length === 0 ? (
                      <div className="col-span-full p-24 bg-white rounded-[4rem] border border-dashed border-slate-200 text-center space-y-5 shadow-xl shadow-slate-200/20">
                         <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-slate-100 shadow-inner">
                            <Package className="text-slate-200" size={32} />
                         </div>
                         <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">No gear records found in the registry.</p>
                      </div>
                    ) : utilities.map((util) => (
                      <div key={util._id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 group hover:border-teal-200 transition-all relative overflow-hidden">
                         <div className="flex justify-between items-start mb-8 relative">
                            <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-[1.5rem] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner border border-slate-100">
                               <Package size={24} />
                            </div>
                            <div className="flex gap-2">
                               <button onClick={() => handleDeleteUtility(util._id!)} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                  <Trash2 size={16} />
                               </button>
                            </div>
                         </div>
                         <h4 className="text-xl font-black text-[#0f172a] tracking-tight mb-2">
                           {util.itemName} {util.size && util.size !== 'N/A' && <span className="text-teal-600">({util.size})</span>}
                         </h4>
                         <div className="flex items-center gap-4 mb-6">
                            <div className="w-1 h-4 bg-teal-700 rounded-full opacity-40" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Qty: {util.quantity} UNIT</span>
                            {(util as any).cost > 0 && (
                              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                — {Number((util as any).cost).toLocaleString()} QAR
                              </span>
                            )}
                         </div>
                         
                         <div className="space-y-4 pt-6 border-t border-slate-50 relative">
                            <div className="flex justify-between text-[11px] font-black">
                               <span className="text-slate-400 uppercase tracking-widest">Issued</span>
                               <span className="text-slate-700">{formatDate(util.issueDate)}</span>
                            </div>
                            {util.expiryDate && (
                              <div className="flex justify-between text-[11px] font-black">
                                 <span className="text-slate-400 uppercase tracking-widest">Expiry</span>
                                 <span className={new Date(util.expiryDate) < new Date() ? 'text-rose-600' : 'text-teal-700'}>
                                    {formatDate(util.expiryDate)}
                                 </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center mt-4">
                               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                 util.status === 'issued' ? 'bg-teal-50 text-teal-700 border-teal-100' : 
                                 util.status === 'expired' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                               }`}>
                                 {util.status}
                               </span>
                               {util.expiryDate && new Date(util.expiryDate) < new Date() && (
                                 <div className="flex items-center gap-2 text-rose-500 animate-pulse bg-rose-50 px-3 py-1.5 rounded-full">
                                    <ShieldAlert size={14} />
                                    <span className="text-[9px] font-black uppercase">Service Required</span>
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           )}

           {activeTab === 'documents' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
                 <div className="flex items-center gap-4 mb-2">
                    <div className="w-2 h-8 bg-teal-700 rounded-full" />
                    <h3 className="text-[14px] font-black text-[#0f172a] uppercase tracking-[0.4em]">Primary Legal Vault</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {worker.qidDoc && <DocCard title="Qatar ID" path={worker.qidDoc} />}
                    {worker.passportDoc && <DocCard title="International Passport" path={worker.passportDoc} />}
                    {worker.cv && <DocCard title="Curriculum Vitae" path={worker.cv} />}
                    {worker.insuranceDoc && <DocCard title="Insurance Health" path={worker.insuranceDoc} />}
                    {worker.healthCardDoc && <DocCard title="Hamad Health Card" path={worker.healthCardDoc} />}
                 </div>

                 {worker.skills?.length > 0 && (
                   <div className="pt-12 border-t border-slate-100">
                      <div className="flex items-center gap-4 mb-10">
                         <div className="w-2 h-8 bg-amber-500 rounded-full" />
                         <h3 className="text-[14px] font-black text-[#0f172a] uppercase tracking-[0.4em]">Skill Certifications</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                         {worker.skills.map((skill: any, idx: number) => (
                            skill.certificateDoc ? (
                               <DocCard key={idx} title={skill.skillName || 'Certification'} path={skill.certificateDoc} />
                            ) : skill.skillName ? (
                               <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 flex items-center gap-6 shadow-xl shadow-slate-200/20">
                                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-inner border border-slate-100">
                                     <Award size={28} />
                                  </div>
                                  <div>
                                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Certification</h4>
                                     <p className="text-md font-black text-slate-700 tracking-tight">{skill.skillName}</p>
                                  </div>
                               </div>
                            ) : null
                         ))}
                      </div>
                   </div>
                 )}
              </div>
           )}

           {activeTab === 'attendance' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                 <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/30 text-center space-y-6">
                    <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-indigo-100 shadow-inner">
                       <CalendarCheck className="text-indigo-400" size={40} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-[#0f172a] mb-2 uppercase tracking-tight">Attendance <span className="text-indigo-600">Workstation</span></h3>
                       <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
                          Synchronizing with biometric nodes. Live duty rosters and overtime analytics will be visualized here.
                       </p>
                    </div>
                    <div className="flex justify-center gap-4 pt-6">
                       <div className="px-8 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                          <p className="text-xs font-black text-emerald-600 uppercase">System Ready</p>
                       </div>
                       <div className="px-8 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sync</p>
                          <p className="text-xs font-black text-indigo-600 uppercase">Automatic</p>
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'leave' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                 <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/30 text-center space-y-6">
                    <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
                       <PieChart className="text-rose-400" size={40} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-[#0f172a] mb-2 uppercase tracking-tight">Leave <span className="text-rose-600">Balance Matrix</span></h3>
                       <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
                          Calculating annual leave accruals, sick leave history, and emergency exit records.
                       </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-6 max-w-xl mx-auto w-full">
                       {[
                         { label: 'Annual', val: '21 Days' },
                         { label: 'Sick', val: '15 Days' },
                         { label: 'Emergency', val: '07 Days' }
                       ].map((l, i) => (
                         <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{l.label}</p>
                            <p className="text-sm font-black text-slate-700">{l.val}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'payroll' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                 <div className="bg-primary p-12 rounded-[4.5rem] shadow-2xl shadow-teal-900/30 text-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                    <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/10 shadow-2xl relative">
                       <Receipt className="text-teal-400" size={40} />
                    </div>
                    <div className="relative">
                       <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Financial <span className="text-teal-400">Vault</span></h3>
                       <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
                          Secure access to salary history, bonus allocations, and financial deductions.
                       </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                       <div className="p-10 bg-white/10 rounded-[3.5rem] border border-white/20 text-left">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="w-8 h-8 bg-white/20 text-white rounded-xl flex items-center justify-center"><Wallet size={16} /></div>
                             <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Active Bank Account</span>
                          </div>
                          <p className="text-lg font-black text-white tracking-tight">**** **** 8829</p>
                          <p className="text-[10px] font-bold text-white/80 mt-1 uppercase">Primary Disbursal</p>
                       </div>
                       <div className="p-10 bg-white/10 rounded-[3.5rem] border border-white/20 text-left">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="w-8 h-8 bg-white/20 text-white rounded-xl flex items-center justify-center"><History size={16} /></div>
                             <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Last Transfer</span>
                          </div>
                          <p className="text-lg font-black text-white tracking-tight">{latestSlip ? `${latestSlip.netSalary} QAR` : '--'}</p>
                          <p className="text-[10px] font-bold text-white/80 mt-1 uppercase">{latestSlip ? `${latestSlip.month}/${latestSlip.year}` : 'No Record'}</p>
                       </div>
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

const DocCard = ({ title, path }: { title: string, path: string }) => {
  const isImage = path?.match(/\.(jpg|jpeg|png|gif)$/i);
  return (
    <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative group overflow-hidden h-[380px] flex flex-col">
       <div className="flex justify-between items-center mb-10 relative">
          <div className="flex items-center gap-4">
             <div className="w-2 h-6 bg-teal-700 rounded-full" />
             <h4 className="text-[11px] font-black text-[#0f172a] uppercase tracking-[0.2em]">{title}</h4>
          </div>
          <div className="flex gap-2">
             <a href={getFileUrl(path)} target="_blank" className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-500 shadow-inner">
                <ExternalLink size={18} />
             </a>
             <a href={getFileUrl(path)} download className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-teal-700 hover:text-white transition-all duration-500 shadow-inner">
                <Download size={18} />
             </a>
          </div>
       </div>
       <div className="flex-1 w-full bg-slate-50 rounded-[2.5rem] flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner group-hover:scale-[1.02] transition-transform duration-700">
          {isImage ? (
            <img src={getFileUrl(path)} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-4">
               <FileText size={64} className="text-slate-200" strokeWidth={1} />
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Document Container</span>
            </div>
          )}
       </div>
    </div>
  );
};

export default withAuth(WorkerProfilePage, [{ module: 'worker', action: 'view' }]);
