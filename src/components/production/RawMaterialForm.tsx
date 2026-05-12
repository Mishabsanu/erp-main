'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { 
  Layers, 
  FileText, 
  Save, 
  Database
} from 'lucide-react';
import { FormikProvider, useFormik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

const RawMaterialSchema = Yup.object({
  name: Yup.string().required('Material name is required'),
  itemCode: Yup.string().required('Item code is required'),
  unit: Yup.string().required('Unit of measure is required'),
  reorderLevel: Yup.number().required('Reorder level is required').min(0),
});

interface RawMaterialFormProps {
  initialData?: any;
  onSubmit: (values: any, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const RawMaterialForm: React.FC<RawMaterialFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      itemCode: initialData?.itemCode || '',
      unit: initialData?.unit || 'KG',
      reorderLevel: initialData?.reorderLevel || 10,
      description: initialData?.description || '',
    },
    validationSchema: RawMaterialSchema,
    onSubmit: async (values, helpers) => {
      await onSubmit(values, helpers);
    },
    enableReinitialize: true,
  });

  return (
    <FormikProvider value={formik}>
      <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
        {/* HEADER AREA */}
        <div className="max-w-full mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[1.5rem] border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#0f766e]/10 rounded-2xl flex items-center justify-center text-[#0f766e]">
              <Layers size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                {isEditMode ? 'Edit Material' : 'Register Material'}
              </h2>
              <p className="text-slate-400 font-medium text-sm">
                Production Registry &bull; Resource Blueprint
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => formik.handleSubmit()}
              disabled={formik.isSubmitting}
              className="px-8 py-2.5 bg-[#0f766e] text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-900/20 hover:bg-[#134e4a] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} />
              {isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="max-w-full mx-auto space-y-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CORE SPECIFICATIONS */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-8">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <span className="w-2 h-6 bg-[#0f766e] rounded-full" />
                Material Identity
              </h3>

              <div className="space-y-6">
                <FormikInput 
                  label="Common Name" 
                  name="name" 
                  placeholder="e.g. Premium Rubber Sheet" 
                  required 
                />
                <FormikInput 
                  label="Internal Item Code" 
                  name="itemCode" 
                  placeholder="e.g. RAW-RM-001" 
                  required 
                />
                <div className="grid grid-cols-2 gap-6">
                  <FormikInput 
                    label="Unit (UOM)" 
                    name="unit" 
                    placeholder="KG / Meters / Ltr" 
                    required 
                  />
                  <FormikInput 
                    label="Alert Threshold" 
                    name="reorderLevel" 
                    type="number" 
                    placeholder="10" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* ADDITIONAL ATTRIBUTES */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <FileText size={14} />
                  Technical Specifications
                </h3>
                <textarea 
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  rows={6}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-5 text-sm text-slate-600 outline-none focus:border-[#0f766e] transition-all resize-none shadow-inner"
                  placeholder="Enter chemical composition, physical properties or usage instructions..."
                />
              </div>

              {/* INFORMATION CARD */}
              <div className="bg-[#0f172a] p-8 rounded-[2rem] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Database size={16} className="text-teal-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Sync</span>
                  </div>
                  <p className="text-lg font-bold leading-tight">Threshold notifications are automatically dispatched.</p>
                  <p className="text-[11px] text-slate-500 mt-4 leading-relaxed font-medium italic">
                    Defining an Alert Threshold enables the Procurement module to flag this material when stock levels drop below safety requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </FormikProvider>
  );
};

export default RawMaterialForm;
