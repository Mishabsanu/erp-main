'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getExpenses, getPayments, getInvoices } from '@/services/financeApi';
import { Expense, Payment, Invoice } from '@/lib/types';
import { History, ArrowUpRight, ArrowDownLeft, FileText, AlertCircle, Clock } from 'lucide-react';
import { formatDate } from '@/app/utils/formatDate';

interface CompanyFinanceHistoryProps {
  companyName: string;
  type: 'Customer' | 'Vendor';
  companyId?: string;
}

type TimelineItem = {
  id: string;
  date: string;
  type: 'Expense' | 'Payment' | 'Invoice';
  title: string;
  amount: number;
  status: string;
  logic: 'Dr' | 'Cr';
  referenceNo?: string;
};

export const CompanyFinanceHistory: React.FC<CompanyFinanceHistoryProps> = ({ companyName, type, companyId }) => {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!companyName && !companyId) return;
      setLoading(true);
      try {
        const promises: Promise<any>[] = [];

        // 1. Fetch Payments (for both)
        promises.push(getPayments({ companyName }, 1, 100));

        if (type === 'Vendor') {
          // 2. Fetch Expenses
          promises.push(getExpenses({ companyName }, 1, 100));
        } else {
          // 3. Fetch Invoices
          if (companyId) {
            promises.push(getInvoices({ status: '' }, 1, 100).then(res => ({
               invoices: res.invoices.filter(inv => {
                 const cid = typeof inv.customerId === 'object' ? inv.customerId._id : inv.customerId;
                 return cid === companyId;
               })
            })));
          }
        }

        const results = await Promise.all(promises);
        const [paymentData, billData] = results;

        const timeline: TimelineItem[] = [];

        // Add Payments
        if (paymentData?.payments) {
          paymentData.payments.forEach((p: Payment) => {
            if (!p) return;
            timeline.push({
              id: p._id!,
              date: p.date,
              type: 'Payment',
              title: `Payment: ${p.modeOfPayment} (${p.type})`,
              amount: p.amount,
              status: p.status,
              logic: p.type === 'Received' ? 'Cr' : 'Dr',
              referenceNo: p.paymentId
            });
          });
        }

        // Add Expenses or Invoices
        if (type === 'Vendor' && billData?.expenses) {
          billData.expenses.forEach((e: Expense) => {
            if (!e) return;
            timeline.push({
              id: e._id!,
              date: e.date,
              type: 'Expense',
              title: `Expense: ${e.category}`,
              amount: e.totalAmount,
              status: e.status,
              logic: 'Dr',
              referenceNo: e.expenseId
            });
          });
        } else if (type === 'Customer' && billData?.invoices) {
          billData.invoices.forEach((inv: Invoice) => {
            if (!inv) return;
            timeline.push({
              id: inv._id!,
              date: inv.date,
              type: 'Invoice',
              title: `Invoice: ${inv.invoiceNo}`,
              amount: inv.totalAmount,
              status: inv.status,
              logic: 'Cr',
              referenceNo: inv.invoiceNo
            });
          });
        }

        // Sort by date descending
        timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setItems(timeline);
      } catch (error) {
        console.error('Failed to fetch finance history', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyName, companyId, type]);

  const totals = useMemo(() => {
    return items.reduce((acc, item) => {
      if (item.logic === 'Cr') acc.credit += item.amount;
      else acc.debit += item.amount;
      return acc;
    }, { credit: 0, debit: 0 });
  }, [items]);

  const balance = totals.credit - totals.debit;

  if (!companyName && !companyId) return null;

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <History size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Transaction Timeline</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Audit History for {companyName}</p>
          </div>
        </div>
        
        <div className="flex gap-4">
           <div className="text-right">
              <span className="text-[9px] font-black text-gray-400 uppercase block tracking-tighter">Net Standing</span>
              <span className={`text-sm font-black ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                QAR {Math.abs(balance).toLocaleString()} {balance >= 0 ? '(Cr)' : '(Dr)'}
              </span>
           </div>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auditing Ledger...</span>
           </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-100 text-gray-400">
             <AlertCircle size={24} className="mb-2 opacity-20" />
             <span className="text-[10px] font-black uppercase tracking-widest">No transaction history recorded</span>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="group relative flex items-start gap-4 p-4 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all">
               <div className={`p-2 rounded-xl border ${
                  item.type === 'Payment' 
                    ? (item.logic === 'Cr' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100')
                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
               }`}>
                  {item.type === 'Payment' ? (item.logic === 'Cr' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />) : <FileText size={16} />}
               </div>

               <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                     <span className="text-xs font-black text-gray-900 group-hover:text-indigo-700 transition-colors">{item.title}</span>
                     <span className={`text-xs font-black ${item.logic === 'Cr' ? 'text-emerald-600' : 'text-rose-600'}`}>
                       {item.logic === 'Cr' ? '+' : '-'} QAR {item.amount.toLocaleString()}
                     </span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                        <Clock size={10} />
                        {formatDate(item.date)}
                     </div>
                     <span className="w-1 h-1 bg-gray-200 rounded-full" />
                     <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{item.referenceNo}</span>
                     <span className="w-1 h-1 bg-gray-200 rounded-full" />
                     <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                       item.status.toLowerCase() === 'paid' || item.status.toLowerCase() === 'sent' || item.status.toLowerCase() === 'completed'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                     }`}>
                        {item.status}
                     </span>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
