'use client';

import { FormikProvider, useFormik } from 'formik';
import { PackagePlus, Trash2, Upload, FileText, X, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { Section } from '@/components/ui/Section';
import {
  InventoryFormData,
  PODropdownItem,
  Vendor,
} from '@/lib/types';
import { LabeledInput } from './shared/LabeledInput';

import { getProductDropdown } from '@/services/catalogApi';
import { getVendorDropdown } from '@/services/vendorApi';

/* ---------------- VALIDATION ---------------- */
const InventoryItemSchema = Yup.object().shape({
  productId: Yup.string().required('Product is required'),
  stock: Yup.number()
    .min(1, 'Stock must be at least 1')
    .required('Stock is required'),
  reorderLevel: Yup.number()
    .min(0, 'Reorder level cannot be negative')
    .nullable(),
});

const InventoryFormSchema = Yup.object().shape({
  date: Yup.string().required('Date is required'),
  poNo: Yup.string().nullable(), // Optional
  vendor: Yup.string().required('Vendor is required'),
  items: Yup.array()
    .of(InventoryItemSchema)
    .min(1, 'At least one item is required'),
});

interface InventoryFormProps {
  onSubmit: (
    payload: any,
    formikHelpers: {
      setErrors: (errors: any) => void;
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  isLoading?: boolean;
  initialData?: InventoryFormData;
}

/* ---------------- COMPONENT ---------------- */
const InventoryForm: React.FC<InventoryFormProps> = ({
  onSubmit,
  onCancel,
  isEditMode = false,
  isLoading,
  initialData,
}) => {
  const [products, setProducts] = useState<PODropdownItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorMobile, setVendorMobile] = useState('');
  const [vendorCompany, setVendorCompany] = useState('');

  /* ---------------- FETCH DROPDOWNS ---------------- */
  useEffect(() => {
    const loadData = async () => {
      const [pRes, vRes] = await Promise.all([
        getProductDropdown(),
        getVendorDropdown(),
      ]);

      if (pRes) setProducts(pRes);
      if (vRes?.success) setVendors(vRes.data);
    };

    loadData();
  }, []);

  /* ---------------- FORMIK ---------------- */

  const formik = useFormik<InventoryFormData>({
    enableReinitialize: true,
    initialValues: {
      date: initialData?.date || new Date().toISOString().split('T')[0],
      reference: initialData?.reference || '',
      remarks: initialData?.remarks || '',
      deliveryNote: initialData?.deliveryNote || null,
      productImage: initialData?.productImage || null,
      poNo: initialData?.poNo || '',
      vendor:
        typeof initialData?.vendor === 'object'
          ? (initialData.vendor as any)._id
          : initialData?.vendor || '',

      items: initialData?.items?.length
        ? initialData.items.map((item: any) => ({
          id: item.id || Date.now().toString(),
          productId: item.productId || '',
          itemCode: item.itemCode || '',
          unit: item.unit || '',
          stock: item.stock ?? 1,
          reorderLevel: item.reorderLevel ?? 0,
        }))
        : [
          {
            id: Date.now().toString(),
            productId: '',
            itemCode: '',
            unit: '',
            stock: '',
            reorderLevel: '',
          } as any,
        ],
    },

    validationSchema: InventoryFormSchema,

    onSubmit: (values, { setSubmitting, setErrors }) => {
      if (isEditMode) {
        onSubmit(
          {
            orderedQty: values.items[0].stock,
            reference: values.reference,
            remarks: values.remarks,
            poNo: values.poNo,
            vendor: values.vendor,
            itemCode: values.items[0].itemCode,
            product: values.items[0].productId,
            reorderLevel: values.items[0].reorderLevel,
            deliveryNote: values.deliveryNote,
            productImage: values.productImage,
          },
          { setErrors, setSubmitting }
        );
        return;
      }

      // CREATE MODE
      onSubmit(
        {
          date: values.date,
          reference: values.reference,
          remarks: values.remarks,
          poNo: values.poNo,
          vendor: values.vendor,
          deliveryNote: values.deliveryNote,
          productImage: values.productImage,
          items: values.items.map((item: any) => ({
            productId: item.productId,
            itemCode: item.itemCode,
            quantity: item.stock,
            reorderLevel: item.reorderLevel,
          })),
        },
        { setErrors, setSubmitting }
      );
    },
  });

  /* ---------------- VENDOR AUTO FILL ---------------- */
  useEffect(() => {
    const vendor = vendors.find((v) => v._id === formik.values.vendor);
    setVendorMobile(vendor?.mobile || '');
    setVendorCompany(vendor?.company || '');
  }, [formik.values.vendor, vendors]);

  /* ---------------- PRODUCT CHANGE ---------------- */
  const handleProductChange = (productId: string, index: number) => {
    const product = products.find((p) => p._id === productId);
    formik.setFieldValue(`items[${index}].productId`, productId);
    formik.setFieldValue(`items[${index}].itemCode`, product?.itemCode || '');
    formik.setFieldValue(`items[${index}].unit`, product?.unit || '');
    // Fetch reorderLevel if available in dropdown
    if ((product as any).reorderLevel !== undefined) {
      formik.setFieldValue(`items[${index}].reorderLevel`, (product as any).reorderLevel);
    }
  };

  /* ---------------- ADD / REMOVE ROW ---------------- */
  const addRow = () => {
    formik.setFieldValue('items', [
      ...formik.values.items,
      {
        id: Date.now().toString(),
        productId: '',
        itemCode: '',
        unit: '',
        stock: '',
        reorderLevel: '',
      },
    ]);
  };

  const removeRow = (index: number) => {
    const updated = [...formik.values.items];
    updated.splice(index, 1);
    formik.setFieldValue('items', updated);
  };
  const totalItems = formik.values.items.length;

  const totalStock = formik.values.items.reduce(
    (sum, item) => sum + (Number(item.stock) || 0),
    0
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      formik.setFieldValue(fieldName, e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      <form onSubmit={formik.handleSubmit}>
        <div className="page-header mb-12">
          <div>
            <div className="page-header-eyebrow">
              <div className="page-header-marker" />
              <span>Stock Management</span>
            </div>
            <h1 className="page-header-title">
              {isEditMode ? 'Modify' : 'Register'} <span className="gradient-text">Inventory</span>
            </h1>
            <p className="page-header-description">
              {isEditMode
                ? 'Update inventory levels and historical reference points for this stock entry.'
                : 'Account for incoming stock and link items to their associated purchase orders.'}
            </p>
          </div>
        </div>

        <FormikProvider value={formik}>
          {/* GENERAL INFO */}
          <Section eyebrow="Stock Management" title="Item" highlight="Details">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormikInput label="Date" name="date" type="date" required />
              <FormikInput label="Reference" name="reference" />
              <FormikInput label="PO Number" name="poNo" />
              <FormikSelect
                label="Vendor"
                name="vendor"
                options={vendors.map((v) => ({
                  value: v._id!,
                  label: v.name || v.company || 'Unknown',
                }))}
                required
              />
              <LabeledInput
                label="Vendor Mobile"
                value={vendorMobile}
                readOnly
              />
              <LabeledInput
                label="Vendor Company"
                value={vendorCompany}
                readOnly
              />
            </div>

            <div className="mt-6">
              <FormikTextarea
                label="Remarks"
                name="remarks"
                placeholder="Add any additional notes here..."
                rows={3}
              />
            </div>
          </Section>

          {/* ITEMS TABLE */}
          <Section title="Inventory Items" className="mt-8">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 ">
              <div className="overflow-x-auto">
                <table className="akod-table table-fixed">
                  {/* HEADER */}
                  <thead>
                    <tr
                      className="text-white text-sm uppercase tracking-wider"
                      style={{ backgroundColor: '#0f766e' }}
                    >
                      <th className="py-3 px-4 text-center w-12 !text-white">#</th>
                      <th className="w-[260px] py-2 px-3 text-left !text-white">
                        Product <span className="text-red-500">*</span>
                      </th>
                      <th className="w-[160px] py-2 px-3 text-left !text-white">
                        Item Code
                      </th>
                      <th className="w-[100px] py-2 px-3 text-left !text-white">Unit</th>
                      <th className="w-[120px] py-2 px-3 text-right !text-white">
                        Stock <span className="text-red-500">*</span>
                      </th>
                      <th className="w-[140px] py-2 px-3 text-right !text-white">
                        Reorder Qty
                      </th>
                      {!isEditMode && (
                        <th className="w-[70px] py-2 px-2 text-center !text-white">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody>
                    {formik.values.items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-gray-500 text-sm italic"
                        >
                          No inventory items added yet.
                        </td>
                      </tr>
                    ) : (
                      formik.values.items.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="text-center text-gray-600 text-sm">
                            {idx + 1}
                          </td>

                          {/* PRODUCT */}
                          <td className="px-3 py-1">
                            <FormikSelect
                              label=""
                              name={`items[${idx}].productId`}
                              options={products.map((p) => ({
                                value: p._id!,
                                label: p.name,
                              }))}
                              disabled={isEditMode} // 🔒 lock product
                              onChange={(e) =>
                                handleProductChange(e.target.value, idx)
                              }
                              wrapperClassName="mb-0"
                              className="h-8 text-sm"
                            />
                          </td>

                          {/* ITEM CODE */}
                          <td className="px-3 py-2 text-sm text-gray-700 truncate">
                            {item.itemCode || '—'}
                          </td>

                          {/* UNIT */}
                          <td className="px-3 py-2 text-sm text-gray-700">
                            {item.unit || '—'}
                          </td>

                          <td className="px-3 py-1">
                            <FormikInput
                              name={`items[${idx}].stock`}
                              type="number"
                              min={1}
                              wrapperClassName="mb-0"
                              className="h-8 text-sm text-right"
                            />
                          </td>

                          <td className="px-3 py-2 text-right">
                            <span className="text-[13px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                              {item.reorderLevel || '0'}
                            </span>
                          </td>

                          {/* ACTION */}
                          {!isEditMode && (
                            <td className="text-center">
                              <button
                                type="button"
                                onClick={() => removeRow(idx)}
                                className="p-1 rounded text-teal-700 hover:bg-teal-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* FOOTER TOTALS */}
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t">
                <div className="flex gap-6 text-sm text-gray-700">
                  <span>
                    Total Items:{' '}
                    <strong className="text-gray-900">{totalItems}</strong>
                  </span>
                  <span>
                    Total Stock:{' '}
                    <strong className="text-gray-900">{totalStock}</strong>
                  </span>
                </div>

                {!isEditMode && (
                  <button
                    type="button"
                    onClick={addRow}
                    className="bg-[#0f766e] text-white px-3 py-1.5 text-sm rounded-md"
                  >
                    + Add Row
                  </button>
                )}
              </div>
            </div>
          </Section>

          {/* ATTACHMENTS (Moved here) */}
          <Section eyebrow="Documentation" title="Associated" highlight="Files" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* DELIVERY NOTE */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Delivery Note</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Optional Attachment</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all text-gray-500 hover:text-teal-700 w-full">
                    <Upload className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-tight">
                      {formik.values.deliveryNote instanceof File
                        ? formik.values.deliveryNote.name
                        : typeof formik.values.deliveryNote === 'string' && formik.values.deliveryNote
                          ? formik.values.deliveryNote.split('/').pop()
                          : 'Upload Document'}
                    </span>
                    <input type="file" hidden onChange={(e) => handleFileChange(e, 'deliveryNote')} />
                  </label>
                  {formik.values.deliveryNote && (
                    <div className="flex gap-2">
                      {typeof formik.values.deliveryNote === 'string' && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}${formik.values.deliveryNote}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 flex items-center justify-center text-teal-600 hover:bg-teal-50 rounded-xl transition-colors border border-teal-100"
                          title="View Current Document"
                        >
                          <Eye size={20} />
                        </a>
                      )}
                      <button type="button" onClick={() => formik.setFieldValue('deliveryNote', null)} className="w-12 h-12 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-100" title="Remove">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* PRODUCT IMAGE */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                    <PackagePlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Product Image</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Visual Reference</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all text-gray-500 hover:text-teal-700 w-full">
                    <Upload className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-tight">
                      {formik.values.productImage instanceof File
                        ? formik.values.productImage.name
                        : typeof formik.values.productImage === 'string'
                          ? 'Change Current Image'
                          : 'Upload Screenshot'}
                    </span>
                    <input type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, 'productImage')} />
                  </label>
                  {formik.values.productImage && (
                    <div className="flex gap-2">
                      {typeof formik.values.productImage === 'string' && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm relative group">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${formik.values.productImage}`}
                            alt="Current"
                            className="w-full h-full object-cover"
                          />
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}${formik.values.productImage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <Eye size={14} className="text-white" />
                          </a>
                        </div>
                      )}
                      <button type="button" onClick={() => formik.setFieldValue('productImage', null)} className="w-12 h-12 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-100" title="Remove">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Section>
        </FormikProvider>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="border px-6 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formik.isValid || isLoading}
            className="bg-teal-700 text-white px-6 py-2 rounded-lg"
          >
            Save Inventory
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
