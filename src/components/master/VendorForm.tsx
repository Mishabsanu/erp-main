'use client';

import React from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Edit3, UserPlus } from 'lucide-react';
import { Vendor } from '@/lib/types';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { Section } from '@/components/ui/Section';
import { FormikPhoneInput } from '@/components/shared/FormikPhoneInput';

const VendorValidationSchema = Yup.object({
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
  // Contact Person Details
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
interface VendorFormProps {
  initialData?: Vendor;
  onSubmit: (
    vendorData: Vendor,
    formikHelpers: {
      setErrors: (errors: any) => void;
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const VendorForm: React.FC<VendorFormProps> = ({
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
      isInternal: initialData?.isInternal || false,
    },
    validationSchema: VendorValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      await onSubmit(
        {
          ...values,
          company: values.company.trim(),
          email: values.email?.trim().toLowerCase() || '',
        } as Vendor,
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
              {isEditMode ? 'Edit Vendor' : 'Add New Vendor'}
            </h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
              Master Data / Supply Chain
            </p>
          </div>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form id="vendor-form" onSubmit={formik.handleSubmit} className="max-w-full mx-auto space-y-8 pb-20">
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* MAIN INFORMATION CARD */}
            <div className="xl:col-span-2 space-y-8">
              <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -mr-10 -mt-10 opacity-40" />
                
                <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <span className="w-2 h-6 bg-[#0f766e] rounded-full" />
                  Vendor Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormikInput
                    label="Company / Vendor Name"
                    name="company"
                    placeholder="Enter official registered name"
                    required
                  />
                  <FormikSelect
                    label="Operating Status"
                    name="status"
                    required
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                    ]}
                  />
                  <FormikPhoneInput
                    label="Primary Mobile"
                    name="mobile"
                    placeholder="+1 234 567 890"
                    required
                  />
                  <FormikInput
                    label="Business Email"
                    name="email"
                    placeholder="procurement@company.com"
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
                    placeholder="E.g. Alexander Pierce"
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
                    placeholder="alex@vendor.com"
                  />
                </div>
              </div>
            </div>

            {/* SIDEBAR / SETTINGS */}
            <div className="xl:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                  Vendor Identity
                </h3>

                <div 
                  onClick={() => formik.setFieldValue('isInternal', !formik.values.isInternal)}
                  className={`group cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${
                    formik.values.isInternal 
                    ? 'border-[#0f766e] bg-[#0f766e]/5 shadow-md shadow-teal-900/5' 
                    : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      formik.values.isInternal 
                      ? 'bg-[#0f766e] border-[#0f766e]' 
                      : 'border-slate-300 bg-white'
                    }`}>
                      {formik.values.isInternal && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className={`font-bold text-sm transition-colors ${
                        formik.values.isInternal ? 'text-[#0f766e]' : 'text-slate-700'
                      }`}>
                        Internal Production Unit
                      </p>
                      <p className="text-[11px] leading-relaxed text-slate-400 mt-1 font-medium italic">
                        Enable this if this vendor represents our own company manufacturing factory or internal warehouse.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    Security & Compliance
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                    Once marked as Internal, this vendor will be selectable as a stock source in the Production Module.
                  </p>
                </div>
              </div>

              {/* STATS PLACEHOLDER */}
              <div className="bg-[#0f766e] p-8 rounded-[2rem] shadow-xl shadow-teal-900/20 text-white relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <h4 className="text-xs font-black uppercase tracking-widest text-teal-100/60 mb-2">Registry Summary</h4>
                <p className="text-2xl font-bold leading-tight">Secure Supply Chain Data</p>
                <div className="mt-6 flex items-center gap-2">
                  <div className="w-8 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-white rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-50 italic">Validation Active</span>
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
               {isEditMode ? 'Authorize Update' : 'Register Vendor'}
             </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default VendorForm;
