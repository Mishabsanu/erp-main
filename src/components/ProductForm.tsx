'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { Section } from '@/components/ui/Section';
import { Product } from '@/lib/types';
import { FormikProvider, useFormik } from 'formik';
import { Edit3, PackagePlus } from 'lucide-react';
import React, { useEffect } from 'react';
import * as Yup from 'yup';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (
    productData: Product,
    imageFile: File | null, // Assume imageFile is always passed, even if null
    formikHelpers: {
      setErrors: (errors: any) => void;
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => void;
  onCancel: () => void;
  isEditMode: boolean;
  backendErrors?: { [key: string]: string };
  isLoading: boolean;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Product Name is required'),
  itemCode: Yup.string().required('Item Code is required'),
  status: Yup.string()
    .oneOf(['active', 'inactive'])
    .required('Status is required'),
  unit: Yup.string().required('Unit is required'),
  reorderLevel: Yup.number().min(0, 'Minimum 0').required('Reorder level is required'),
  description: Yup.string().required('Description is required'),
});

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode,
  backendErrors,
  isLoading,
}) => {
  const formik = useFormik({
    initialValues: {
      // --- Basic Info ---
      name: initialData?.name || '',
      itemCode: initialData?.itemCode || '',
      status: initialData?.status || 'active',
      unit: initialData?.unit || '',
      reorderLevel: initialData?.reorderLevel || 0,
      description: initialData?.description || '',
    },
    validationSchema, // Enable validation here
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting, setErrors }) => {
      const transformedValues: Product = {
        ...values,
      } as Product;
      // Pass null for imageFile for now, as it's not handled in this form's state
      onSubmit(transformedValues, null, { setErrors, setSubmitting });
    },
  });

  useEffect(() => {
    if (backendErrors) {
      formik.setErrors(backendErrors);
    }
  }, [backendErrors]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      {/* HEADER AREA */}
      <div className="max-w-full mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-700">
            {isEditMode ? <Edit3 size={24} /> : <PackagePlus size={24} />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
              Inventory / Product Catalog
            </p>
          </div>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="max-w-full mx-auto space-y-8 pb-20">
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
              <span className="w-2 h-6 bg-[#0f766e] rounded-full" />
              Product Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FormikInput
                label="Product Name"
                name="name"
                placeholder="e.g. Aluminium Ladder"
                required
              />
              <FormikInput
                label="Item Code"
                name="itemCode"
                placeholder="e.g. A-123"
                required
              />
              <FormikInput
                label="Unit of Measure"
                name="unit"
                required
                placeholder="e.g. Pieces, Meters"
              />
              <div className="lg:col-span-2">
                <FormikInput
                  label="Technical Description"
                  name="description"
                  required
                  placeholder="e.g. High quality industrial-grade aluminum storage solution..."
                />
              </div>
              <FormikInput
                label="Min Stock Alert Level"
                name="reorderLevel"
                type="number"
                required
                placeholder="0"
              />
              <FormikSelect
                label="Operational Status"
                name="status"
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                required
              />
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
               disabled={isLoading}
               className="px-12 py-3.5 bg-[#0f766e] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-teal-900/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
             >
               {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
               {isEditMode ? 'Authorize Update' : 'Finalize Ledger Entry'}
             </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default ProductForm;
