'use client';

import React from 'react';
import { FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { Account } from '@/lib/types';
import { BookOpen, Edit3 } from 'lucide-react';
import { Section } from '@/components/ui/Section';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Account Name is required'),
  code: Yup.string().required('Account Code is required'),
  type: Yup.string().required('Account Type is required'),
  openingBalance: Yup.number().required('Opening Balance is required').min(0, 'Balance cannot be negative'),
  status: Yup.string().required('Status is required'),
});

interface AccountFormProps {
  initialData?: Account;
  onSubmit: (values: Account) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Bank', 'Cash'];

const AccountForm: React.FC<AccountFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const isEditMode = !!initialData?._id;

  const formik = useFormik<Account>({
    initialValues: (initialData || {
      name: '',
      code: '',
      type: 'Bank',
      openingBalance: 0,
      status: 'active',
      description: '',
    }) as Account,
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values);
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-50 px-8 py-6 rounded-lg">
      {/* Header matching Sales module */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          {isEditMode ? (
            <Edit3 className="text-teal-700 w-6 h-6" />
          ) : (
            <BookOpen className="text-teal-700 w-6 h-6" />
          )}
          <h2 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Account' : 'Create New Account'}
          </h2>
        </div>
        <span className="text-sm text-gray-500 italic">
          {isEditMode
            ? `Updating Audit Record: ${formik.values.name}`
            : 'Initialize your chart of accounts with default balances'}
        </span>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10">
          <Section title="Account Identification">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FormikInput 
                  name="name" 
                  label="Account Title" 
                  placeholder="e.g. QNB Operating Account"
                  required
                />
                <FormikInput 
                  name="code" 
                  label="System Code" 
                  placeholder="e.g. ACC-1001"
                  required
                />
                <FormikSelect 
                  name="type" 
                  label="Category Type" 
                  options={accountTypes.map(t => ({ label: t, value: t }))}
                  required
                />
             </div>
          </Section>

          <Section title="Financial Parameters">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FormikInput 
                  name="openingBalance" 
                  label="Opening Balance (QAR)" 
                  type="number"
                  placeholder="0.00"
                  required
                />
                <FormikSelect 
                  name="status" 
                  label="Operational Status" 
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' }
                  ]}
                  required
                />
             </div>
             <div className="mt-8">
                <FormikTextarea 
                  name="description" 
                  label="Internal Remarks / Audit Notes" 
                  placeholder="Provide context for this account's usage in the general ledger..."
                  rows={4}
                />
             </div>
          </Section>

          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting || isLoading}
              className={`px-10 py-2.5 rounded-xl text-white font-bold shadow-lg shadow-teal-700/10 transition-all active:scale-95 ${
                formik.isSubmitting || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-teal-700 hover:bg-teal-800'
              }`}
            >
              {isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};


export default AccountForm;
