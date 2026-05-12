'use client';

import React, { useState, useEffect } from 'react';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { Invoice, Customer, Product, InvoiceItem } from '@/lib/types';
import { getCustomers } from '@/services/customerApi';
import { getCatalog as getProducts } from '@/services/catalogApi';
import { 
  Trash2, DollarSign, Percent, Edit3, PlusCircle, Receipt
} from 'lucide-react';
import { toast } from 'sonner';
import { Select } from '@/components/ui/Select';
import { Section } from '@/components/ui/Section';

const validationSchema = Yup.object().shape({
  invoiceNo: Yup.string().required('Invoice # is required'),
  customerId: Yup.string().required('Customer is required'),
  date: Yup.string().required('Date is required'),
  items: Yup.array().of(
    Yup.object().shape({
      productId: Yup.string().required('Required'),
      quantity: Yup.number().required('Required').min(1, 'Min 1'),
      unitPrice: Yup.number().required('Required').min(0, 'Min 0'),
    })
  ).min(1, 'Add at least one item'),
});

interface InvoiceFormProps {
  initialData?: Invoice;
  onSubmit: (values: Invoice) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const isEditMode = !!initialData?._id;

  useEffect(() => {
    const fetchData = async () => {
      setLoadingOptions(true);
      try {
        const [custData, prodData] = await Promise.all([
          getCustomers({ status: 'active' }, 1, 100),
          getProducts({ status: 'active' }, 1, 300)
        ]);
        setCustomers(custData.customers);
        setProducts(prodData.products);
      } catch (error) {
        toast.error('Failed to load customers or products');
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchData();
  }, []);

  const calculateTotals = (items: InvoiceItem[]) => {
    const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    return { subTotal, taxTotal, totalAmount: subTotal + taxTotal };
  };

  const formik = useFormik<Invoice>({
    initialValues: (initialData || {
      invoiceNo: '',
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      status: 'Draft',
      items: [],
      subTotal: 0,
      taxTotal: 0,
      totalAmount: 0,
      notes: '',
    }) as Invoice,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const totals = calculateTotals(values.items);
      await onSubmit({ ...values, ...totals });
    },
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      {/* Header matching Sales module */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          {isEditMode ? (
            <Edit3 className="text-teal-700 w-6 h-6" />
          ) : (
            <PlusCircle className="text-teal-700 w-6 h-6" />
          )}
          <h2 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
        </div>
        <span className="text-sm text-gray-500 italic">
           Official Billing Registry
        </span>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10">
          <Section eyebrow="Revenue" title="Invoice" highlight="Details">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FormikInput 
                  name="invoiceNo" 
                  label="Invoice Number" 
                  placeholder="e.g. INV-2024-001"
                  required
                />
                <FormikSelect 
                  name="customerId" 
                  label="Client / Debtor" 
                  options={customers.map(c => ({ label: c.company, value: c._id! }))}
                  required
                  disabled={loadingOptions}
                />
                <FormikInput 
                  name="date" 
                  label="Posting Date" 
                  type="date"
                  required
                />
             </div>
          </Section>

          <Section title="Invoice Line Items">
             <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-0 overflow-x-auto">
                   <table className="akod-table text-left">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description / SKU</th>
                        <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32 text-center">Qty</th>
                        <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-40">Unit Price</th>
                        <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-40">Tax %</th>
                        <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-40">Line Total</th>
                        <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16"></th>
                      </tr>
                    </thead>
                    <FieldArray name="items">
                      {(arrayHelpers) => (
                        <tbody>
                          {formik.values.items.map((item, index) => (
                            <tr key={index} className="border-t border-gray-50 hover:bg-gray-50/50 transition-all group">
                              <td className="px-6 py-4 min-w-[300px]">
                                <Select
                                  name={`items.${index}.productId`}
                                  value={item.productId}
                                  onChange={(e) => {
                                    const prodId = e.target.value;
                                    const prod = products.find(p => p._id === prodId);
                                    if (prod) {
                                      formik.setFieldValue(`items.${index}.productId`, prodId);
                                      formik.setFieldValue(`items.${index}.name`, prod.name);
                                      formik.setFieldValue(`items.${index}.unitPrice`, prod.price || 0);
                                      const total = item.quantity * (prod.price || 0);
                                      formik.setFieldValue(`items.${index}.total`, total);
                                    }
                                  }}
                                  className="h-10 text-sm border-none bg-transparent hover:bg-gray-100 transition-all font-bold text-gray-700"
                                >
                                  <option value="">Search Inventory Catalog...</option>
                                  {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.itemCode})</option>)}
                                </Select>
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  name={`items.${index}.quantity`}
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    formik.setFieldValue(`items.${index}.quantity`, val);
                                    formik.setFieldValue(`items.${index}.total`, val * item.unitPrice + (item.taxAmount || 0));
                                  }}
                                  className="w-full h-10 bg-transparent border-none text-center font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                                />
                              </td>
                              <td className="px-6 py-4">
                                 <div className="relative">
                                   <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">QAR</span>
                                   <input
                                      type="number"
                                      name={`items.${index}.unitPrice`}
                                      value={item.unitPrice}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        formik.setFieldValue(`items.${index}.unitPrice`, val);
                                        formik.setFieldValue(`items.${index}.total`, val * item.quantity + (item.taxAmount || 0));
                                      }}
                                      className="w-full h-10 bg-transparent border-none pl-10 font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                                   />
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="relative">
                                   <Percent size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                   <input
                                      type="number"
                                      name={`items.${index}.taxPercentage`}
                                      value={item.taxPercentage || 0}
                                      onChange={(e) => {
                                        const perc = Number(e.target.value);
                                        const taxAmt = (perc / 100) * (item.unitPrice * item.quantity);
                                        formik.setFieldValue(`items.${index}.taxPercentage`, perc);
                                        formik.setFieldValue(`items.${index}.taxAmount`, taxAmt);
                                        formik.setFieldValue(`items.${index}.total`, (item.unitPrice * item.quantity) + taxAmt);
                                      }}
                                      className="w-full h-10 bg-transparent border-none pl-8 font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                                   />
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="text-sm font-bold text-teal-700">
                                   QAR {item.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => arrayHelpers.remove(index)}
                                  className="text-gray-300 hover:text-teal-700 transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={6} className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/20">
                               <button
                                  type="button"
                                  onClick={() => arrayHelpers.push({ 
                                    productId: '', name: '', quantity: 1, unitPrice: 0, taxPercentage: 0, taxAmount: 0, total: 0 
                                  })}
                                  className="flex items-center gap-2 text-xs font-bold text-[#0f766e] hover:text-teal-700 transition-all uppercase tracking-widest"
                               >
                                  <PlusCircle size={16} /> Add Product Row
                               </button>
                            </td>
                          </tr>
                        </tbody>
                      )}
                    </FieldArray>
                   </table>
                </div>
             </div>
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
             <Section title="Notes & Terms">
                <FormikTextarea 
                  name="notes" 
                  label="Internal Remarks & Terms" 
                  placeholder="Terms of payment, delivery instructions..."
                  rows={6}
                />
             </Section>

             <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-gray-600 border-b border-gray-100 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider">Sub Total</span>
                  <span className="font-bold">QAR {calculateTotals(formik.values.items).subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600 border-b border-gray-100 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider">Tax Total</span>
                  <span className="font-bold">QAR {calculateTotals(formik.values.items).taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-gray-800 uppercase tracking-widest">Grand Total</span>
                  <span className="text-3xl font-bold text-teal-700 tracking-tighter">
                     QAR {calculateTotals(formik.values.items).totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
             </div>
          </div>

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
              className={`px-10 py-2.5 rounded-xl text-white font-bold shadow-lg shadow-teal-700/10 transition-all active:scale-95 flex items-center gap-2 ${
                formik.isSubmitting || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-teal-700 hover:bg-teal-800'
              }`}
            >
              <Receipt size={18} />
              {isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};


export default InvoiceForm;
