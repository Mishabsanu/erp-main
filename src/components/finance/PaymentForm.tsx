'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import FormikSearchableSelect from '@/components/shared/FormikSearchableSelect';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { Section } from '@/components/ui/Section';
import { Customer, Invoice, Payment, Vendor } from '@/lib/types';
import { getCustomerDropdown } from '@/services/customerApi';
import { getInvoices, getNextPaymentId } from '@/services/financeApi';
import { getVendorDropdown } from '@/services/vendorApi';
import { FormikProvider, useFormik } from 'formik';
import {
  Activity,
  CreditCard, Edit3,
  Eye,
  History,
  Landmark,
  Paperclip,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as Yup from 'yup';
import { CompanyFinanceHistory } from './CompanyFinanceHistory';

const validationSchema = Yup.object().shape({
  date: Yup.string().required('Date is required'),
  amount: Yup.number().required('Amount is required'),
  modeOfPayment: Yup.string().required('Mode of Payment is required'),
  status: Yup.string().required('Status is required'),
  recipientDetailId: Yup.string().required('Customer selection is required'),
  category: Yup.string().required('Collection category is required'),
  paidBy: Yup.string().required('Collected by name is required'),
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

const COLLECTION_CATEGORIES = [
  'Products',
  'Service Fees',
  'Project Payment',
  'Consultancy',
  'Rental Income',
  'Consultation',
  'Sale of Assets',
  'Advance Payment',
  'Refund',
  'Other Income'
];

interface PaymentFormProps {
  initialData?: Partial<Payment>;
  onSubmit: (values: any) => Promise<any>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PaymentFormInner: React.FC<PaymentFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({
    bill: null,
    receipt: null,
    proof: null
  });
  const [pendingRemovals, setPendingRemovals] = useState<string[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>(initialData?.attachments || []);
  const [nextId, setNextId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const isEditMode = !!initialData?._id;

  const formik = useFormik<any>({
    initialValues: {
      date: initialData?.date || new Date().toISOString().split('T')[0],
      type: initialData?.type || 'Received',
      category: initialData?.category || '',
      amount: initialData?.amount || 0,
      modeOfPayment: initialData?.modeOfPayment || 'Bank Transfer',
      companyName: initialData?.companyName || '',
      referenceId: initialData?.referenceId || '',
      remarks: initialData?.remarks || '',
      status: initialData?.status || 'completed',
      chequeNo: initialData?.chequeNo || '',
      chequeDate: initialData?.chequeDate || '',
      bank: initialData?.bank || '',
      transactionId: initialData?.transactionId || '',
      voucherNo: initialData?.voucherNo || '',
      paidBy: initialData?.paidBy || '',
      recipientDetailId: initialData?.recipientDetailId || '',
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      const formData = new FormData();
      
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      if (uploadedFiles.bill) formData.append('bill', uploadedFiles.bill);
      if (uploadedFiles.receipt) formData.append('receipt', uploadedFiles.receipt);
      if (uploadedFiles.proof) formData.append('proof', uploadedFiles.proof);

      if (pendingRemovals.length > 0) {
        formData.append('removedAttachments', JSON.stringify(pendingRemovals));
      }

      if (!values.referenceId) {
        formData.set('referenceType', 'General');
      }

      try {
        await onSubmit(formData);
      } catch (error: any) {
         toast.error(error.response?.data?.message || 'Submission failed. Please check your network or server.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Help user see why form is stuck
  const handleSubmissionAttempt = () => {
    if (!formik.isValid && formik.submitCount > 0) {
      const firstError = Object.values(formik.errors)[0] as string;
      if (firstError) toast.error(`Validation Error: ${firstError}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const custData = await getCustomerDropdown();
        setCustomers(custData.data || []);
      } catch (error) {
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    if (!isEditMode) {
      getNextPaymentId().then(setNextId).catch(console.error);
      
      const company = searchParams?.get('company');
      const amount = searchParams?.get('amount');
      const referenceId = searchParams?.get('referenceId');
      const referenceType = searchParams?.get('referenceType');

      if (company) formik.setFieldValue('companyName', company);
      if (amount && Number(amount) > 0) formik.setFieldValue('amount', Number(amount));
      if (referenceId) formik.setFieldValue('referenceId', referenceId);
      if (referenceType) formik.setFieldValue('referenceType', referenceType);
    }
  }, [isEditMode, searchParams]);


  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-black shadow-inner border border-gray-100">
            {isEditMode ? <Edit3 size={24} /> : <PlusCircle size={24} />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {isEditMode ? 'Modify' : 'Post'} <span className="text-black">Collection</span>
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Treasury & Fund Allocation Audit</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {isEditMode ? (
              <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex flex-col items-end">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block text-right">COLLECTION ID</span>
                <span className="font-mono font-bold text-black text-sm">{(initialData as any)?.paymentId || 'COL-AUTO'}</span>
              </div>
           ) : (
             <div className="bg-gray-50/50 px-4 py-2 rounded-xl border border-gray-200 flex flex-col items-end animate-pulse">
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block text-right italic">Drafting Entry</span>
                <span className="font-mono font-bold text-black text-sm">{nextId || 'COL-...'}</span>
             </div>
           )}
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
           <Section title="Entity & Core Details" eyebrow="Identification">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <FormikSearchableSelect 
                    name="recipientDetailId" 
                    label="Recipient Detail (Customer) *" 
                    placeholder="Search Customer..."
                    options={customers.map(c => ({ label: c.company, value: c._id! }))}
                    required
                    onChange={(val: any) => {
                       const selected = customers.find(c => c._id === val);
                       formik.setFieldValue('recipientDetailId', val);
                       formik.setFieldValue('companyName', selected?.company || '');
                    }}
                  />
                </div>
                <div className="md:col-span-1">
                  <FormikSelect 
                    name="category" 
                    label="Expenditure Category *" 
                    options={COLLECTION_CATEGORIES.map(cat => ({ label: cat, value: cat }))} 
                    required
                  />
                </div>
                <FormikInput name="date" label="Collection Date" type="date" required />
                <FormikInput 
                  name="paidBy" 
                  label="Collected By" 
                  placeholder="Collector name..."
                  required
                />
                <FormikInput 
                  name="referenceId" 
                  label="Ref / Invoice No" 
                  placeholder="Manual reference..."
                />
             </div>

             {formik.values.companyName && (
               <div className="mt-6 pt-6 border-t border-gray-50">
                  <CompanyFinanceHistory 
                    companyName={formik.values.companyName} 
                    type="Customer" 
                    companyId={formik.values.customerId}
                  />
               </div>
             )}
          </Section>

          <Section title="Financials & Accounting" eyebrow="Accounting">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Settlement Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormikInput name="amount" label="Amount (QAR)" type="number" required />
                    <FormikSelect name="modeOfPayment" label="Method" options={paymentMethods.map(m => ({ label: m, value: m }))} required />
                    <FormikSelect name="status" label="Registry Status" options={[{ label: 'Completed', value: 'completed' }, { label: 'Pending', value: 'pending' }, { label: 'Failed', value: 'failed' }]} />
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    {formik.values.modeOfPayment === 'Cheque' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <FormikInput name="chequeNo" label="Chq No" required />
                         <FormikInput name="chequeDate" label="Chq Date" type="date" required />
                         <FormikInput name="bank" label="Bank" required />
                      </div>
                    )}
                    {formik.values.modeOfPayment === 'Bank Transfer' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormikInput name="transactionId" label="TRN ID" required />
                         <FormikInput name="bank" label="Payer Bank" />
                      </div>
                    )}
                    {formik.values.modeOfPayment === 'Cash' && (
                       <FormikInput name="voucherNo" label="Voucher No" required />
                    )}
                    <div className="mt-4">
                      <FormikTextarea name="remarks" label="Audit Remarks" placeholder="Transaction details..." rows={2} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2 mb-2">
                     <Paperclip size={14} className="text-emerald-600" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Document Evidence</span>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'bill', label: 'Bill', icon: Landmark },
                        { id: 'receipt', label: 'Receipt', icon: History },
                        { id: 'proof', label: 'Proof', icon: CreditCard }
                      ].map((type) => (
                        <div 
                          key={type.id} 
                          onClick={() => document.getElementById(`upload-${type.id}`)?.click()} 
                          className="relative p-4 bg-white border-2 border-dashed border-gray-100 rounded-xl hover:border-emerald-700 hover:bg-emerald-50/10 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center"
                        >
                           <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                             {uploadedFiles[type.id] ? <Activity size={14} className="text-emerald-600 animate-pulse" /> : <type.icon size={14} />}
                           </div>
                           <span className="text-[8px] font-black uppercase text-gray-500">{uploadedFiles[type.id]?.name || type.label}</span>
                           <input id={`upload-${type.id}`} type="file" className="hidden" onChange={(e) => {
                             const file = e.target.files?.[0] || null;
                             setUploadedFiles(prev => ({ ...prev, [type.id]: file }));
                           }} />
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

          <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmissionAttempt}
              disabled={formik.isSubmitting || isLoading}
              className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all flex items-center gap-3 ${
                formik.isSubmitting || isLoading
                  ? 'bg-gray-300 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              }`}
            >
              <Activity size={16} />
              {isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => (
    <Suspense fallback={<div className="p-20 text-center font-bold text-gray-400">Initializing treasury environment...</div>}>
        <PaymentFormInner {...props} />
    </Suspense>
);

export default PaymentForm;
