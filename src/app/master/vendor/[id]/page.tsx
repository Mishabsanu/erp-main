'use client';

import { formatDateTime } from '@/app/utils/formatDateTime';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Section } from '@/components/ui/Section';
import { Vendor } from '@/lib/types';
import { getVendorById } from '@/services/vendorApi';
import {
  ArrowLeft,
  Edit2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatDate } from '@/app/utils/formatDate';
import { getInventoryItems } from '@/services/inventoryApi';
import { History as HistoryIcon, Package, Clock, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const ViewVendorPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  /* ---------------- FETCH VENDOR ---------------- */
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [vendorData, invData] = await Promise.all([
           getVendorById(id as string),
           getInventoryItems({ vendor: id as string }, 1, 100)
        ]);
        setVendor(vendorData);
        setHistory(invData.inventoryItems);
      } catch (err) {
        toast.error('Failed to fetch vendor data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!vendor) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-semibold text-gray-800">Vendor Details</h1>
        </div>
        <button
          onClick={() =>
            router.push(`/master/vendor/edit/${id}`)
          }
          className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#134e4a]
            text-white font-semibold py-2.5 px-5 rounded-lg shadow transition"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex items-center gap-8 border-b border-gray-100 mb-10">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
            activeTab === 'overview' ? 'text-teal-700' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Overview
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-full animate-in fade-in zoom-in duration-300" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
            activeTab === 'history' ? 'text-teal-700' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Transaction History
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-full animate-in fade-in zoom-in duration-300" />
          )}
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      {activeTab === 'overview' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Detail label="Vendor Name" value={vendor.name} />
              <Detail label="Company" value={vendor.company} />
              <Detail label="Email" value={vendor.email} />
              <Detail label="Mobile" value={vendor.mobile} />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</p>
                <span
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full ${
                    vendor.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}
                >
                  {vendor.status}
                </span>
              </div>
            </div>
          </Section>

          <Section title="Address & Contact" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Detail label="Address" value={vendor.address} />
              <Detail label="City" value={vendor.city} />
              <Detail label="Province" value={vendor.district} />
              <Detail label="Contact Person" value={vendor.contactPersonName} />
              <Detail label="Contact Person Mobile" value={vendor.contactPersonMobile} />
            </div>
          </Section>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-gray-50/50">
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product / Item Code</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Qty</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Reference</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {history.length > 0 ? (
                          history.map((item, idx) => (
                             <tr key={idx} className="hover:bg-gray-50/30 transition-colors group">
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-3">
                                      <div className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                         <Clock size={14} />
                                      </div>
                                      <span className="text-xs font-bold text-gray-700">{formatDate(item.createdAt)}</span>
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <div className="flex flex-col">
                                      <span className="text-xs font-black text-gray-800 uppercase tracking-tight">{item.product?.name}</span>
                                      <span className="text-[10px] font-bold text-gray-400">{item.itemCode}</span>
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <span className="text-[10px] font-black px-3 py-1 bg-teal-50 text-teal-700 rounded-full uppercase tracking-widest border border-teal-100">
                                      STOCK IN
                                   </span>
                                </td>
                                <td className="px-8 py-6">
                                   <span className="text-sm font-black text-emerald-600">+{item.orderedQty}</span>
                                </td>
                                <td className="px-8 py-6">
                                   <span className="text-xs font-bold text-gray-500">{item.poNo || item.reference || '--'}</span>
                                </td>
                             </tr>
                          ))
                       ) : (
                          <tr>
                             <td colSpan={5} className="px-8 py-20 text-center">
                                <div className="flex flex-col items-center gap-4">
                                   <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-[2rem] flex items-center justify-center">
                                      <Package size={32} />
                                   </div>
                                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">No Transaction History Recorded</p>
                                </div>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- DETAIL COMPONENT ---------------- */
const Detail = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div>
    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
      {label}
    </p>
    <p className="text-base font-medium text-gray-800">
      {value || '-'}
    </p>
  </div>
);

export default ViewVendorPage;
