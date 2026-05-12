'use client';

import formatDateToYYYYMMDD from '@/app/utils/formatDateToYYYYMMDD';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { Section } from '@/components/ui/Section';
import { DeliveryTicket, ReturnTicket } from '@/lib/types';
import { getCustomerDropdown } from '@/services/customerApi';
import {
  getDeliveryTicketByPo,
  GetNextReturnTicketNo,
  getPODropdown,
} from '@/services/returnTicketApi';
import { getRunningOrderById, getRunningOrdersDropdown } from '@/services/runningOrderApi';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import { FilePlus, Trash2, Save, ChevronLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import * as Yup from 'yup';
import { FormikPhoneInput } from './shared/FormikPhoneInput';
import ReturnTicketPreview from './return-ticket/ReturnTicketPreview';
import { toast } from 'sonner';

const STAFF_LIST = [
  { name: 'MANSOOR', phone: '70814261' },
  { name: 'RASEEM', phone: '70814262' },
  { name: 'MUSTHAFA', phone: '70814263' },
  { name: 'THASHNEEB', phone: '70814264' },
  { name: 'BASIL', phone: '31214455' },
  { name: 'KARK', phone: '66069200' },
  { name: 'SHIFAN', phone: '71513931' },
];

const LOCATION_OPTIONS = [
  { value: 'Client Yard', label: 'Client Yard' },
  { value: 'Client Site', label: 'Client Site' },
  { value: 'Company Yard', label: 'Company Yard' },
  { value: 'Project Laydown Area', label: 'Project Laydown Area' },
  { value: 'Fabrication Yard', label: 'Fabrication Yard' },
  { value: 'Other', label: 'Manual Entry' },
];

const LineItemValidationSchema = Yup.object().shape({
  productId: Yup.string().required('Product is required'),
  name: Yup.string().required('Product name is required'),
  unit: Yup.string().required('Unit is required'),
  description: Yup.string().max(80, 'Max 80 characters'),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .min(0, 'Min 0')
    .required('Quantity is required'),
  returnQty: Yup.number()
    .typeError('Return quantity must be a number')
    .min(0, 'Cannot be negative')
    .test(
      'is-less-than-available',
      'Return quantity cannot exceed balance quantity',
      function (value) {
        const { quantity, totalReturnedQty } = this.parent;
        const balanceQty = (quantity || 0) - (totalReturnedQty || 0);
        return value !== undefined && value !== null && value <= balanceQty;
      }
    ),
});

const validationSchema = Yup.object().shape({
  returnDate: Yup.string().required('Return date is required'),
  subject: Yup.string().required('Subject is required'),
  projectLocation: Yup.string().required('Project location is required'),
  noteCategory: Yup.string().required('Note category is required'),
  vehicleNo: Yup.string(),

  items: Yup.array()
    .of(LineItemValidationSchema)
    .min(1, 'At least one item is required'),

  deliveredBy: Yup.object().shape({
    deliveredByName: Yup.string(),
    deliveredByMobile: Yup.string()
      .matches(/^\+?\d{8,15}$/, 'Invalid mobile number'),
    deliveredDate: Yup.date().nullable().required('Delivered date is required'),
  }),
  receivedBy: Yup.object().shape({
    receivedByName: Yup.string().required('Received by name is required'),
    receivedByMobile: Yup.string()
      .matches(/^\+?\d{8,15}$/, 'Invalid mobile number')
      .required('Received by mobile is required'),
    qatarId: Yup.string(),
    receivedDate: Yup.date().nullable().required('Received date is required'),
  }),
});

const ReturnTicketForm = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode = false,
  backendErrors = {},
  isLoading = false,
}: {
  initialData?: Partial<ReturnTicket>;
  onSubmit: (
    ticket: Partial<ReturnTicket>,
    formikHelpers: {
      setErrors: (errors: any) => void;
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  backendErrors?: { [key: string]: string };
  isLoading?: boolean;
}) => {
  const [customers, setCustomers] = useState<
    { value: string; label: string }[]
  >([]);
  const [purchaseOrders, setPurchaseOrders] = useState<
    { value: string; label: string }[]
  >([]);
  const [runningOrders, setRunningOrders] = useState<any[]>([]);
  const [isPoSelected, setIsPoSelected] = useState(false);
  const [isFetchingNo, setIsFetchingNo] = useState(false);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [customerRes, roRes] = await Promise.all([
          getCustomerDropdown(),
          getRunningOrdersDropdown(),
        ]);

        if (customerRes?.success) {
          setCustomers(
            customerRes.data.map((c: any) => ({ value: c._id!, label: c.company || c.name || 'Unknown' }))
          );
        }

        if (roRes) {
          setRunningOrders(roRes.map((ro: any) => ({
            ...ro,
            label: ro.invoice_number || ro.order_number,
            value: ro._id
          })));

          setPurchaseOrders(roRes.map((ro: any) => ({ value: ro.po_number, label: ro.po_number })));
        }
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      }
    };
    fetchDropdownData();
  }, []);


  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      customerId: initialData?.customerId || '',
      runningOrderId: initialData?.runningOrderId || '',
      customerName: initialData?.customerName || '',
      parentTicketNo: initialData?.parentTicketNo,
      returnDate: formatDateToYYYYMMDD(initialData?.returnDate || new Date()),
      ticketType: initialData?.ticketType || 'Return Note',
      ticketNo: initialData?.ticketNo,
      poNo: initialData?.poNo || '',
      invoiceNo: initialData?.invoiceNo || '',
      referenceNo: initialData?.referenceNo || '',
      subject: initialData?.subject || '',
      projectLocation: initialData?.projectLocation || '',
      noteCategory: initialData?.noteCategory || 'Sale',
      vehicleNo: initialData?.vehicleNo || '',
      items:
        initialData?.items && initialData.items.length > 0
          ? initialData.items.map((item) => ({
            ...item,
            returnQty: item.returnQty || 0,
          }))
          : [
            {
              productId: '',
              name: '',
              unit: '',
              description: '',
              quantity: 0,
              totalReturnedQty: 0,
              returnQty: 0,
            },
          ],
      deliveredBy: {
        deliveredByName: initialData?.deliveredBy?.deliveredByName || '',
        deliveredByMobile: initialData?.deliveredBy?.deliveredByMobile || '',
        deliveredDate: formatDateToYYYYMMDD(
          initialData?.deliveredBy?.deliveredDate || new Date()
        ),
      },
      receivedBy: {
        receivedByName: initialData?.receivedBy?.receivedByName || '',
        receivedByMobile: initialData?.receivedBy?.receivedByMobile || '',
        qatarId: initialData?.receivedBy?.qatarId || '',
        receivedDate: formatDateToYYYYMMDD(
          initialData?.receivedBy?.receivedDate || new Date()
        ),
      },
    },
    validationSchema,
    onSubmit: (values, { setErrors, setSubmitting }) => {
      const selectedCustomer = customers.find(
        (c) => c.value === values.customerId
      );
      const customerName = selectedCustomer
        ? selectedCustomer.label
        : values.customerName;

      const payload: Partial<ReturnTicket> = {
        ...values,
        returnDate: new Date(values.returnDate).toISOString(),
        deliveredBy: {
          ...values.deliveredBy,
          deliveredDate: new Date(
            values.deliveredBy.deliveredDate
          ).toISOString(),
        },
        receivedBy: {
          ...values.receivedBy,
          receivedDate: new Date(values.receivedBy.receivedDate).toISOString(),
        },
        customerName: customerName,
        items: values.items.map((r: any) => ({
          productId: r.productId,
          name: r.name,
          itemCode: r.itemCode,
          unit: r.unit,
          description: r.description,
          returnQty: Number(r.returnQty) || 0,
          quantity: Number(r.quantity) || 0,
        })),
      };
      onSubmit(payload, { setErrors, setSubmitting });
    },
  });

  const filteredRunningOrders = useMemo(() => {
    if (!formik.values.customerId) return runningOrders;

    const customer = customers.find(c => c.value === formik.values.customerId);
    if (customer) {
      return runningOrders.filter(ro => {
        // Condition 1: Must match Company Name
        const isCustomerMatch = (ro.company_name && ro.company_name === customer.label) ||
          (ro.client_name && ro.client_name === customer.label);

        // Condition 2: Filter out Completed status for Returns
        const isNotCompleted = ro.status !== 'Completed';

        return isCustomerMatch && isNotCompleted;
      });
    }
    return runningOrders;
  }, [formik.values.customerId, runningOrders, customers]);

  /* ---------------- PREVIEW STATE ---------------- */
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handlePreview = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length === 0) {
      if (!isEditMode && !formik.values.ticketNo) {
        const loadingNoToast = toast.loading('Generating Ticket Number...');
        setIsFetchingNo(true);
        try {
          const res = await GetNextReturnTicketNo();
          if (res?.success && res.data) {
            formik.setFieldValue('ticketNo', res.data);
            toast.dismiss(loadingNoToast);
          } else {
            toast.error('Failed to generate ticket number. Please try again.');
            toast.dismiss(loadingNoToast);
            return;
          }
        } catch (error) {
          console.error('Failed to fetch ticket number', error);
          toast.error('Network error while generating ticket number.');
          toast.dismiss(loadingNoToast);
          return;
        } finally {
          setIsFetchingNo(false);
        }
      }
      setIsPreviewMode(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      formik.setTouched(
        Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
      if (errors.items && Array.isArray(errors.items)) {
        formik.setFieldTouched('items', true);
      }
    }
  };

  useEffect(() => {
    const autoFillFromPO = async () => {
      // Define a base empty/default state for the form
      const baseEmptyFormState = {
        customerId: formik.values.customerId || '',
        customerName: formik.values.customerName || '',
        runningOrderId: formik.values.runningOrderId || '',
        returnDate: new Date().toISOString().slice(0, 10), // Default to today
        reason: '',
        ticketType: 'Return Note',
        ticketNo: formik.values.ticketNo || '',
        poNo: formik.values.poNo || '',
        invoiceNo: formik.values.invoiceNo || '',
        referenceNo: '',
        subject: formik.values.subject || '',
        projectLocation: formik.values.projectLocation || '',
        noteCategory: formik.values.noteCategory || '',
        vehicleNo: '',
        items: [
          {
            productId: '',
            name: '',
            itemCode: '',
            unit: '',
            description: '',
            quantity: 0,
            totalReturnedQty: 0,
            returnQty: 0,
          },
        ],
        deliveredBy: {
          deliveredByName: '',
          deliveredByMobile: '',
          deliveredDate: new Date().toISOString().slice(0, 10),
        },
        receivedBy: {
          receivedByName: '',
          receivedByMobile: '',
          qatarId: '',
          receivedDate: new Date().toISOString().slice(0, 10),
        },
      };

      if (formik.values.poNo) {
        // PO is selected: fetch and populate
        try {
          const deliveryTicket: any = await getDeliveryTicketByPo(formik.values.poNo);

          if (deliveryTicket) {
            // EDIT MODE: Merge stats only, do NOT reset form
            if (isEditMode && formik.values.poNo === initialData?.poNo) {
              const updatedItems = formik.values.items.map((currentItem: any) => {
                const poItem = deliveryTicket.items.find(
                  (i: any) => i.itemCode === currentItem.itemCode
                );
                if (!poItem) return currentItem;

                // Calculate Previously Returned (Total - Current Saved Return)
                const initialItem = initialData?.items?.find(
                  (i) => i.itemCode === currentItem.itemCode
                );
                const thisTicketInitialReturn = Number(initialItem?.returnQty) || 0;
                const totalReturnedSoFar = Number(poItem.returnedQty) || 0;
                const previouslyReturned = Math.max(
                  0,
                  totalReturnedSoFar - thisTicketInitialReturn
                );

                return {
                  ...currentItem,
                  quantity: Number(poItem.quantity) || 0, // Update Delivered Qty
                  totalReturnedQty: previouslyReturned, // Update Previously Returned
                };
              });

              formik.setFieldValue('items', updatedItems);
              setIsPoSelected(true);
              return;
            }

            // NEW MODE: Full Auto-fill
            const mappedItems = (deliveryTicket.items || []).map((item: any) => {
              const deliveredQty = Number(item.quantity) || 0;
              const returnedQty = Number(item.returnedQty) || 0;
              const availableQty = Math.max(deliveredQty - returnedQty, 0);

              return {
                productId: item.productId || item.product?._id || '',
                name: item.name || item.product?.name || '',
                itemCode: item.itemCode || item.product?.itemCode || '',
                unit: item.unit || item.product?.unit || '',
                description: '',
                quantity: deliveredQty,
                totalReturnedQty: returnedQty,
                returnQty: availableQty,
              };
            });

            formik.setValues({
              ...baseEmptyFormState,
              poNo: formik.values.poNo,
              customerId: deliveryTicket.customerId || formik.values.customerId,
              customerName: deliveryTicket.customerName || formik.values.customerName,
              parentTicketNo: deliveryTicket.ticketNo,
              subject: formik.values.subject,
              projectLocation: formik.values.projectLocation,
              noteCategory: deliveryTicket.noteCategory || formik.values.noteCategory,
              vehicleNo: deliveryTicket.vehicleNo || formik.values.vehicleNo,
              invoiceNo: deliveryTicket.invoiceNo || formik.values.invoiceNo,
              referenceNo: deliveryTicket.referenceNo || formik.values.referenceNo,
              items: mappedItems.length > 0 ? mappedItems : baseEmptyFormState.items,
              reason: '',
            } as any);
            setIsPoSelected(true);
          }
        } catch (error) {
          console.error('Failed to fetch delivery ticket details:', error);
          setIsPoSelected(false);
        }
      } else if (!isEditMode) {
        // PO is deselected and not in edit mode: reset to empty form state
        // formik.setValues(baseEmptyFormState as any);
        setIsPoSelected(false);
      }
    };
    autoFillFromPO();
  }, [formik.values.poNo, formik.setValues]);

  useEffect(() => {
    if (backendErrors) {
      Object.keys(backendErrors).forEach((key) => {
        formik.setFieldError(key, backendErrors[key]);
      });
    }
  }, [backendErrors]);


  if (isPreviewMode) {
    return (
      <ReturnTicketPreview
        data={formik.values}
        onBack={() => setIsPreviewMode(false)}
        onConfirm={formik.submitForm}
        isSubmitting={isLoading || formik.isSubmitting}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      <div className="page-header mb-12">
        <div>
          <div className="page-header-eyebrow">
            <div className="page-header-marker" />
            <span>Logistics Management</span>
          </div>
          <h1 className="page-header-title">
            {isEditMode ? 'Modify' : 'Initialize'} <span className="gradient-text">Return Ticket</span>
          </h1>
          <p className="page-header-description">
            {isEditMode
              ? 'Update the details of this return authorization. Ensure the returned quantities are verified against the original delivery.'
              : 'Initialize a new return process. Select the original PO to auto-fill delivered quantities and track returns.'}
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10">
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 1. SELECT COMPANY FIRST */}
              <FormikSelect
                label="Company Name"
                name="customerId"
                options={customers}
                required
                onChange={(e) => {
                  formik.handleChange(e);
                  const selected = customers.find(c => c.value === e.target.value);
                  if (selected) {
                    formik.setFieldValue('customerName', selected.label);
                  }
                  // RESET Invoice selection when Company changes
                  formik.setFieldValue('runningOrderId', '');
                  formik.setFieldValue('poNo', '');
                  formik.setFieldValue('invoiceNo', '');
                  setIsPoSelected(false);
                }}
              />

              {/* 2. SELECT ORDER (Filtered by Company) */}
              <FormikSelect
                label="Invoice Number"
                name="runningOrderId"
                options={formik.values.customerId ? filteredRunningOrders : []}
                disabled={!formik.values.customerId}
                required
                onChange={async (e) => {
                  formik.handleChange(e);
                  const selected = runningOrders.find(ro => ro.value === e.target.value);
                  if (selected) {
                    // Populate basic fields immediately
                    formik.setFieldValue('poNo', selected.po_number || '');
                    formik.setFieldValue('invoiceNo', selected.invoice_number);
                    formik.setFieldValue('noteCategory', selected.transaction_type || 'Sale');

                    // This poNo update will trigger the autoFillFromPO useEffect for products
                    setIsPoSelected(true);
                  } else {
                    setIsPoSelected(false);
                  }
                }}
              />

              <FormikInput label="PO Number" name="poNo" readOnly />

              <FormikInput
                label="Return Date"
                name='returnDate'
                type="date"
                required
              />

              {(isEditMode || formik.values.ticketNo) && (
                <FormikInput
                  label="Ticket No"
                  name="ticketNo"
                  value={formik.values.ticketNo}
                  readOnly
                  required
                  className="font-bold text-teal-700"
                />
              )}

              <FormikInput
                label="Reference"
                name="referenceNo"
                disabled={isPoSelected}
              />
              <FormikSelect
                label="Delivery To"
                name="subject"
                options={LOCATION_OPTIONS}
                required
              />
              <FormikInput
                label="Project Location"
                name="projectLocation"
                required
              />
              <FormikSelect
                label="Service Type"
                name="noteCategory"
                options={[
                  { value: 'Sale', label: 'Sale' },
                  { value: 'Hire', label: 'Hire' },
                  { value: 'Off Hire', label: 'Off Hire' },
                  { value: 'Contract', label: 'Contract' },
                ]}
                required
                disabled={isPoSelected}
              />
              <FormikInput
                label="Vehicle No"
                name="vehicleNo"
                disabled={isPoSelected}
              />
              <FormikInput
                label="Driver Name"
                name="driverName"
              />
            </div>
          </Section>

          <Section title="Items">
            <FieldArray name="items">
              {({ push, remove }) => (
                <div className="overflow-x-auto">
                  <table className="akod-table whitespace-nowrap">
                    <thead>
                      <tr>
                        <th className="p-2 border border-gray-200">S.No</th>
                        <th className="p-2 border border-gray-200 min-w-[350px]">Item & Code</th>
                        <th className="p-2 border border-gray-200 min-w-[100px]">Delivered Qty</th>
                        <th className="p-2 border border-gray-200 min-w-[80px] font-black text-teal-800 text-center">Return Qty</th>
                        <th className="p-2 border border-gray-200 min-w-[400px]">Remarks</th>
                        <th className="p-2 border border-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formik.values.items.map((row: any, idx: number) => {
                        const deliveredQty = Number(row.quantity) || 0;
                        const previouslyReturned = Number(row.totalReturnedQty) || 0;
                        const balanceAvailable = Math.max(0, deliveredQty - previouslyReturned);

                        return (
                          <tr key={idx}>
                            <td className="p-2 text-center border border-gray-200 text-xs text-gray-500 font-medium">
                              {idx + 1}
                            </td>
                            <td className="p-2 border border-gray-200">
                              <div className="space-y-1">
                                <FormikInput
                                  label=""
                                  name={`items.${idx}.name`}
                                  readOnly
                                  className="font-bold border-none bg-transparent h-auto py-0 shadow-none mb-0 text-sm"
                                />
                                {row.itemCode && (
                                  <div className="text-[10px] font-medium text-gray-500 uppercase tracking-tight pl-1">
                                    Code: {row.itemCode}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-2 border border-gray-200">
                              <div className="flex flex-col">
                                <FormikInput
                                  label=""
                                  name={`items.${idx}.quantity`}
                                  type="number"
                                  readOnly
                                  className="text-center font-bold bg-gray-50"
                                />
                                <div className="flex justify-center mt-1 gap-2">
                                  <span className="text-[9px] font-black px-1.5 rounded border bg-teal-50 text-teal-600 border-teal-100 uppercase tracking-tighter whitespace-nowrap">
                                    {row.unit}
                                  </span>
                                  <span className="text-[9px] font-black px-1.5 rounded border bg-slate-50 text-slate-500 border-slate-200 uppercase tracking-tighter whitespace-nowrap">
                                    prev: {previouslyReturned}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 border border-gray-300 bg-teal-50/20">
                              <div className="flex flex-col">
                                <FormikInput
                                  label=""
                                  name={`items.${idx}.returnQty`}
                                  type="number"
                                  min={0}
                                  className="text-center font-black text-teal-800 border-teal-200 focus:border-teal-500"
                                />
                                <div className="flex justify-center mt-1">
                                  <span className={`text-[9px] font-black px-1.5 rounded border uppercase tracking-tighter whitespace-nowrap ${balanceAvailable > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    Balance to Return: {balanceAvailable}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 border border-gray-200">
                              <div className="space-y-1">
                                <FormikTextarea
                                  label=""
                                  name={`items.${idx}.description`}
                                  placeholder="Add manual description..."
                                  rows={2}
                                  maxLength={80}
                                  wrapperClassName="mb-0"
                                />
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tight pl-1">Max 80 Characters</div>
                              </div>
                            </td>
                            <td className="p-2 text-center border border-gray-200">
                              <button
                                type="button"
                                onClick={() => remove(idx)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Remove Item"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {formik.values.items.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-4 text-center text-gray-500"
                          >
                            No items added
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </FieldArray>
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Section title="Delivery Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormikInput
                  label="Delivered By"
                  name="deliveredBy.deliveredByName"
                />
                <FormikPhoneInput
                  label="Delivered By Mobile"
                  name="deliveredBy.deliveredByMobile"
                />
                <FormikInput
                  label="Delivered Date"
                  name="deliveredBy.deliveredDate"
                  type="date"
                  required
                />
              </div>
            </Section>

            <Section title="Receiving Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormikSelect
                  label="Received By"
                  name="receivedBy.receivedByName"
                  options={STAFF_LIST.map(s => ({ value: s.name, label: s.name }))}
                  onChange={(e) => {
                    formik.handleChange(e);
                    const staff = STAFF_LIST.find(s => s.name === e.target.value);
                    if (staff) {
                      const phone = staff.phone.startsWith('+') ? staff.phone : `+974${staff.phone}`;
                      formik.setFieldValue('receivedBy.receivedByMobile', phone);
                    }
                  }}
                  required
                />
                <FormikPhoneInput
                  label="Received By Mobile"
                  name="receivedBy.receivedByMobile"
                  required
                />
                <FormikInput
                  label="Received Date"
                  name="receivedBy.receivedDate"
                  type="date"
                  required
                />
                <FormikInput label="Qatar ID" name="receivedBy.qatarId" />
              </div>
            </Section>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 bg-white text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePreview}
              disabled={isLoading || formik.isSubmitting}
              className="px-10 py-3 bg-sky-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              Preview Return
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default ReturnTicketForm;
