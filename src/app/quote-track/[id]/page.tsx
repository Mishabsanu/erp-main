'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QuoteTrack } from '@/lib/types';
import { getQuoteTrackById } from '@/services/quoteApi';
import { ArrowLeft, FileText, CheckCircle, Circle, X } from 'lucide-react';
import withAuth from '@/components/withAuth';
import { toast } from 'sonner';

/** Status flow (Rejected handled separately) */
const STATUS_FLOW = ['Pending', 'Quoted', 'Accepted'];

interface QuoteTrackViewPageProps {
  params: Promise<{ id: string }>;
}

const QuoteTrackViewPage = ({ params: paramsPromise }: QuoteTrackViewPageProps) => {
  const [quoteTrack, setQuoteTrack] = useState<QuoteTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const router = useRouter();
  const params = use(paramsPromise);
  const { id } = params;

  const convert = (value: number) => {
    if (currency === 'INR') return value;
    return value / (quoteTrack?.exchangeRate || 83);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getQuoteTrackById(id as string);
        setQuoteTrack(result ?? null);
      } catch (err) {
        toast.error('Failed to load quote details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><LoadingSpinner /></div>;
  if (!quoteTrack) return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quote not found</h2>
        <button onClick={() => router.back()} className="text-teal-700 font-bold flex items-center gap-2 hover:underline">
            <ArrowLeft size={18} /> Go Back
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="w-full">

        {/* Back Button */}
        <button
          onClick={() => router.push('/quote-track')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Main Card FULL WIDTH */}
        <div className="bg-white shadow-md rounded-xl p-6 md:p-8 w-full border border-gray-200">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="flex items-center gap-4">
              <div className="bg-teal-50 p-3 rounded-full border border-teal-100">
                <FileText className="w-8 h-8 text-teal-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {quoteTrack.clientName}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-3 py-0.5 text-xs font-bold rounded-full ${
                      quoteTrack.status === 'Rejected'
                        ? 'bg-teal-100 text-teal-800 border border-teal-200'
                        : 'bg-sky-100 text-sky-700 border border-sky-200'
                    }`}
                  >
                    {quoteTrack.status}
                  </span>
                  <span className="text-xs text-gray-400 font-medium tracking-tight">Ref: {quoteTrack._id}</span>
                </div>
              </div>
            </div>

            {/* Currency Switch */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button 
                  onClick={() => setCurrency('INR')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${currency === 'INR' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  INR (₹)
                </button>
                <button 
                  onClick={() => setCurrency('USD')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${currency === 'USD' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  USD ($)
                </button>
            </div>
          </div>

          {/* STATUS TRACKER */}
          <div className="mt-10 bg-gray-50 rounded-xl p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Quote Pipeline</h2>

            {/* Reject only view */}
            {quoteTrack.status === 'Rejected' ? (
              <div className="w-full bg-teal-50 text-teal-800 border border-teal-200 p-6 rounded-lg text-center font-bold text-lg flex items-center justify-center gap-3">
                <X size={24} className="text-teal-700" /> Quote Rejected
              </div>
            ) : (
              <div className="relative flex justify-between w-full mt-6 px-10">
                {/* progress line */}
                <div className="absolute top-[18px] left-10 right-10 h-1 bg-gray-200 z-0"></div>

                {STATUS_FLOW.map((status, idx) => {
                  const currentIndex = STATUS_FLOW.indexOf(quoteTrack.status);
                  const isDone = idx <= currentIndex;

                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center w-1/3">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full border-4 shadow-sm transition-all duration-300 ${
                        isDone ? 'bg-green-600 border-green-200 text-white' : 'bg-white border-gray-100 text-gray-300'
                      }`}>
                        {isDone ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-4 h-4 fill-current" />}
                      </div>
                      <p
                        className={`mt-4 text-xs font-bold uppercase tracking-widest ${
                          isDone ? 'text-green-700' : 'text-gray-400'
                        }`}
                      >
                        {status}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary Info Boxes */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <InfoWide label="Exchange Rate" value={`1$ = ${quoteTrack.exchangeRate} INR`} />
            <InfoWide money currency={currency} label="Shipping Cost" value={convert(quoteTrack.totalShippingCost ?? 0)} />
            <InfoWide money currency={currency} label="Gross Margin" value={convert(quoteTrack.totalGrossMargin ?? 0)} isMargin />
            <InfoWide money currency={currency} label="Selling Price" value={convert(quoteTrack.totalSellingPrice ?? 0)} highlight />
          </div>

          {/* Items Table FULL WIDTH */}
          <div className="mt-10 w-full overflow-hidden border border-gray-200 rounded-xl">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">Line Items ({quoteTrack.items?.length || 0})</h2>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="akod-table text-left">
                <thead>
                  <tr>
                    <th className="px-6 py-4">Product Detail</th>
                    <th className="px-4 py-4 text-center">Qty</th>
                    <th className="px-4 py-4 text-right">Unit Price</th>
                    <th className="px-4 py-4 text-right">Subtotal</th>
                    <th className="px-6 py-4 text-right">Margin</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {quoteTrack.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800">{item.name}</td>
                      <td className="px-4 py-4 text-center font-bold text-gray-700">{item.qty}</td>

                      <td className="px-4 py-4 text-right font-semibold text-gray-600">
                        {currency === 'INR' ? '₹' : '$'} {convert(item.sellingPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-gray-900">
                        {currency === 'INR' ? '₹' : '$'} {convert(item.totalSellingPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-emerald-600 font-bold">{currency === 'INR' ? '₹' : '$'} {convert(item.grossMargin ?? 0).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {quoteTrack.remarks && (
            <div className="mt-8 p-6 bg-sky-50 border border-sky-100 rounded-xl">
                 <h4 className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2">Remarks</h4>
                 <p className="text-sm font-medium text-slate-900 leading-relaxed italic">"{quoteTrack.remarks}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* Reusable Summary Box */
const InfoWide = ({ label, value, money, currency, highlight, isMargin }: any) => (
  <div className={`p-6 rounded-xl border shadow-sm transition-all ${
      highlight ? 'bg-[#0f766e] text-white border-[#0f766e]' : 
      isMargin ? 'bg-emerald-50 text-emerald-900 border-emerald-100' :
      'bg-white text-gray-800 border-gray-100'
  }`}>
    <p className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${highlight ? 'text-sky-200' : isMargin ? 'text-emerald-400' : 'text-gray-400'}`}>{label}</p>
    <p className={`text-2xl font-black ${highlight ? 'text-white' : 'text-gray-800'}`}>
      {money ? `${currency === 'INR' ? '₹' : '$'} ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : value}
    </p>
  </div>
);

export default withAuth(QuoteTrackViewPage, [{ module: 'quote_track', action: 'view' }]);
