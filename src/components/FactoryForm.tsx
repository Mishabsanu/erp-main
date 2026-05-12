import { FormikInput } from '@/components/shared/FormikInput';
import FormikSearchableSelect from '@/components/shared/FormikSearchableSelect';
import {
  Building2,
  Camera,
  Package,
  Hash,
  Calendar as CalendarIcon,
  Clock,
  Minus,
  Plus,
  Layers,
  FileText,
  AlertCircle,
  Edit3,
  UserPlus,
  Trash2
} from 'lucide-react';
import { getRawMaterialDropdown } from '@/services/rawMaterialApi';
import { getProductDropdown } from '@/services/catalogApi';
import { FormikProvider, useFormik, FieldArray } from 'formik';
import React, { useState, useEffect, useMemo } from 'react';
import * as Yup from 'yup';

interface FactoryFormProps {
  initialData?: any;
  onSubmit: (data: FormData, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const FactoryForm: React.FC<FactoryFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const ProductionValidationSchema = useMemo(() => Yup.object({
    productId: Yup.string().required('Product is required'),
    quantity: Yup.number().required('Quantity is required').min(1, 'Minimum 1 unit'),
    batchNumber: Yup.string().required('Batch number is required'),
    rawMaterials: Yup.array().of(
      Yup.object({
        material: Yup.string().required('Material is required'),
        quantity: Yup.number()
          .required('Quantity is required')
          .min(0.01, 'Quantity must be greater than 0')
          .test('stock-check', 'Insufficient stock available', function (value) {
            const materialId = this.parent.material;
            const material = rawMaterials.find(rm => rm._id === materialId);
            if (!material) return true;
            return (value || 0) <= material.availableQty;
          })
      })
    )
  }), [rawMaterials]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, rawData] = await Promise.all([
          getProductDropdown(),
          getRawMaterialDropdown()
        ]);
        setProducts(prodData || []);
        setRawMaterials(rawData || []);
      } catch (error) {
        console.error('Failed to load metadata');
      }
    };
    fetchData();
  }, []);

  const productOptions = useMemo(() =>
    products.map(p => ({ value: p._id, label: `${p.name} (${p.itemCode})` })),
    [products]
  );

  const materialOptions = useMemo(() =>
    rawMaterials
      .filter(rm => isEditMode || rm.availableQty > 0)
      .map(rm => ({
        value: rm._id,
        label: `${rm.name} [${rm.itemCode}]`
      })),
    [rawMaterials, isEditMode]
  );

  const formik = useFormik({
    initialValues: {
      productId: initialData?.productId?._id || initialData?.productId || '',
      quantity: initialData?.quantity || '',
      batchNumber: initialData?.batchNumber || '',
      manufacturingDate: initialData?.manufacturingDate ? new Date(initialData.manufacturingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      remarks: initialData?.remarks || '',
      rawMaterials: initialData?.rawMaterials?.map((rm: any) => ({
        material: rm.material?._id || rm.material,
        quantity: rm.quantity
      })) || [{ material: '', quantity: '' }],
    },
    validationSchema: ProductionValidationSchema,
    onSubmit: async (values, helpers) => {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'rawMaterials') {
          const cleanedMaterials = values.rawMaterials.map((rm: any) => ({
            material: rm.material,
            quantity: Number(rm.quantity) || 0
          }));
          formData.append(key, JSON.stringify(cleanedMaterials));
        } else {
          formData.append(key, (values as any)[key]);
        }
      });
      if (imageFile) formData.append('image', imageFile);
      await onSubmit(formData, helpers);
    },
    enableReinitialize: true,
  });

  return (
    <FormikProvider value={formik}>
      <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-8">
        {/* HEADER SECTION */}
        <div className="max-w-full mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[1.5rem] border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#0f766e]/10 rounded-2xl flex items-center justify-center text-[#0f766e]">
              {isEditMode ? <Edit3 size={28} /> : <Building2 size={28} />}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                {isEditMode ? 'Edit Production' : 'New Production Cycle'}
              </h2>
              <p className="text-slate-400 font-medium text-sm">
                Operational Terminal &bull; Manufacturing Execution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel Report
            </button>
            <button
              type="submit"
              onClick={() => formik.handleSubmit()}
              disabled={formik.isSubmitting}
              className="px-8 py-2.5 bg-[#0f766e] text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-900/20 hover:bg-[#134e4a] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {formik.isSubmitting ? <Clock size={16} className="animate-spin" /> : <FileText size={16} />}
              {isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="max-w-full mx-auto space-y-8 pb-20">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* LEFT COLUMN: PRIMARY DATA */}
            <div className="xl:col-span-2 space-y-8">
              <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <span className="w-2 h-6 bg-[#0f766e] rounded-full" />
                  Cycle Specifications
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <FormikSearchableSelect
                      label="Target Catalog Item"
                      name="productId"
                      options={productOptions}
                      placeholder="Search product by name or SKU..."
                      required
                    />
                  </div>
                  <FormikInput
                    label="Batch Number"
                    name="batchNumber"
                    placeholder="e.g. BTC-2024-001"
                    required
                  />
                  <FormikInput
                    label="Output Quantity"
                    name="quantity"
                    type="number"
                    placeholder="0"
                    required
                  />
                  <FormikInput
                    label="Manufacturing Date"
                    name="manufacturingDate"
                    type="date"
                    required
                  />
                </div>
              </div>

              {/* MATERIAL CONSUMPTION */}
              <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight">Resource Consumption</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Inventory Deduction Ledger</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      formik.setFieldValue('rawMaterials', [...formik.values.rawMaterials, { material: '', quantity: '' }]);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                  >
                    <Plus size={14} strokeWidth={3} />
                    Add Resource
                  </button>
                </div>

                <div className="space-y-4">
                  {/* HEADER ROW - HIDDEN ON MOBILE */}
                  <div className="hidden md:grid grid-cols-12 gap-6 px-4 mb-2">
                    <div className="col-span-7">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Material Specification</label>
                    </div>
                    <div className="col-span-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Consumption Qty</label>
                    </div>
                  </div>

                  <FieldArray name="rawMaterials">
                    {({ remove }) => (
                      <div className="space-y-4">
                        {formik.values.rawMaterials.map((rm: any, idx: number) => (
                          <div
                            key={idx}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 p-6 bg-slate-50/50 hover:bg-white rounded-[1.5rem] border border-slate-100 hover:border-teal-100/50 transition-all group relative items-start shadow-sm hover:shadow-md hover:shadow-teal-900/5 focus-within:z-10"
                          >
                            {/* INDICATOR TAG */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-slate-200 group-hover:bg-teal-500 rounded-r-full transition-colors" />

                            <div className="col-span-1 md:col-span-7 space-y-3">
                              <FormikSearchableSelect
                                name={`rawMaterials[${idx}].material`}
                                options={materialOptions}
                                placeholder="Select available material..."
                              />
                              {/* AVAILABILITY BADGE */}
                              {rm.material && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200/60 shadow-sm animate-in fade-in slide-in-from-top-1 w-fit">
                                  <Layers size={10} className="text-[#0f766e]" />
                                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                                    Current Stock:
                                    <span className={`px-1.5 py-0.5 rounded ${rawMaterials.find(m => m._id === rm.material)?.availableQty <= 5 ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-700'
                                      }`}>
                                      {rawMaterials.find(m => m._id === rm.material)?.availableQty.toLocaleString() || '0'}
                                      {" "}{rawMaterials.find(m => m._id === rm.material)?.unit || ''}
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="col-span-1 md:col-span-4">
                              <FormikInput
                                name={`rawMaterials[${idx}].quantity`}
                                type="number"
                                placeholder="0.00"
                                wrapperClassName="mb-0"
                                suffix={
                                  <span className="text-[10px] font-black text-slate-300 uppercase mr-1">
                                    {rawMaterials.find(m => m._id === rm.material)?.unit || 'Unit'}
                                  </span>
                                }
                              />
                            </div>
                            <div className="col-span-1 md:col-span-1 flex justify-center pt-2">
                              <button
                                type="button"
                                onClick={() => remove(idx)}
                                disabled={formik.values.rawMaterials.length === 1}
                                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-0 active:scale-90"
                                title="Remove item"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </FieldArray>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: DOCUMENTATION */}
            <div className="xl:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                  Batch documentation
                </h3>

                <div className="space-y-6">
                  <div className="relative group aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center transition-all hover:border-[#0f766e] overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    {imageFile ? (
                      <div className="text-center p-6">
                        <Package size={48} className="text-[#0f766e] mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-bold text-[#0f766e] truncate max-w-[200px]">{imageFile.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase mt-2">Ready to upload</p>
                      </div>
                    ) : initialData?.image ? (
                      <div className="absolute inset-0 group">
                        <img
                          src={initialData.image.startsWith('http') ? initialData.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${initialData.image}`}
                          alt="Current Batch"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Camera size={24} className="text-white mb-2" />
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">Change Image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <Camera size={40} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-xs font-bold text-slate-400">Capture Batch Image</p>
                        <p className="text-[10px] text-slate-300 mt-2 italic">JPEG or PNG &bull; Max 5MB</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Process Remarks</label>
                    <textarea
                      name="remarks"
                      value={formik.values.remarks}
                      onChange={formik.handleChange}
                      rows={5}
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-5 text-sm text-slate-600 outline-none focus:border-[#0f766e] transition-all resize-none shadow-inner"
                      placeholder="Enter quality observations or shift notes..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="relative z-10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Stock Policy</h4>
                  <p className="text-lg font-bold leading-snug">Approval required for inventory integration.</p>
                  <p className="text-[11px] text-slate-500 mt-4 leading-relaxed italic">
                    Once saved, this report moves to the Inventory Approval queue for validation by quality supervisors.
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

export default FactoryForm;
