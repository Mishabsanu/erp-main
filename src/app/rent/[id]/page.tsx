'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRentalDetails, RentalDetails } from '@/services/rentalApi';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { Section } from '@/components/ui/Section';
import { ChevronLeft, Package, Truck, RotateCcw, Calendar, MapPin, Building2, User } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import withAuth from '@/components/withAuth';

const RentalDetailsPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const [details, setDetails] = useState<RentalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getRentalDetails(id as string);
        setDetails(data);
      } catch (error) {
        console.error('Failed to fetch rental details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="p-10"><TableSkeleton /></div>;
  if (!details) return <div className="p-10">Rental details not found.</div>;

  return (
    <div className="min-h-screen w-full bg-gray-50 p-6 md:p-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-teal-700 transition mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Tracking
      </button>

      <ListPageHeader
        eyebrow="Rental Lifecycle"
        title={`Order ${details.order.orderNumber}`}
        highlight="Detailed Audit"
        description="Complete tracking of items from initial order to final return."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-8">
          <Section title="Inventory Reconciliation" eyebrow="Status">
            <div className="overflow-x-auto">
              <table className="akod-table whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">Item Details</th>
                    <th className="text-center p-3 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">Ordered</th>
                    <th className="text-center p-3 border-b text-xs font-bold text-gray-500 uppercase tracking-wider text-blue-600">Dispatched</th>
                    <th className="text-center p-3 border-b text-xs font-bold text-gray-500 uppercase tracking-wider text-amber-600">Returned</th>
                    <th className="text-center p-3 border-b text-xs font-bold text-gray-700 uppercase tracking-wider bg-teal-50">At Site (Bal)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {details.itemStats.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">CODE: {item.itemCode}</p>
                      </td>
                      <td className="p-4 text-center font-medium text-gray-600">{item.orderedQty}</td>
                      <td className="p-4 text-center font-bold text-blue-600">{item.deliveredQty}</td>
                      <td className="p-4 text-center font-bold text-amber-600">{item.returnedQty}</td>
                      <td className="p-4 text-center bg-teal-50/30">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg font-black text-lg ${
                          item.siteBalance > 0 ? 'text-teal-700' : 'text-gray-300'
                        }`}>
                          {item.siteBalance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Section title="Dispatches" eyebrow="History">
              <div className="space-y-4">
                {details.history.deliveries.length > 0 ? details.history.deliveries.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{d.ticketNo}</p>
                        <p className="text-xs text-gray-400">{new Date(d.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push(`/delivery-ticket/${d._id}`)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      View Note
                    </button>
                  </div>
                )) : <p className="text-sm text-gray-400 italic p-4 bg-gray-50 rounded-xl border border-dashed text-center">No deliveries recorded yet.</p>}
              </div>
            </Section>

            <Section title="Returns" eyebrow="History">
              <div className="space-y-4">
                {details.history.returns.length > 0 ? details.history.returns.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{r.ticketNo}</p>
                        <p className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push(`/return-ticket/${r._id}`)}
                      className="text-xs font-bold text-amber-600 hover:underline"
                    >
                      View Note
                    </button>
                  </div>
                )) : <p className="text-sm text-gray-400 italic p-4 bg-gray-50 rounded-xl border border-dashed text-center">No returns recorded yet.</p>}
              </div>
            </Section>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h4 className="text-sm font-bold text-gray-900 border-b pb-4">Rental Context</h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Client</p>
                  <p className="text-sm font-medium text-gray-700">{details.order.companyName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Project Location</p>
                  <p className="text-sm font-medium text-gray-700">{details.order.projectLocation}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Invoice / PO</p>
                  <p className="text-sm font-medium text-gray-700">{details.order.invoiceNumber} / {details.order.poNumber || '—'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
               <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                  <p className="text-xs font-bold text-teal-800 mb-1">Audit Status</p>
                  <p className="text-[10px] text-teal-600 leading-relaxed">
                    This order is being tracked under the <strong>Hire</strong> service type. All quantities are reconciled across delivery and return logs.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(RentalDetailsPage, [{ module: 'rental_tracking', action: 'view' }]);
