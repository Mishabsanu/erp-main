'use client';

import React, { useState, useEffect } from 'react';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import {
    FileText,
    Calendar,
    Trash2,
    Plus,
    Package,
    Hash,
    Layers,
    Save,
    ArrowRight,
    AlertCircle
} from 'lucide-react';
import { RunningOrder } from '@/lib/types';
import ListPageHeader from './shared/ListPageHeader';
import { getProductDropdown, getProductById } from '@/services/catalogApi';
import { getLatestRunningOrderNo } from '@/services/runningOrderApi';
import { getCustomerDropdown } from '@/services/customerApi';
import { getAvailableProducts } from '@/services/inventoryApi';
import { toast } from 'sonner';
import { Loader2, RefreshCcw } from 'lucide-react';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { Section } from '@/components/ui/Section';

interface RunningOrderFormProps {
    initialData?: Partial<RunningOrder> & { _id?: string };
    onSubmit: (values: any) => void;
    onCancel: () => void;
    isEditMode: boolean;
    isLoading?: boolean;
}

const validationSchema = Yup.object().shape({
    invoice_number: Yup.string().required('Required'),
    ordered_date: Yup.string().required('Required'),
    company_name: Yup.string().required('Required'),
    transaction_type: Yup.string().oneOf(['Sale', 'Hire', 'Contract'], 'Invalid').required('Required'),
    items: Yup.array().of(
        Yup.object().shape({
            productId: Yup.string().required('Select product'),
            quantity: Yup.number().min(1, 'Min 1').required('Req'),
        })
    ).min(1, 'Add at least one item')
});

const RunningOrderForm: React.FC<RunningOrderFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isEditMode,
    isLoading
}) => {
    const [products, setProducts] = useState<any[]>([]);
    const [availableStock, setAvailableStock] = useState<Record<string, number>>({});
    const [customers, setCustomers] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productData, customerRes, stockData] = await Promise.all([
                    getProductDropdown(),
                    getCustomerDropdown(),
                    getAvailableProducts()
                ]);
                setProducts(productData);
                if (customerRes?.success) {
                    setCustomers(customerRes.data.map((c: any) => ({ 
                        value: c.company || c.name, 
                        label: c.company || c.name 
                    })));
                }
                                
                const stockMap: Record<string, number> = {};
                stockData.forEach(item => {
                    if (item.productId) {
                        stockMap[item.productId] = item.availableQty;
                    }
                });
                setAvailableStock(stockMap);
            } catch (error) {
                toast.error('Failed to load form data');
            }
        };
        fetchData();
    }, []);

    const formik = useFormik({
        initialValues: {
            company_name: initialData?.company_name || '',
            client_name: initialData?.client_name || '',
            order_number: initialData?.order_number || '',
            invoice_number: initialData?.invoice_number || '',
            po_number: initialData?.po_number || '',
            sales_person: initialData?.sales_person || '',
            ordered_date: initialData?.ordered_date ? new Date(initialData.ordered_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            items: initialData?.items?.map((it: any) => ({
                productId: typeof it.productId === 'object' ? it.productId._id : it.productId || '',
                name: it.name || '',
                itemCode: it.itemCode || '',
                description: it.description || '',
                unit: it.unit || '',
                quantity: it.quantity || 1
            })) || [{ productId: '', name: '', itemCode: '', description: '', unit: '', quantity: 1 }],
            status: initialData?.status || 'Order Placed',
            transaction_type: initialData?.transaction_type || 'Sale',
            project_location: initialData?.project_location || '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

    // Add effect to show validation errors to user
    useEffect(() => {
        if (formik.submitCount > 0 && !formik.isValid) {
            const firstError = Object.values(formik.errors)[0];
            if (typeof firstError === 'string') {
                toast.error(`Validation Error: ${firstError}`);
            } else if (Array.isArray(formik.errors.items)) {
                toast.error('Please check the items list for errors');
            } else {
                toast.error('Please fill all required fields');
            }
        }
    }, [formik.submitCount, formik.isValid]);

    const handleProductSelect = async (index: number, productId: string) => {
        if (!productId) return;

        try {
            const product = await getProductById(productId);
            const items = [...formik.values.items];
            items[index] = {
                ...items[index],
                productId: product._id || productId,
                name: product.name,
                itemCode: product.itemCode,
                unit: product.unit
            };
            formik.setFieldValue('items', items);
        } catch (error) {
            toast.error('Failed to fetch product details');
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
            <ListPageHeader
                eyebrow="Inventory Logistics"
                title={isEditMode ? 'Modify' : 'Launch'}
                highlight="Running Order"
                description="Track your delivery status, return status and manage your orders."
                className="mb-12"
            />

            <FormikProvider value={formik}>
                <form onSubmit={formik.handleSubmit} className="space-y-10">
                                        
                    <div className="grid grid-cols-1 gap-8">
                        <Section title="Basic Information" eyebrow="Order Registry">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {isEditMode && (
                                    <FormikInput
                                        label="Order Number"
                                        name="order_number"
                                        placeholder="ORD-0000"
                                        required
                                        readOnly
                                        suffix={<Hash size={14} className="text-gray-300" />}
                                    />
                                )}
                                <FormikSelect  
                                    label="Company Name"  
                                    name="company_name"  
                                    options={customers}
                                    required
                                />
                                                               
                                <FormikInput  
                                    label="Invoice Number"  
                                    name="invoice_number"  
                                    placeholder="INV-0000"
                                    required
                                    suffix={<FileText size={14} className="text-gray-300" />}
                                />
                                <FormikInput  
                                    label="Order Date"  
                                    name="ordered_date"  
                                    type="date"
                                    required
                                />
                                <FormikInput  
                                    label="PO Number"  
                                    name="po_number"  
                                    placeholder="PO-0000"
                                    suffix={<Hash size={14} className="text-gray-300" />}
                                />
                                <FormikSelect
                                    label="Service Type"
                                    name="transaction_type"
                                    options={[
                                        { value: 'Sale', label: 'Sale' },
                                        { value: 'Hire', label: 'Hire' },
                                        { value: 'Contract', label: 'Contract' }
                                    ]}
                                    required
                                />
                                <FormikInput
                                    label="Project Location"
                                    name="project_location"
                                    placeholder="Enter project location"
                                />
                                  <FormikInput
                                    label="Sales Person"  
                                    name="sales_person"  
                                    placeholder="Enter sales person name"
                                />
                                {isEditMode && (
                                    <FormikSelect
                                        label="Order Status"
                                        name="status"
                                        options={[
                                            { value: 'Order Placed', label: 'Order Placed' },
                                            { value: 'Partially Completed', label: 'Partially Completed' },
                                            { value: 'On Hire', label: 'On Hire' },
                                            { value: 'Closed', label: 'Closed' }
                                        ]}
                                    />
                                )}
                            </div>
                        </Section>

                    </div>

                    <Section title="Order" eyebrow="Line Items" highlight="Items">
                        <FieldArray name="items">
                            {({ push, remove }) => (
                                <div className="overflow-x-auto">
                                    <table className="akod-table whitespace-nowrap border-separate border-spacing-y-0.5">
                                        <thead>
                                            <tr className="bg-[#f8f9fc] text-[11px] font-black uppercase tracking-[0.1em] text-gray-500">
                                                <th className="p-4 w-12 text-center rounded-l-xl">S.No</th>
                                                <th className="p-4 min-w-[350px] text-left">Product & Code</th>
                                                <th className="p-4 min-w-[200px] text-left">Description</th>
                                                <th className="p-4 w-28 text-center">Unit</th>
                                                <th className="p-4 w-32 text-center text-[#0f766e]">Quantity</th>
                                                <th className="p-4 w-16 text-center rounded-r-xl">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {formik.values.items.map((item, index) => (
                                                <tr key={index} className="group hover:bg-teal-50/30 transition-all duration-200">
                                                    <td className="p-4 text-center border-b border-gray-50">
                                                        <span className="text-[10px] font-black text-gray-300">#{index + 1}</span>
                                                    </td>
                                                    <td className="p-4 border-b border-gray-50">
                                                        <div className="space-y-2">
                                                            <FormikSelect
                                                                name={`items.${index}.productId`}
                                                                options={products
                                                                    .filter(p => (availableStock[p._id] > 0) || (p._id === item.productId))
                                                                    .filter(opt => {
                                                                        // Only show products NOT already selected in other rows
                                                                        const isAlreadySelected = formik.values.items.some((it: any, i: number) => 
                                                                            i !== index && it.productId === opt._id
                                                                        );
                                                                        return !isAlreadySelected;
                                                                    })
                                                                    .map(p => ({  
                                                                        value: p._id,  
                                                                        label: `${p.name} ${availableStock[p._id] !== undefined ? `(Stock: ${availableStock[p._id]})` : ''}`  
                                                                    }))}
                                                                onChange={(e) => {
                                                                    formik.handleChange(e);
                                                                    handleProductSelect(index, e.target.value);
                                                                }}
                                                            />
                                                            {item.itemCode && (
                                                                <div className="flex items-center justify-between px-2 mt-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Hash size={10} className="text-gray-400" />
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.itemCode}</span>
                                                                    </div>
                                                                    {availableStock[item.productId] !== undefined && (
                                                                        <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border
                                                                            ${availableStock[item.productId] > 0 
                                                                                ? (Number(item.quantity) > availableStock[item.productId] 
                                                                                    ? 'bg-rose-50 border-rose-200 text-rose-700' 
                                                                                    : 'bg-emerald-50 border-emerald-100 text-emerald-700') 
                                                                                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'}
                                                                        `}>
                                                                            Available: {availableStock[item.productId].toLocaleString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 border-b border-gray-50">
                                                        <textarea
                                                            name={`items.${index}.description`}
                                                            value={item.description}
                                                            onChange={formik.handleChange}
                                                            placeholder="Enter detailed specifications or long description..."
                                                            className="w-full min-h-[44px] p-3 text-xs font-medium text-gray-600 bg-white rounded-xl border border-slate-200 focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/10 outline-none transition-all italic shadow-sm resize-y"
                                                        />
                                                    </td>
                                                    <td className="p-4 border-b border-gray-50">
                                                        <div className="h-11 flex items-center justify-center text-xs font-black text-[#0f766e] uppercase tracking-widest bg-emerald-50 rounded-xl">
                                                            {item.unit || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 border-b border-gray-50">
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                name={`items.${index}.quantity`}
                                                                value={item.quantity}
                                                                onChange={formik.handleChange}
                                                                className={`w-full h-11 px-3 border rounded-xl text-center font-black transition-all outline-none
                                                                    ${Number(item.quantity) > (availableStock[item.productId] || 0) && (availableStock[item.productId] !== undefined)
                                                                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                                                                        : 'bg-white border-slate-200 text-[#0f766e] focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/10'
                                                                    }
                                                                `}
                                                            />
                                                            {Number(item.quantity) > (availableStock[item.productId] || 0) && (availableStock[item.productId] !== undefined) && (
                                                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm">Overstock</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center border-b border-gray-50">
                                                        <button
                                                            type="button"
                                                            disabled={formik.values.items.length === 1}
                                                            onClick={() => remove(index)}
                                                            className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-0"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                                                        
                                    <div className="mt-8 flex justify-between items-center bg-white p-6 rounded-2xl border border-dashed border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => push({ productId: '', name: '', itemCode: '', description: '', unit: '', quantity: 1 })}
                                            className="flex items-center gap-2 px-6 py-3 bg-[#0f172a] text-white rounded-xl text-xs font-black uppercase tracking-[0.1em] hover:bg-black transition-all shadow-lg active:scale-95"
                                        >
                                            <Plus size={16} strokeWidth={3} />
                                            Add line item
                                        </button>
                                        <div className="text-right">
                                            <span className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Qty</span>
                                            <span className="text-xl font-bold text-gray-800">
                                                {formik.values.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)} Qty
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </FieldArray>
                    </Section>

                    <div className="flex justify-end items-center gap-4 pt-10 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-8 py-3 bg-white text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-10 py-3 bg-[#0f766e] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#134e4a] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-3"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={16} strokeWidth={3} />
                            )
                            }
                            <span>{isEditMode ? 'Update Order' : 'Initialize Order'}</span>
                        </button>
                    </div>

                </form>
            </FormikProvider>
        </div>
    );
};

export default RunningOrderForm;
