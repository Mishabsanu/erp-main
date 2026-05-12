'use client';

import React from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Edit3, UserPlus, ShieldCheck } from 'lucide-react';
import { Customer } from '@/lib/types';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikPhoneInput } from '@/components/shared/FormikPhoneInput';

const CustomerValidationSchema = Yup.object({
  // Basic Info
  company: Yup.string()
    .trim()
    .min(3, 'Minimum 3 characters')
    .required('Company name is required'),
  email: Yup.string()
    .nullable()
    .notRequired()
    .transform((v) => (v === '' ? null : v))
    .email('Enter a valid email'),
  mobile: Yup.string()
    .matches(/^\+?[\d\s-]{7,20}$/, 'Enter a valid mobile number')
    .required('Mobile number is required'),
  status: Yup.string()
    .oneOf(['active', 'inactive'])
    .required('Status is required'),
  contactPersonName: Yup.string()
    .trim()
    .min(3, 'Minimum 3 characters')
    .required('Contact person name is required'),
  contactPersonEmail: Yup.string()
    .nullable()
    .notRequired()
    .transform((v) => (v === '' ? null : v))
    .email('Enter a valid email'),
  contactPersonMobile: Yup.string()
    .matches(/^\+?[\d\s-]{7,20}$/, 'Enter a valid mobile number')
    .required('Contact person mobile number is required'),
});

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (
    customerData: Customer,
    formikHelpers: {
      setErrors: (errors: any) => void;
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode,
}) => {
  const formik = useFormik({
    initialValues: {
      company: initialData?.company || '',
      email: initialData?.email || '',
      mobile: initialData?.mobile || '',
      status: initialData?.status || 'active',
      contactPersonName: initialData?.contactPersonName || '',
      contactPersonEmail: initialData?.contactPersonEmail || '',
      contactPersonMobile: initialData?.contactPersonMobile || '',
    },
    validationSchema: CustomerValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      await onSubmit(
        {
          ...values,
          company: values.company.trim(),
          email: values.email?.trim().toLowerCase() || '',
        } as Customer,
        { setErrors, setSubmitting }
      );
    },
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      {/* HEADER SECTION */}
      <div className="max-w-full mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-700">
            {isEditMode ? <Edit3 size={24} /> : <UserPlus size={24} />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">
              {isEditMode ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
              CRM / Client Management
            </p>
          </div>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form id="customer-form" onSubmit={formik.handleSubmit} className="max-w-full mx-auto space-y-8 pb-20">
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* MAIN INFORMATION CARD */}
            <div className="xl:col-span-2 space-y-8">
              <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -mr-10 -mt-10 opacity-40" />
                
                <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <span className="w-2 h-6 bg-[#0f766e] rounded-full" />
                  Customer Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormikInput
                    label="Company / Client Name"
                    name="company"
                    placeholder="Enter registered legal entity name"
                    required
                  />
                  <FormikSelect
                    label="Account Status"
                    name="status"
                    required
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                    ]}
                  />
                  <FormikPhoneInput
                    label="Corporate Mobile"
                    name="mobile"
                    placeholder="+1 234 567 890"
                    required
                  />
                  <FormikInput
                    label="Correspondence Email"
                    name="email"
                    placeholder="office@clientcompany.com"
                  />

                </div>
              </div>

              {/* CONTACT PERSON CARD */}
              <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <span className="w-2 h-6 bg-teal-600/40 rounded-full" />
                  Contact Person
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FormikInput
                    label="Full Name"
                    name="contactPersonName"
                    placeholder="e.g. John Doe"
                    required
                  />
                  <FormikPhoneInput
                    label="Direct Contact No"
                    name="contactPersonMobile"
                    placeholder="+1 234 567 890"
                    required
                  />
                  <FormikInput
                    label="Official Email"
                    name="contactPersonEmail"
                    placeholder="john@clientcompany.com"
                  />
                </div>
              </div>
            </div>

            {/* SIDEBAR / SETTINGS */}
            <div className="xl:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                  Account Insights
                </h3>

                <div className="space-y-4">
                  <div className="p-6 rounded-2xl border-2 border-slate-50 bg-slate-50/30">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck className="text-[#0f766e]" size={18} />
                      <span className="font-bold text-slate-700 text-sm">KYC Verified</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Standard compliance check will be initiated upon registration.
                    </p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                      Client Categorization
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                      Customers registered here will be available for Quotation tracking and Sales Orders across all modules.
                    </p>
                  </div>
                </div>
              </div>

              {/* STATS PLACEHOLDER */}
              <div className="bg-[#0f766e] p-8 rounded-[2rem] shadow-xl shadow-teal-900/20 text-white relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <h4 className="text-xs font-black uppercase tracking-widest text-teal-100/60 mb-2">CRM Summary</h4>
                <p className="text-2xl font-bold leading-tight">Unified Client Database</p>
                <div className="mt-6 flex items-center gap-2">
                  <div className="w-8 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-white rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-50 italic">System Synchronized</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pt-10 border-t border-slate-100 mt-12">
             <button
               type="button"
               onClick={onCancel}
               className="px-8 py-3.5 rounded-2xl border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
             >
               Discard Entry
             </button>
             <button
               type="submit"
               disabled={formik.isSubmitting}
               className="px-12 py-3.5 bg-[#0f766e] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-teal-900/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
             >
               {formik.isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
               {isEditMode ? 'Authorize Update' : 'Register Customer'}
             </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default CustomerForm;
