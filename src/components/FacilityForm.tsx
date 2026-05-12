'use client';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { useAuth } from '@/contexts/AuthContext';
import { Facility } from '@/lib/types';
import { FormikProvider, useFormik } from 'formik';
import { Building2, CheckCircle2 } from 'lucide-react';
import React from 'react';
import * as Yup from 'yup';

const FacilityValidationSchema = Yup.object({
  name: Yup.string().required('Facility name is required'),
  type: Yup.string().required('Facility type is required'),
});

interface FacilityFormProps {
  initialData?: Partial<Facility>;
  onSubmit: (data: Partial<Facility>, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const FacilityForm: React.FC<FacilityFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const { can } = useAuth();

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'Office',
      location: initialData?.location || '',
      capacity: initialData?.capacity || '',
      status: initialData?.status || 'active',
    },
    validationSchema: FacilityValidationSchema,
    onSubmit: async (values, helpers) => {
      await onSubmit(values as any, helpers);
    },
    enableReinitialize: true,
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      <div className="w-full mx-auto">
        {/* PREMIUM HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm mb-10 transition-all hover:shadow-md">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#0f766e]/10 rounded-2xl flex items-center justify-center text-[#0f766e] shadow-inner">
              <Building2 size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                {isEditMode ? 'Modify Registry' : 'Add New Facility'}
              </h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-[#0f766e] rounded-full" />
                Infrastructure & Asset Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="facility-form"
              disabled={formik.isSubmitting}
              className="px-10 py-3 bg-[#0f766e] text-white rounded-xl font-bold text-sm shadow-xl shadow-teal-900/20 hover:bg-[#134e4a] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {formik.isSubmitting ? <Building2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {formik.isSubmitting ? 'Processing...' : 'Save Registry'}
            </button>
          </div>
        </div>

        <FormikProvider value={formik}>
          <form id="facility-form" onSubmit={formik.handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm p-10 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">

              {/* SECTION HEADERS */}
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-[#0f766e] rounded-full" />
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Primary Identification</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-[#0f766e] rounded-full" />
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Spatial & Status</h3>
              </div>

              {/* ROW 1: Unit Name & Location */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1 flex items-center gap-1">
                  Unit Name <span className="text-rose-500">*</span>
                </label>
                <FormikInput
                  label=""
                  name="name"
                  placeholder="e.g. Al-Rayyan HQ"
                  wrapperClassName="mb-0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1">Geographic Location</label>
                <FormikInput
                  label=""
                  name="location"
                  placeholder="e.g. Street 302, Zone 56..."
                  wrapperClassName="mb-0"
                />
              </div>

              {/* ROW 2: Classification & Capacity/Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1 flex items-center gap-1">
                  Asset Classification <span className="text-rose-500">*</span>
                </label>
                <FormikSelect
                  label=""
                  name="type"
                  options={[
                    { value: 'Office', label: 'Office' },
                    { value: 'Camp', label: 'Camp' },
                    { value: 'Warehouse', label: 'Warehouse' },
                    { value: 'Workshop', label: 'Workshop' },
                    { value: 'Factory', label: 'Factory' },
                    { value: 'Production Center', label: 'Production Center' },
                  ]}
                  wrapperClassName="mb-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1">Capacity</label>
                  <FormikInput
                    label=""
                    name="capacity"
                    type="number"
                    placeholder="0"
                    wrapperClassName="mb-0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1 flex items-center gap-1">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <FormikSelect
                    label=""
                    name="status"
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                    ]}
                    wrapperClassName="mb-0"
                  />
                </div>
              </div>
            </div>
          </form>
        </FormikProvider>
      </div>
    </div>
  );
};

export default FacilityForm;
