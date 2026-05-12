'use client';

import { formatDateTime } from '@/app/utils/formatDateTime';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Section } from '@/components/ui/Section';
import { Product } from '@/lib/types';
import { getProductById, getProductHistory } from '@/services/catalogApi';
import { Edit2, ArrowLeft, History, Package, Factory, ShoppingCart, Info } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const ViewProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'production' | 'orders'>('inventory');

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [fetchedProduct, fetchedHistory] = await Promise.all([
            getProductById(id),
            getProductHistory(id)
          ]);
          setProduct(fetchedProduct);
          setHistory(fetchedHistory);
        } catch (error) {
          toast.error('Failed to fetch product data.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  const handleEdit = () => {
    router.push(`/master/catalog/edit/${id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Product not found.
      </div>
    );
  }

  const inventoryHistory = history?.inventory || [];
  const productionHistory = history?.production || [];
  const orderHistory = history?.orders || [];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 transition p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
            <p className="text-teal-700 font-bold uppercase tracking-wider text-sm mt-1">
              {product.itemCode}
            </p>
          </div>
        </div>
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#134e4a] text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
        >
          <Edit2 className="w-4 h-4" /> Edit Product
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="lg:col-span-1 space-y-6">
          <Section eyebrow="Quick Overview" title="Product" highlight="Specs" className="h-full">
            <div className="space-y-4">
              <Detail label="Unit" value={product.unit} />
              <Detail label="Reorder Level" value={product.reorderLevel?.toString()} />
              <Detail label="Description" value={product.description} />
              <div className="pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Current Status</span>
                <span
                  className={`inline-flex px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full shadow-sm ${
                    product.status === 'active'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {product.status}
                </span>
              </div>
            </div>
          </Section>

          <Section title="System Information" className="opacity-80">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">Created At</span>
                <span className="text-gray-600 font-bold">{formatDateTime(product.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">Updated At</span>
                <span className="text-gray-600 font-bold">{formatDateTime(product.updatedAt)}</span>
              </div>
            </div>
          </Section>
        </div>

        {/* Right Column: History Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-100 bg-gray-50/50 p-2 gap-2">
              <TabButton 
                active={activeTab === 'inventory'} 
                onClick={() => setActiveTab('inventory')}
                icon={<Package className="w-4 h-4" />}
                label="Stock History"
                count={inventoryHistory.length}
              />
              <TabButton 
                active={activeTab === 'production'} 
                onClick={() => setActiveTab('production')}
                icon={<Factory className="w-4 h-4" />}
                label="Production"
                count={productionHistory.length}
              />
              <TabButton 
                active={activeTab === 'orders'} 
                onClick={() => setActiveTab('orders')}
                icon={<ShoppingCart className="w-4 h-4" />}
                label="Orders / Sales"
                count={orderHistory.length}
              />
            </div>

            {/* Tab Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  {inventoryHistory.length === 0 ? (
                    <EmptyState message="No stock movements recorded yet." />
                  ) : (
                    inventoryHistory.map((item: any, idx: number) => (
                      <HistoryCard 
                        key={idx}
                        title={item.type.replace(/_/g, ' ')}
                        subtitle={`PO: ${item.poNo}`}
                        date={item.date}
                        value={`${item.stock > 0 ? '+' : ''}${item.stock}`}
                        note={item.note}
                        type={item.type.includes('ADD') ? 'positive' : 'negative'}
                        extra={`Batch Stock: ${item.currentBatchStock}`}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'production' && (
                <div className="space-y-4">
                  {productionHistory.length === 0 ? (
                    <EmptyState message="No production records found." />
                  ) : (
                    productionHistory.map((item: any, idx: number) => (
                      <HistoryCard 
                        key={idx}
                        title={`Production Batch ${item.batchNumber}`}
                        subtitle={`Shift: ${item.shift}`}
                        date={item.manufacturingDate}
                        value={`${item.quantity}`}
                        note={item.remarks}
                        type="neutral"
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {orderHistory.length === 0 ? (
                    <EmptyState message="No sales or orders for this product." />
                  ) : (
                    orderHistory.map((order: any, idx: number) => (
                      <HistoryCard 
                        key={idx}
                        title={`Invoice ${order.invoice_number}`}
                        subtitle={order.client_name || order.company_name}
                        date={order.ordered_date}
                        value={`${order.items[0]?.quantity || 0}`}
                        note={order.status}
                        type="negative"
                        extra={`Status: ${order.status}`}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= Internal Components ================= */

const TabButton = ({ active, onClick, icon, label, count }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
      active 
        ? 'bg-teal-700 text-white shadow-lg shadow-teal-700/20 transform scale-105' 
        : 'text-gray-500 hover:bg-white hover:text-gray-700'
    }`}
  >
    {icon}
    <span>{label}</span>
    <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20' : 'bg-gray-200'}`}>
      {count}
    </span>
  </button>
);

const HistoryCard = ({ title, subtitle, date, value, note, type, extra }: any) => (
  <div className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-teal-200 hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="text-sm font-bold text-gray-900 group-hover:text-teal-900 transition-colors capitalize">
          {title}
        </h4>
        <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>
      </div>
      <div className="text-right">
        <span className={`text-lg font-black ${
          type === 'positive' ? 'text-green-600' : 
          type === 'negative' ? 'text-amber-600' : 'text-teal-700'
        }`}>
          {value}
        </span>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
          {formatDateTime(date)}
        </p>
      </div>
    </div>
    {note && (
      <div className="bg-gray-50/80 rounded-lg p-2.5 mt-3 flex gap-2 items-start border border-gray-100/50">
        <Info className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-600 leading-relaxed font-medium italic">"{note}"</p>
      </div>
    )}
    {extra && (
      <div className="mt-3 flex justify-end">
        <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
          {extra}
        </span>
      </div>
    )}
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
    <History className="w-12 h-12 mb-4 text-gray-300" />
    <p className="text-sm font-medium text-gray-500">{message}</p>
  </div>
);

const Detail = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-bold text-gray-800 leading-snug">{value || '-'}</span>
  </div>
);

export default ViewProductPage;
