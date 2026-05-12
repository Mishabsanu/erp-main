'use client';

import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import Modal from '@/components/shared/Modal';
import { Expense, Payment } from '@/lib/types';
import { createPayment } from '@/services/financeApi';
import { toast } from 'sonner';
import { Wallet, CreditCard, Landmark, Clock, Activity, AlertCircle } from 'lucide-react';

interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  onSuccess: () => void;
}

const validationSchema = Yup.object().shape({
  date: Yup.string().required('Date is required'),
  amount: Yup.number().required('Amount is required').max(Yup.ref('balance'), 'Amount cannot exceed balance').min(0.01, 'Minimum 0.01 required'),
  modeOfPayment: Yup.string().required('Mode is required'),
  chequeNo: Yup.string().when('modeOfPayment', {
    is: 'Cheque',
    then: (schema) => schema.required('Required'),
  }),
  transactionId: Yup.string().when('modeOfPayment', {
    is: 'Bank Transfer',
    then: (schema) => schema.required('Required'),
  }),
});

export const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({ isOpen, onClose, expense, onSuccess }) => {
  if (!expense) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Settle Expense: ${expense.expenseId}`}>
      <div className="p-2">
        <div className="bg-emerald-50 rounded-2xl p-6 mb-8 border border-emerald-100 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Outstanding Balance</p>
              <h3 className="text-3xl font-black text-emerald-700 font-mono">QAR {expense.balance?.toLocaleString()}</h3>
           </div>
           <div className="p-4 bg-white rounded-xl shadow-sm border border-emerald-100/50">
              <Activity className="text-emerald-600" size={24} />
           </div>
        </div>

        <Formik
          initialValues={{
            date: new Date().toISOString().split('T')[0],
            amount: expense.balance || 0,
            balance: expense.balance || 0,
            modeOfPayment: 'Bank Transfer',
            chequeNo: '',
            chequeDate: '',
            bank: '',
            transactionId: '',
            voucherNo: '',
            companyName: expense.companyName,
            referenceId: expense._id,
            referenceType: 'Expense',
            type: 'Paid',
            status: 'completed',
            remarks: `Settlement for expense ${expense.expenseId}`
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await createPayment(values as any);
              toast.success('Payment recorded successfully');
              onSuccess();
              onClose();
            } catch (error) {
              toast.error('Failed to record payment');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, isSubmitting, handleSubmit }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormikInput name="date" label="Transaction Date" type="date" required />
                <FormikInput name="amount" label="Settlement Amount (QAR)" type="number" required />
              </div>

              <FormikSelect 
                name="modeOfPayment" 
                label="Mode of Payment" 
                options={[
                  { label: 'Bank Transfer', value: 'Bank Transfer' },
                  { label: 'Cash', value: 'Cash' },
                  { label: 'Cheque', value: 'Cheque' },
                  { label: 'Credit Card', value: 'Credit Card' },
                  { label: 'Other', value: 'Other' }
                ]} 
                required 
              />

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                  {values.modeOfPayment === 'Cheque' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                       <FormikInput name="chequeNo" label="Cheque No" required />
                       <FormikInput name="bank" label="Bank Name" required />
                    </div>
                  )}

                  {values.modeOfPayment === 'Bank Transfer' && (
                    <div className="animate-in fade-in duration-300">
                       <FormikInput name="transactionId" label="Transaction ID / Ref" required />
                    </div>
                  )}

                  {values.modeOfPayment === 'Cash' && (
                    <div className="animate-in fade-in duration-300">
                       <FormikInput name="voucherNo" label="Voucher Number" required />
                    </div>
                  )}
                  
                  {values.modeOfPayment !== 'Cheque' && values.modeOfPayment !== 'Bank Transfer' && values.modeOfPayment !== 'Cash' && (
                    <div className="flex items-center gap-3 text-gray-400 py-2">
                       <AlertCircle size={16} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">No additional fields required for this mode</span>
                    </div>
                  )}
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? <Activity size={14} className="animate-spin" /> : <Wallet size={14} />}
                  Confirm Settlement
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};
