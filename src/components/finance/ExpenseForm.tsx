'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import FormikSearchableSelect from '@/components/shared/FormikSearchableSelect';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { Section } from '@/components/ui/Section';
import { Expense, Vendor } from '@/lib/types';
import { createPayment, getNextExpenseId, getPayments, getAccounts } from '@/services/financeApi';
import { getVendorDropdown } from '@/services/vendorApi';
import { getWorkersDropdown } from '@/services/workerApi';
import { CompanyFinanceHistory } from './CompanyFinanceHistory';
import { Account, Worker } from '@/lib/types';
import { FormikProvider, useFormik } from 'formik';
import { 
  DollarSign, Edit3, Paperclip, PlusCircle, Building2, 
  Wallet, CreditCard, Landmark, History, Activity, 
  AlertCircle, UserCheck, Eye, Trash2 
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  date: Yup.string().required('Date is required'),
  category: Yup.string().required('Category is required'),
  amount: Yup.number().required('Amount is required').min(0.01, 'Amount must be greater than zero'),
  modeOfPayment: Yup.string().required('Mode of Payment is required'),
  status: Yup.string().required('Status is required'),
  vendorId: Yup.string().required('Vendor selection is required'),
  chequeNo: Yup.string().when('modeOfPayment', {
    is: 'Cheque',
    then: (schema) => schema.required('Cheque number is required'),
    otherwise: (schema) => schema.optional()
  }),
  transactionId: Yup.string().when('modeOfPayment', {
    is: 'Bank Transfer',
    then: (schema) => schema.required('Transaction ID is required'),
    otherwise: (schema) => schema.optional()
  }),
  voucherNo: Yup.string().when('modeOfPayment', {
    is: 'Cash',
    then: (schema) => schema.required('Voucher number is required'),
    otherwise: (schema) => schema.optional()
  })
});

const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Credit Card', 'Other'];

const EXPENSE_CATEGORIES = [
  'Products',
  'Utilities',
  'Rent',
  'Salary',
  'Office Supplies',
  'Marketing',
  'Maintenance',
  'Travel',
  'Communication',
  'Professional Fees',
  'Taxes & Licenses',
  'Insurance',
  'Production',
  'Miscellaneous'
];

interface ExpenseFormProps {
  initialData?: Partial<Expense>;
  onSubmit: (values: any) => Promise<any>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({
    bill: null,
    receipt: null,
    proof: null
  });
  const [nextId, setNextId] = useState<string>('');
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loadingSettlements, setLoadingSettlements] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [pendingRemovals, setPendingRemovals] = useState<string[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>(initialData?.attachments || []);

  const isEditMode = !!initialData?._id;

  const formik = useFormik<any>({
    initialValues: (initialData || {
      date: new Date().toISOString().split('T')[0],
      category: '',
      amount: 0,
      modeOfPayment: 'Bank Transfer',
      referenceNo: '',
      description: '',
      companyName: '',
      vendorId: '',
      status: 'pending', // Default to pending for new expenses
      recordInitialPayment: false, // New toggle
      amountPaid: 0, // Amount paid now
      chequeNo: '',
      chequeDate: '',
      bank: '',
      transactionId: '',
      voucherNo: '',
      paidBy: '',
      recipientDetailId: '',
      contactPerson: '',
    }),
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const formData = new FormData();
      
      // Append all base form fields except those we handle explicitly
      Object.keys(values).forEach(key => {
        if (
          !['recordInitialPayment', 'amountPaid', 'amount', 'totalAmount'].includes(key) && 
          values[key] !== undefined && 
          values[key] !== null
        ) {
           formData.append(key, values[key]);
        }
      });

      // Ensure amount and totalAmount are explicitly set as single values
      formData.append('amount', values.amount.toString());
      formData.append('totalAmount', values.amount.toString());
      
      // Append files
      if (uploadedFiles.bill) formData.append('bill', uploadedFiles.bill);
      if (uploadedFiles.receipt) formData.append('receipt', uploadedFiles.receipt);
      if (uploadedFiles.proof) formData.append('proof', uploadedFiles.proof);
      
      if (pendingRemovals.length > 0) {
        formData.append('removedAttachments', JSON.stringify(pendingRemovals));
      }

      const amountPaid = Number(values.amountPaid);
      
      try {
        const expenseResponse = await onSubmit(formData);
        const expenseId = (expenseResponse as any)?._id || (expenseResponse as any)?.data?._id;

        // Ensure productId is included in standard body if not in formData or needs separate sync
        // (Usually handled via formData above, but just in case)
        
        // If recording initial payment, create a payment record
        if (values.recordInitialPayment && amountPaid > 0 && expenseId) {
           await createPayment({
             date: values.date,
             amount: amountPaid,
             modeOfPayment: values.modeOfPayment,
             companyName: values.companyName,
             referenceId: expenseId,
             referenceType: 'Expense',
             type: 'Paid',
             status: 'completed',
             chequeNo: values.chequeNo,
             chequeDate: values.chequeDate,
             bank: values.bank,
             transactionId: values.transactionId,
             voucherNo: values.voucherNo,
             remarks: `Initial payment for expense ${values.referenceNo || 'entry'}`
           } as any);
        }
      } catch (error) {
        console.error('Submission failed', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
        try {
            const vData = await getVendorDropdown();
            setVendors(vData.data || []);

            if (!isEditMode) {
              const id = await getNextExpenseId();
              setNextId(id);
            } else if (initialData?._id) {
               setLoadingSettlements(true);
               const data = await getPayments({ search: '', type: 'Paid' }, 1, 100);
               const linked = data.payments.filter((p: any) => p.referenceId === initialData._id);
               setSettlements(linked);
            }
        } catch (error) {
            console.error('Failed to load expense data', error);
        } finally {
            setLoadingSettlements(false);
        }
    };
    fetchData();
  }, [isEditMode, initialData?._id]);

  const handleFileChange = (type: string, file: File | null) => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-black shadow-inner border border-gray-100">
            {isEditMode ? <Edit3 size={24} /> : <PlusCircle size={24} />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {isEditMode ? 'Modify' : 'Register'} <span className="text-black">Expenditure</span>
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Audit Trail & Fund Outflow Management</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {isEditMode ? (
              <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex flex-col items-end">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block text-right">Expense ID</span>
                <span className="font-mono font-bold text-black text-sm">{(initialData as any)?.expenseId || 'EXP-AUTO'}</span>
              </div>
           ) : (
             <div className="bg-gray-50/50 px-4 py-2 rounded-xl border border-gray-200 flex flex-col items-end animate-pulse">
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block text-right italic">Drafting ID</span>
                <span className="font-mono font-bold text-black text-sm">{nextId || 'EXP-...'}</span>
             </div>
           )}
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
           <Section title="Entity & Core Details" eyebrow="Identification">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <FormikSearchableSelect 
                    name="vendorId" 
                    label="Recipient Detail (Vendor)" 
                    placeholder="Search Vendor..."
                    options={vendors.map(v => ({ label: v.company, value: v._id! }))}
                    required
                    onChange={(val: any) => {
                       const selected = vendors.find(v => v._id === val);
                       formik.setFieldValue('vendorId', val);
                       formik.setFieldValue('companyName', selected?.company || '');
                    }}
                  />
                </div>
                <FormikInput 
                  name="referenceNo" 
                  label="Bill / Invoice No." 
                  placeholder="INV-001"
                />
                <FormikInput 
                  name="date" 
                  label="Transaction Date" 
                  type="date" 
                  required 
                />
                 <FormikSelect 
                    name="category" 
                    label="Expenditure Category" 
                    options={EXPENSE_CATEGORIES.map(c => ({ label: c, value: c }))} 
                    required 
                />

                <FormikInput 
                  name="paidBy" 
                  label="Paid By" 
                  placeholder="Enter name..."
                  required
                />
                <FormikInput name="amount" label="Amount (QAR)" type="number" required />
                <FormikSelect 
                  name="status" 
                  label="State" 
                  options={[
                    { label: 'Cleared', value: 'paid' },
                    { label: 'Partial', value: 'partially_paid' },
                    { label: 'Pending', value: 'pending' }
                  ]} 
                />
             </div>

             {formik.values.companyName && (
               <div className="mt-6 pt-6 border-t border-gray-50">
                  <CompanyFinanceHistory 
                    companyName={formik.values.companyName} 
                    type="Vendor" 
                    companyId={formik.values.vendorId}
                  />
               </div>
             )}
          </Section>


          <Section title="Financials & Accounting" eyebrow="Accounting">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                   {!isEditMode && (
                     <div className="flex items-center gap-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100">
                       <input 
                         type="checkbox" 
                         id="recordInitialPayment"
                         checked={formik.values.recordInitialPayment}
                         onChange={(e) => formik.setFieldValue('recordInitialPayment', e.target.checked)}
                         className="w-4 h-4 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
                       />
                       <label htmlFor="recordInitialPayment" className="flex items-center gap-2 cursor-pointer">
                         <span className="text-[10px] font-black text-gray-900 uppercase">Record Payment Now</span>
                       </label>
                     </div>
                   )}

                   {(formik.values.recordInitialPayment || isEditMode) && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormikSelect name="modeOfPayment" label="Method" options={paymentMethods.map(m => ({ label: m, value: m }))} required />
                        {!isEditMode && <FormikInput name="amountPaid" label="Paid Now" type="number" />}
                        <div className="col-span-1 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                          {formik.values.modeOfPayment === 'Cheque' && <div className="grid grid-cols-2 gap-4"><FormikInput name="chequeNo" label="Chq #" required /><FormikInput name="chequeDate" label="Date" type="date" required /></div>}
                          {formik.values.modeOfPayment === 'Bank Transfer' && <FormikInput name="transactionId" label="TRN ID" required />}
                          {formik.values.modeOfPayment === 'Cash' && <FormikInput name="voucherNo" label="Vch #" required />}
                        </div>
                     </div>
                   )}
                   <FormikTextarea name="description" label="Internal Notes" placeholder="Audit summary..." rows={2} />
                </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <Paperclip size={14} className="text-gray-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Document Evidence</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       {[
                         { id: 'bill', label: 'Bill', icon: Landmark },
                         { id: 'receipt', label: 'Receipt', icon: History },
                         { id: 'proof', label: 'Proof', icon: CreditCard }
                       ].map((type) => (
                         <div key={type.id} onClick={() => document.getElementById(`upload-${type.id}`)?.click()} className="relative p-4 bg-white border-2 border-dashed border-gray-100 rounded-xl hover:border-teal-700 hover:bg-teal-50/10 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center">
                            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                               {uploadedFiles[type.id] ? <Activity size={14} className="text-teal-600 animate-pulse" /> : <type.icon size={14} />}
                            </div>
                            <span className="text-[8px] font-black uppercase text-gray-500">{uploadedFiles[type.id]?.name || type.label}</span>
                            <input id={`upload-${type.id}`} type="file" className="hidden" onChange={(e) => handleFileChange(type.id, e.target.files?.[0] || null)} />
                         </div>
                       ))}
                    </div>

                    {/* Existing Artifacts */}
                    {isEditMode && existingAttachments.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-50">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {existingAttachments.map((file, idx) => (
                             <div key={idx} className="group relative p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between transition-all hover:bg-white hover:shadow-xl hover:border-gray-200">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-8 h-8 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-gray-400">
                                    <Paperclip size={14} />
                                  </div>
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="text-[9px] font-black uppercase text-gray-400">{file.type}</span>
                                    <span className="text-[10px] font-bold text-gray-700 truncate max-w-[120px]">{file.name || 'document.pdf'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    type="button" 
                                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}${file.url}`, '_blank')}
                                    className="w-8 h-8 flex items-center justify-center text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                    title="View"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      if (window.confirm('Delete this artifact reference?')) {
                                         setPendingRemovals(prev => [...prev, file.url]);
                                         setExistingAttachments(prev => prev.filter(a => a.url !== file.url));
                                      }
                                    }}
                                    className="w-8 h-8 flex items-center justify-center text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Remove"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}
                 </div>
             </div>
          </Section>

          {isEditMode && (
            <Section title="Artifacts & Settlement" eyebrow="History">
                <div className="overflow-hidden rounded-xl border border-gray-100 max-h-48 overflow-y-auto">
                   <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[8px] uppercase font-black text-gray-400">
                          <th className="px-4 py-2">ID</th>
                          <th className="px-4 py-2">Date</th>
                          <th className="px-4 py-2 text-right">Amount</th>
                          <th className="px-4 py-2">Method</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {settlements.map((s, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 font-bold text-gray-700">
                            <td className="px-4 py-2 font-mono text-teal-600">#{s.paymentId}</td>
                            <td className="px-4 py-2">{new Date(s.date).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-right text-emerald-600">QAR {s.amount?.toLocaleString()}</td>
                            <td className="px-4 py-2 uppercase text-gray-400">{s.modeOfPayment}</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
            </Section>
          )}

          <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting || isLoading}
              className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all flex items-center gap-3 ${
                formik.isSubmitting || isLoading
                  ? 'bg-gray-300 cursor-not-allowed shadow-none'
                  : 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/30'
              }`}
            >
              <Wallet size={16} />
              {isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default ExpenseForm;
