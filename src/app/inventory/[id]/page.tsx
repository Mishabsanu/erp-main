'use client';

import { formatDateTime } from '@/app/utils/formatDateTime';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Section } from '@/components/ui/Section';
import { InventoryItem } from '@/lib/types';
import { getInventoryItemById } from '@/services/inventoryApi';
import {
  ArrowLeft,
  Clock,
  Edit2,
  MinusCircle,
  Package,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/* ---------------- TABS ---------------- */
const tabs = [
  { key: 'overview', label: 'Overview', icon: Package },
  { key: 'stock', label: 'Stock' },
  { key: 'history', label: 'History', icon: Clock },
  { key: 'system', label: 'System' },
];
type StockHistoryType =
  | 'ADD_STOCK'
  | 'PRODUCTION'
  | 'INVENTORY_ADJUSTMENT'
  | 'DELIVERY'
  | 'RETURN'
  | 'RETURN_REVERT'
  | 'DELIVERY_ROLLBACK'
  | 'RETURN_DELETE_ROLLBACK'
  | 'DELIVERY_DELETE_ROLLBACK';
const STOCK_FLOW_MAP: Record<
  StockHistoryType,
  { direction: 'IN' | 'OUT'; sign: '+' | '-'; color: string }
> = {
  ADD_STOCK: { direction: 'IN', sign: '+', color: 'emerald' },
  PRODUCTION: { direction: 'IN', sign: '+', color: 'emerald' },
  INVENTORY_ADJUSTMENT: { direction: 'IN', sign: '+', color: 'emerald' },
  DELIVERY: { direction: 'OUT', sign: '-', color: 'rose' },
  RETURN: { direction: 'IN', sign: '+', color: 'emerald' },
  RETURN_REVERT: { direction: 'OUT', sign: '-', color: 'rose' },
  DELIVERY_ROLLBACK: { direction: 'IN', sign: '+', color: 'emerald' },
  RETURN_DELETE_ROLLBACK: { direction: 'OUT', sign: '-', color: 'rose' },
  DELIVERY_DELETE_ROLLBACK: { direction: 'IN', sign: '+', color: 'emerald' },
};

const ViewInventoryPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'stock' | 'history' | 'system'
  >('overview');

  useEffect(() => {
    if (!id) return;

    const fetchInventory = async () => {
      try {
        const res = await getInventoryItemById(id as string);
        setItem(res);
      } catch {
        toast.error('Failed to fetch inventory details');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!item) return null;

  return (
    <div className="min-h-screen w-full bg-[#f5f7fb]">
      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Inventory — {item.itemCode}
              </h1>
              <p className="text-sm text-slate-400 leading-tight">
                PO {item.poNo}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push(`/inventory/edit/${item._id}`)}
            className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#134e4a]
              text-white font-semibold px-6 py-2.5 rounded-xl transition"
          >
            <Edit2 className="w-4 h-4" />
            Edit Inventory
          </button>
        </div>

        {/* ================= TABS ================= */}
        <div className="flex px-8 gap-8 border-t border-slate-200">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`relative flex items-center gap-2 py-4 text-sm font-semibold transition
                ${activeTab === key
                  ? 'text-[#0f766e]'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
              {activeTab === key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0f766e]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-8 py-10 space-y-10">
        {/* ---------- OVERVIEW ---------- */}
        {activeTab === 'overview' && (
          <Section title="Overview">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 border border-slate-200 rounded-[2rem] p-10 bg-white grid grid-cols-1 md:grid-cols-3 gap-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -mr-10 -mt-10 opacity-40" />
                <Detail label="PO Number" value={item.poNo} />
                <Detail label="Product Name" value={item.product?.name} />
                <Detail label="Vendor / Source" value={typeof item.vendor === 'object' ? item.vendor?.company : (item.vendor || 'Internal Production')} />
                <Detail label="Item Code" value={item.product?.itemCode} />
                <Detail label="Unit" value={item.product?.unit} />
                <Detail label="Reference" value={item.reference || 'N/A'} />
                <Detail label="Status" value={item.status} />
                <div className="md:col-span-3 pt-6 border-t border-slate-50">
                  <Detail label="Remarks" value={item.remarks || 'No additional remarks.'} />
                </div>
              </div>

              {/* ATTACHMENTS CARD */}
              <div className="xl:col-span-1 space-y-6">
                {/* PRODUCT IMAGE */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm flex flex-col items-center justify-center text-center group transition-all hover:shadow-md">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 w-full text-left ml-2">
                    Product Reference Image
                  </p>
                  {item.productImage ? (
                    <div className="relative w-full aspect-square rounded-3xl overflow-hidden border border-slate-50 shadow-inner group">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${item.productImage}`}
                        alt="Product"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}${item.productImage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
                      >
                        <span className="bg-white text-slate-800 px-6 py-2 rounded-full text-xs font-bold shadow-xl">
                          Expand Reference
                        </span>
                      </a>
                    </div>
                  ) : (
                    <div className="w-full aspect-square rounded-3xl bg-slate-50 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 italic text-slate-300 text-sm">
                      No Image Uploaded
                    </div>
                  )}
                </div>

                {/* DELIVERY NOTE */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm group transition-all hover:shadow-md">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">
                    Documentation
                  </p>
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-teal-600">
                        <FileText size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 truncate w-32">Delivery Note</span>
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">
                          Verified Link
                        </span>
                      </div>
                    </div>
                    {item.deliveryNote ? (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}${item.deliveryNote}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#0f766e] text-white p-2.5 rounded-xl shadow-lg shadow-teal-900/20 hover:scale-105 transition-transform"
                        title="Open Document"
                      >
                        <PlusCircle size={18} className="rotate-45" />
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase italic">Missing</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Section>
        )}


        {/* ---------- STOCK ---------- */}
        {activeTab === 'stock' && (
          <Section title="Stock Summary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StockCard label="Ordered Quantity" value={item.orderedQty} />
              <StockCard label="Available Quantity" value={item.availableQty} />
            </div>
          </Section>
        )}

        {/* ---------- HISTORY (LEDGER UI) ---------- */}
        {activeTab === 'history' && (
          <Section title="Stock Movement Ledger">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32">Date & Time</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action / Type</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ref / Ticket</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer / Project</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">In (+)</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Out (-)</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      // Calculate running balances
                      // History is usually sorted by newest first in API, but for ledger we want chronological calculation
                      const sortedHistory = [...item.history].sort((a, b) => 
                        new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
                      );

                      let currentRunningBalance = 0;
                      const ledgerRows = sortedHistory.map((h) => {
                        const meta = STOCK_FLOW_MAP[h.type];
                        const isIn = meta?.direction === 'IN';
                        const inQty = isIn ? h.stock : 0;
                        const outQty = !isIn ? h.stock : 0;
                        currentRunningBalance += (inQty - outQty);
                        
                        return { ...h, inQty, outQty, runningBalance: currentRunningBalance, meta };
                      });

                      // Display newest first in the table
                      return ledgerRows.reverse().map((row, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-5">
                            <span className="text-[11px] font-black text-slate-400 block tabular-nums leading-none mb-1">
                              {row.date ? formatDateTime(row.date).split(' ')[0] : '-'}
                            </span>
                            <span className="text-[10px] font-medium text-slate-300">
                              {row.date ? formatDateTime(row.date).split(' ').slice(1).join(' ') : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-black text-slate-700 uppercase tracking-tight">
                                {row.type.replace(/_/g, ' ')}
                              </span>
                              {row.note && (
                                <span className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[150px]" title={row.note}>
                                  {row.note}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-xs font-black text-sky-700 tabular-nums">
                              {row.ticketNo || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-xs font-bold text-slate-600">
                              {row.customer?.name || row.vendor?.name || 'Internal Update'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            {row.inQty > 0 ? (
                              <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-black rounded-lg border border-emerald-100">
                                +{row.inQty}
                              </span>
                            ) : <span className="text-slate-200">—</span>}
                          </td>
                          <td className="px-6 py-5 text-center">
                            {row.outQty > 0 ? (
                              <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 bg-rose-50 text-rose-600 text-[11px] font-black rounded-lg border border-rose-100">
                                -{row.outQty}
                              </span>
                            ) : <span className="text-slate-200">—</span>}
                          </td>
                          <td className="px-6 py-5 text-right">
                             <div className="flex flex-col items-end">
                                <span className="text-sm font-black text-slate-900 tabular-nums leading-none mb-1">
                                  {row.runningBalance.toLocaleString()}
                                </span>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                  Units Stocked
                                </span>
                             </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>
        )}

        {/* ---------- SYSTEM ---------- */}
        {activeTab === 'system' && (
          <Section title="System Information">
            <div className="border border-slate-200 rounded-xl p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-8">
              <Detail
                label="Created At"
                value={formatDateTime(item.createdAt)}
              />
              <Detail
                label="Updated At"
                value={formatDateTime(item.updatedAt)}
              />
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */
const Detail = ({
  label,
  value,
}: {
  label: string;
  value?: string | null | number;
}) => (
  <div>
    <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
      {label}
    </p>
    <p className="text-[15px] font-semibold text-slate-800">{value ?? '-'}</p>
  </div>
);

const StockCard = ({ label, value }: { label: string; value: number }) => (
  <div className="border border-slate-200 rounded-xl p-6 bg-white">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
  </div>
);

export default ViewInventoryPage;
