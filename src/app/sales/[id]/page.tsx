'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Sale } from '@/lib/types';
import { getSaleById } from '@/services/salesApi';
import { getFileUrl } from '@/app/utils/fileUtils';
import {
    ArrowLeft,
    Briefcase,
    Calendar,
    ChevronRight,
    Clock,
    ExternalLink,
    FileText,
    Mail,
    MapPin,
    MessageSquare,
    Paperclip,
    Phone,
    ShieldCheck,
    Tag,
    User,
    UserCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'New Lead': '#2563eb',
    Contacted: '#3b82f6',
    'Follow-Up': '#1d4ed8',
    'Quotation Sent': '#f59e0b',
    Negotiation: '#d97706',
    Interested: '#16a34a',
    'Not Interested': '#ef4444',
    'On Hold': '#7c3aed',
    'PO Received': '#10b981',
    'Payment Pending': '#eab308',
    Processing: '#0284c7',
    Shipped: '#14b8a6',
    Delivered: '#15803d',
  };
  return colors[status] || '#6b7280';
};

interface SalesViewPageProps {
    params: Promise<{ id: string }>;
}

const SalesViewPage = ({ params: paramsPromise }: SalesViewPageProps) => {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSaleDetails = async () => {
      if (!id) return;
      try {
        const fetchedSale = await getSaleById(id as string);
        setSale(fetchedSale);
      } catch (err) {
        toast.error('Failed to load enquiry details.');
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center"><LoadingSpinner /></div>;
  if (!sale) return (
    <div className="min-h-screen bg-[#f9fafc] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-[#0f766e] mb-4">Enquiry not found</h2>
        <button onClick={() => router.back()} className="text-[#0f766e] font-bold flex items-center gap-2 hover:underline">
            <ArrowLeft size={18} /> Go Back
        </button>
    </div>
  );

  return (
    <div className="p-6 md:p-10 bg-[#f9fafc] min-h-screen font-sans">
      
      {/* Header with Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <button onClick={() => router.push('/sales')} className="hover:text-[#0f766e] transition-colors">Enquiries</button>
                <ChevronRight size={12} />
                <span className="text-gray-600">{sale.ticketNo}</span>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#0f766e] hover:border-gray-200 transition-all shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-black text-[#0f766e] tracking-tight">
                    Enquiry <span className="text-[#0f766e]">#{sale.ticketNo}</span>
                </h1>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <span
                className="px-6 py-2.5 rounded-xl text-white text-[12px] font-black uppercase tracking-widest shadow-lg"
                style={{ backgroundColor: getStatusColor(sale.status || '') }}
            >
                {sale.status || 'N/A'}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-10">
            
            <DetailSection title="Client Overview" icon={UserCircle}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <InfoItem label="Client Name" value={sale.name} icon={User} />
                    <InfoItem label="Company" value={sale.companyName} icon={Briefcase} />
                    <InfoItem label="Email Address" value={sale.email} icon={Mail} />
                    <InfoItem label="Mobile Number" value={sale.contactPersonMobile} icon={Phone} />
                    <InfoItem label="Position" value={sale.position} icon={Tag} />
                    <InfoItem label="Location" value={sale.location} icon={MapPin} />
                    <InfoItem label="Business Type" value={sale.businessType || 'N/A'} icon={Briefcase} />
                </div>
            </DetailSection>

            <DetailSection title="Enquiry Logistics" icon={FileText}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <InfoItem label="Reference No" value={sale.referenceNo} icon={Tag} />
                    <InfoItem label="Contact Method" value={sale.contactThrough} icon={MessageSquare} />
                    <InfoItem label="Enquiry Date" value={sale.date} icon={Calendar} />
                    <InfoItem label="Next Follow-Up" value={sale.followUpDate || 'Not Scheduled'} icon={Clock} highlight={!!sale.followUpDate} />
                    {user?.role === 'admin' && <InfoItem label="Handled By" value={sale.user?.name || 'Unassigned'} icon={User} />}
                </div>
                <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Remarks & Critical Notes</label>
                    <p className="text-gray-700 text-sm font-medium leading-relaxed italic">
                        "{sale.remarks || 'No detailed remarks provided for this enquiry.'}"
                    </p>
                </div>
            </DetailSection>

            {/* Engagement History Table */}
            <DetailSection title="Engagement History" icon={Clock}>
                <div className="overflow-x-auto -mx-8 px-8">
                    {sale.followUpHistory && sale.followUpHistory.length > 0 ? (
                        <table className="akod-table text-left min-w-[600px]">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry</th>
                                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Discussion & Remarks</th>
                                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Logged</th>
                                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Updated By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[...sale.followUpHistory].reverse().map((entry: any, index: number) => (
                                    <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-5 pr-4">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-[#0f766e]">
                                                {sale.followUpHistory!.length - index}
                                            </div>
                                        </td>
                                        <td className="py-5 pr-4">
                                            <span
                                                className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap"
                                                style={{ backgroundColor: getStatusColor(entry.status) }}
                                            >
                                                {entry.status}
                                            </span>
                                        </td>
                                        <td className="py-5 pr-4">
                                            <p className="text-[13px] text-gray-700 font-medium leading-relaxed max-w-sm">
                                                {entry.remarks}
                                            </p>
                                        </td>
                                        <td className="py-5 pr-4">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-[#0f766e]">
                                                    {entry.updatedAt || entry.date ? new Date(entry.updatedAt || entry.date).toLocaleDateString() : 'N/A'}
                                                </span>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase whitespace-nowrap tracking-tighter">Next Review:</span>
                                                    <span className="text-[9px] text-teal-600 font-black uppercase">{entry.followUpDate || 'None'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 text-right">
                                            <div className="flex items-center justify-end gap-3 text-right">
                                                <div className="flex flex-col">
                                                  <span className="text-[13px] font-bold text-[#0f766e]">{entry.updatedBy?.name}</span>
                                                  <span className="text-[10px] text-gray-400 font-bold uppercase">{entry.updatedAt ? new Date(entry.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black text-[#0f766e] shadow-sm">
                                                    {entry.updatedBy?.name?.charAt(0) || 'U'}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-12 text-center">
                            <Clock size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Interaction History Recorded</p>
                        </div>
                    )}
                </div>
            </DetailSection>

            {/* Attachments */}
            {sale.attachments && sale.attachments.length > 0 && (
                <DetailSection title="Related Documents" icon={Paperclip}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sale.attachments.map((url: string, index: number) => {
                            if (!url) return null;
                            const fileName = url.split('/').pop() || 'Document';
                            return (
                                <a
                                    key={index}
                                    href={getFileUrl(url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-[#0f766e] hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#0f766e]/10 group-hover:text-[#0f766e] transition-all">
                                            <FileText size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{fileName}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">View Attachment</p>
                                        </div>
                                    </div>
                                    <ExternalLink size={16} className="text-gray-300 group-hover:text-[#0f766e]" />
                                </a>
                            );
                        })}
                    </div>
                </DetailSection>
            )}
        </div>

        {/* Sidebar: Record Logistics */}
        <div className="space-y-10">
            {/* Audit Card */}
            <div className="bg-gradient-to-br from-[#0f766e] to-[#134e4a] rounded-xl p-8 text-white shadow-xl">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 opacity-60">Record Logistics</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-xs font-medium opacity-50">System Entry</span>
                        <span className="text-xs font-mono font-bold tracking-tighter">{sale._id?.toString().slice(-12)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-xs font-medium opacity-50">Lead Created</span>
                        <span className="text-xs font-bold">{sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-xs font-medium opacity-50">Latest Activity</span>
                        <span className="text-xs font-bold">{sale.updatedAt ? new Date(sale.updatedAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
                 <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200 mx-auto">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Compliance Verified</p>
                        <p className="text-sm font-bold text-[#0f766e] mt-1">Lead is active and tracked</p>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

/* ---- Sub-components ---- */

const DetailSection: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-[#fafafa]/30">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-[#0f766e]">
                <Icon size={20} />
            </div>
            <h2 className="text-xl font-black text-[#0f766e] tracking-tight">{title}</h2>
        </div>
        <div className="p-8">
            {children}
        </div>
    </div>
);

const InfoItem: React.FC<{ label: string; value: string; icon: any; highlight?: boolean }> = ({ label, value, icon: Icon, highlight }) => (
    <div className="space-y-1.5 group">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] flex items-center gap-2">
            <Icon size={12} className={highlight ? 'text-[#0f766e]' : 'text-gray-300 group-hover:text-[#0f766e] transition-colors'} />
            {label}
        </label>
        <p className={`text-base font-bold tracking-tight ${highlight ? 'text-[#0f766e]' : 'text-[#0f766e]'}`}>
            {value || '--'}
        </p>
    </div>
);

export default withAuth(SalesViewPage, [{ module: 'sales', action: 'view' }]);
