'use client';

import React, { useEffect, useState } from 'react';
import { useFormik, FormikErrors, FormikProvider, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Edit3, PlusCircle, Trash2, Package, Weight, IndianRupee, Save, Plus } from 'lucide-react';
import { Product, QuoteLineItem } from '@/lib/types';
import { getProductDropdown, getProductById } from '@/services/catalogApi';
import { toast } from 'sonner';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { Section } from '@/components/ui/Section';

interface LineItem extends QuoteLineItem { }

const emptyItem = (): LineItem => ({
  productId: '',
  name: '',
  weight: 0,
  qty: 1,
  price: 0,
  priceUSD: 0,
  totalWeight: 0,
  totalCost: 0,
  totalCostUSD: 0,
  shippingAmount: 0,
  shippingPercentage: 0,
  marginPercentage: 0,
  marginAmount: 0,
  unitShippingAmount: 0,
  unitPriceWithShipping: 0,
  sellingPrice: 0,
  totalSellingPrice: 0,
  grossMargin: 0,
  deepPrice: 0,
  manualShipping: false,
});

const convertToUSD = (inr: number, rate: number) => (rate > 0 ? inr / rate : 0);

const lineItemSchema = Yup.object().shape({
  productId: Yup.string().required('Select a product'),
  weight: Yup.number()
    .typeError('Enter valid weight')
    .min(0, 'Weight cannot be negative')
    .required('Weight required'),
  qty: Yup.number()
    .typeError('Enter valid quantity')
    .min(1, 'Qty must be at least 1')
    .required('Quantity required'),
  price: Yup.number()
    .typeError('Enter valid price')
    .min(0, 'Price cannot be negative')
    .required('Price required'),
  marginPercentage: Yup.number()
    .typeError('Enter valid margin')
    .min(0, 'Margin cannot be negative')
    .max(100, 'Margin cannot be over 100')
    .required('Margin required'),
});

const validationSchema = Yup.object().shape({
  clientName: Yup.string().required('Client name is required'),
  totalContainers: Yup.number()
    .typeError('Must be number')
    .min(0, 'Cannot be negative')
    .required('Required'),
  costPerContainer: Yup.number()
    .typeError('Must be number')
    .min(0, 'Cannot be negative')
    .required('Required'),
  marginPercentage: Yup.number()
    .typeError('Must be number')
    .min(0, 'Cannot be negative')
    .max(100, 'Cannot be more than 100')
    .required('Required'),
  currency: Yup.string().required('Currency required'),
  exchangeRate: Yup.number()
    .typeError('Enter valid rate')
    .min(1, 'Rate must be > 0')
    .required('Exchange rate required'),
  items: Yup.array().of(lineItemSchema),
});

const QuoteTrackForm: React.FC<any> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode,
  isLoading,
}) => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProductDropdown();
        setProducts(data);
      } catch {
        toast.error('Failed to load products');
      }
    })();
  }, []);

  const formik = useFormik({
    initialValues: {
      clientName: initialData?.clientName || '',
      companyName: initialData?.companyName || '',
      totalContainers: initialData?.totalContainers || 1,
      costPerContainer: initialData?.costPerContainer || 0,
      marginPercentage: initialData?.marginPercentage || 10,
      currency: initialData?.currency || 'INR',
      exchangeRate: initialData?.exchangeRate || 80,
      items: initialData?.items || [emptyItem()],
      status: initialData?.status || 'Pending',
      remarks: initialData?.remarks || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({ ...values, ...totals });
    },
    enableReinitialize: true,
  });

  const updateLineItemDetails = async (index: number, productId: string) => {
    if (!productId) return;
    try {
      const prod = await getProductById(productId);
      formik.setFieldValue(`items.${index}.name`, prod.name);
      formik.setFieldValue(`items.${index}.price`, prod.price || 0);
      formik.setFieldValue(`items.${index}.weight`, Number(prod.weight) || 0);
    } catch {
      toast.error('Failed to fetch product details');
    }
  };

  const totals = React.useMemo(() => {
    let totalWeight = 0;
    let totalItemCost = 0;
    let totalQty = 0;

    formik.values.items.forEach((it: any) => {
      totalWeight += Number(it.totalWeight || 0);
      totalItemCost += Number(it.totalCost || 0);
      totalQty += Number(it.qty || 0);
    });

    const totalShippingCost = formik.values.totalContainers * formik.values.costPerContainer;
    const itemsTotalSelling = formik.values.items.reduce((acc: number, it: any) => acc + (it.totalSellingPrice || 0), 0);
    const itemsGrossMargin = formik.values.items.reduce((acc: number, it: any) => acc + (it.grossMargin || 0), 0);

    return {
      totalWeight,
      totalItemCost,
      totalQty,
      totalShippingCost,
      totalSellingPrice: itemsTotalSelling,
      totalGrossMargin: itemsGrossMargin,
    };
  }, [formik.values.items, formik.values.costPerContainer, formik.values.totalContainers]);

  // Handle auto-calculations
  useEffect(() => {
    const { totalContainers, costPerContainer, items, exchangeRate } = formik.values;
    let totalWeightVal = 0;
    items.forEach((it: any) => (totalWeightVal += (Number(it.weight) || 0) * (Number(it.qty) || 0)));

    const totalShipping = totalContainers * costPerContainer;
    const shippingPerKg = totalWeightVal > 0 ? totalShipping / totalWeightVal : 0;

    const updatedItems = items.map((it: any) => {
      const weight = Number(it.weight) || 0;
      const qty = Number(it.qty) || 0;
      const price = Number(it.price) || 0;
      const marginPerc = Number(it.marginPercentage) || 0;

      const totalWeight = weight * qty;
      const totalCost = price * qty;
      const unitShipping = weight * shippingPerKg;
      const marginAmt = price * (marginPerc / 100);
      const sPrice = price + unitShipping + marginAmt;

      return {
        ...it,
        totalWeight,
        totalCost,
        totalCostUSD: convertToUSD(totalCost, exchangeRate),
        priceUSD: convertToUSD(price, exchangeRate),
        unitShippingAmount: unitShipping,
        unitPriceWithShipping: price + unitShipping,
        marginAmount: marginAmt,
        sellingPrice: sPrice,
        totalSellingPrice: sPrice * qty,
        grossMargin: marginAmt * qty,
      };
    });

    if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
      formik.setFieldValue('items', updatedItems);
    }
  }, [formik.values.totalContainers, formik.values.costPerContainer, formik.values.items, formik.values.exchangeRate]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      <div className="page-header mb-12">
        <div>
          <div className="page-header-eyebrow">
            <div className="page-header-marker" />
            <span>Commercial Intelligence</span>
          </div>
          <h1 className="page-header-title">
            {isEditMode ? 'Modify' : 'Initialize'} <span className="gradient-text">Quote Tracking</span>
          </h1>
          <p className="page-header-description">
            Define shipping variables and line items to calculate target margins and selling prices in real-time.
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10">
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormikInput label="Client Name" name="clientName" required />
              <FormikInput label="Company Name" name="companyName" />
              <FormikSelect
                label="Currency"
                name="currency"
                options={[
                  { value: 'INR', label: 'INR' },
                  { value: 'USD', label: 'USD' },
                ]}
                required
              />
              <FormikInput label="Exchange Rate" name="exchangeRate" type="number" required />
            </div>
          </Section>

          <Section title="Shipping Parameters">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormikInput label="Total Containers" name="totalContainers" type="number" required />
              <FormikInput label="Cost Per Container (INR)" name="costPerContainer" type="number" required />
              <div className="bg-[#0f766e]/5 p-4 rounded-xl border border-[#0f766e]/10 flex flex-col justify-center">
                <span className="text-[10px] font-black text-[#0f766e] uppercase tracking-widest mb-1">Total Logistics Cost</span>
                <span className="text-xl font-bold text-[#0f766e]">₹{totals.totalShippingCost.toLocaleString()}</span>
              </div>
            </div>
          </Section>

          <Section title="Line Items">
            <FieldArray name="items">
              {({ push, remove }) => (
                <div className="overflow-x-auto">
                  <table className="akod-table whitespace-nowrap border-separate border-spacing-y-0.5">
                    <thead>
                      <tr className="bg-[#f8f9fc] text-[11px] font-black uppercase tracking-[0.1em] text-gray-500">
                        <th className="p-4 w-12 text-center rounded-l-xl">S.No</th>
                        <th className="p-4 min-w-[280px] text-left">Product / Catalog Item</th>
                        <th className="p-4 w-28 text-center text-[#0f766e]">Unit WT (KG)</th>
                        <th className="p-4 w-28 text-center">Quantity</th>
                        <th className="p-4 w-36 text-center">Rate ({formik.values.currency})</th>
                        <th className="p-4 w-32 text-center text-green-600">Margin %</th>
                        <th className="p-4 w-36 text-center">Unit Sell</th>
                        <th className="p-4 w-44 text-center">Net Total</th>
                        <th className="p-4 w-16 text-center rounded-r-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {formik.values.items.map((item: any, idx: number) => (
                        <tr key={idx} className="group hover:bg-teal-50/30 transition-all duration-200">
                          <td className="p-4 text-center border-b border-gray-50">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black text-[#0f766e] opacity-40 mb-0.5">#{idx + 1}</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-[#0f766e]" />
                            </div>
                          </td>
                          <td className="p-4 border-b border-gray-50">
                            <FormikSelect
                              label=""
                              name={`items.${idx}.productId`}
                              options={products
                                .filter(opt => {
                                  // Only show products NOT already selected in other rows
                                  const isAlreadySelected = formik.values.items.some((it: any, i: number) => 
                                    i !== idx && it.productId === opt._id
                                  );
                                  return !isAlreadySelected;
                                })
                                .map(p => ({ value: p._id, label: `${p.name} (${p.itemCode})` }))}
                              onChange={(e) => {
                                formik.handleChange(e);
                                updateLineItemDetails(idx, e.target.value);
                              }}
                            />
                          </td>
                          <td className="p-4 border-b border-gray-50">
                            <input
                              type="number"
                              {...formik.getFieldProps(`items.${idx}.weight`)}
                              className="w-full h-11 px-3 bg-gray-50/50 border border-transparent rounded-xl text-center font-bold text-gray-600 focus:bg-white focus:border-[#0f766e] transition-all outline-none"
                            />
                          </td>
                          <td className="p-4 border-b border-gray-50">
                            <input
                              type="number"
                              {...formik.getFieldProps(`items.${idx}.qty`)}
                              className="w-full h-11 px-3 bg-teal-50/30 border border-teal-100/50 rounded-xl text-center font-black text-[#0f766e] focus:bg-white focus:border-[#0f766e] transition-all outline-none"
                            />
                          </td>
                          <td className="p-4 border-b border-gray-50">
                            <input
                              type="number"
                              {...formik.getFieldProps(`items.${idx}.price`)}
                              className="w-full h-11 px-3 bg-gray-50/50 border border-transparent rounded-xl text-center font-bold text-gray-600 focus:bg-white focus:border-[#0f766e] transition-all outline-none"
                            />
                          </td>
                          <td className="p-4 border-b border-gray-50">
                            <input
                              type="number"
                              {...formik.getFieldProps(`items.${idx}.marginPercentage`)}
                              className="w-full h-11 px-3 bg-green-50/20 border border-green-100/30 rounded-xl text-center font-black text-green-600 focus:bg-white focus:border-[#0f766e] transition-all outline-none"
                            />
                          </td>
                          <td className="p-4 border-b border-gray-50 text-center">
                            <div className="flex flex-col">
                              <span className="text-[16px] font-black text-gray-800 tabular-nums leading-none">
                                {formik.values.currency === 'USD' ? '$' : '₹'}{item.sellingPrice?.toFixed(2)}
                              </span>
                              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1.5">Per Unit</span>
                            </div>
                          </td>
                          <td className="p-4 border-b border-gray-50 text-center">
                            <div className="bg-[#0f172a] px-5 py-2.5 rounded-xl inline-block shadow-lg shadow-gray-900/10">
                              <span className="text-[14px] font-black text-white tabular-nums">
                                {formik.values.currency === 'USD' ? '$' : '₹'}{item.totalSellingPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center border-b border-gray-50">
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-8 flex justify-between items-center bg-white p-6 rounded-2xl border border-dashed border-gray-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => push(emptyItem())}
                      className="flex items-center gap-2 px-6 py-3 bg-[#0f172a] text-white rounded-xl text-xs font-black uppercase tracking-[0.1em] hover:bg-black transition-all shadow-xl active:scale-95"
                    >
                      <Plus size={16} strokeWidth={3} />
                      Append Row
                    </button>
                    <div className="flex gap-10">
                      <div className="text-right">
                        <span className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Quantity</span>
                        <span className="text-xl font-bold text-gray-800">{totals.totalQty} Units</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Gross Weight</span>
                        <span className="text-xl font-bold text-gray-800">{totals.totalWeight.toFixed(2)} KG</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </FieldArray>
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Section title="Categorization">
              <div className="space-y-6">
                <FormikSelect
                  label="Status"
                  name="status"
                  options={[
                    { value: 'Pending', label: 'Pending Assessment' },
                    { value: 'Quoted', label: 'Official Quotation' },
                    { value: 'Accepted', label: 'Contract Accepted' },
                    { value: 'Rejected', label: 'Offer Rejected' },
                  ]}
                  required
                />
                <FormikTextarea label="Log / Remarks" name="remarks" placeholder="Enter internal audit logs or commercial remarks..." rows={4} />
              </div>
            </Section>

            <Section title="Commercial Summary">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full pt-2">
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center gap-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Cost</span>
                  <span className="text-2xl font-black text-[#0f172a]">₹{totals.totalItemCost.toLocaleString()}</span>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center gap-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logistics Overhead</span>
                  <span className="text-2xl font-black text-[#0f172a]">₹{totals.totalShippingCost.toLocaleString()}</span>
                </div>
                <div className="col-span-1 sm:col-span-2 p-6 bg-[#0f766e] rounded-2xl shadow-xl shadow-[#0f766e]/20 flex justify-between items-center group overflow-hidden relative">
                  <div className="relative z-10">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1 block">Projected Gross Margin</span>
                    <span className="text-3xl font-black text-white">₹{totals.totalGrossMargin.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <IndianRupee size={40} className="text-white/10 absolute -right-2 rotate-12 group-hover:scale-125 transition-transform" />
                </div>
              </div>
            </Section>
          </div>

          <div className="flex justify-end items-center gap-6 pt-10 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting || isLoading}
              className="px-12 py-5 bg-[#0f766e] text-white rounded-[1.25rem] font-black text-lg shadow-[0_20px_40px_-10px_rgba(15,118,110,0.4)] hover:shadow-[0_25px_50px_-10px_rgba(15,118,110,0.5)] hover:-translate-y-1 active:scale-95 transition-all duration-300 disabled:opacity-50 flex items-center gap-4"
            >
              {formik.isSubmitting || isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={20} strokeWidth={3} />
              )
              }
              <span>{isEditMode ? 'Update' : 'Save'}</span>
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default QuoteTrackForm;
