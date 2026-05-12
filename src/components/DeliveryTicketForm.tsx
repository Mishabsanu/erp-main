'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { Section } from '@/components/ui/Section';
import { DeliveryTicket, PODropdownItem } from '@/lib/types';
import { getCustomers } from '@/services/customerApi';
import { GetNextDeliveryTicketNo } from '@/services/deliveryTicketApi';
import { getAvailableProducts } from '@/services/inventoryApi';
import { getRunningOrderFulfillment, getRunningOrdersDropdown } from '@/services/runningOrderApi';
import { getCustomerDropdown } from '@/services/customerApi';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { FormikPhoneInput } from './shared/FormikPhoneInput';
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

const SOURCE_OPTIONS = [
  { value: 'Store Mekeinese', label: 'Store Mekeinese' },
  { value: 'Store Birkat Al Awamer', label: 'Store Birkat Al Awamer' },
  { value: 'Factory Birkat Al Awamer', label: 'Factory Birkat Al Awamer' },
  { value: 'Akod Site', label: 'Akod Site' },
  { value: 'Other', label: 'Other' },
];

/* ---------------- VALIDATION ---------------- */
const LineItemValidationSchema = Yup.object().shape({
  productId: Yup.string().required('Product is required'),
  name: Yup.string().required('Product name is required').max(100, 'Max 100 characters'),
  itemCode: Yup.string().required('Item code is required'),
  unit: Yup.string().required('Unit is required'),
  description: Yup.string().max(80, 'Max 80 characters'),
  availableQty: Yup.number(),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .min(1, 'Min 1')
    .test('max-stock', 'Exceeds stock', function (value) {
      const { availableQty } = this.parent;
      if (availableQty === undefined || availableQty === null || availableQty === '') return true;
      return Number(value) <= Number(availableQty);
    })
    .test('max-required', 'Exceeds Qty', function (value) {
      const { requiredQty } = this.parent;
      if (requiredQty === undefined || requiredQty === null || requiredQty === '') return true;
      return Number(value) <= Number(requiredQty);
    })
    .required('Quantity is required'),
  requiredQty: Yup.number()
    .typeError('Required Quantity must be a number')
    .min(1, 'Min 1')
    .required('Required Quantity is required'),
});

const validationSchema = Yup.object().shape({
  customerId: Yup.string().required('Customer is required'),
  deliveryDate: Yup.date().nullable().required('Delivery date is required'),
  subject: Yup.string().required('Delivered From is required'),
  projectLocation: Yup.string().required('Project location is required'),
  poNo: Yup.string(),
  invoiceNo: Yup.string().required('Invoice No is required'),
  noteCategory: Yup.string().required('Note category is required'),
  vehicleNo: Yup.string().required('Vehicle number is required'),

  items: Yup.array()
    .of(LineItemValidationSchema)
    .min(1, 'At least one item is required')
    .required('At least one item is required'),

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

/* ================= COMPONENT ================= */
const DeliveryTicketForm = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode = false,
  backendErrors = {},
  isLoading = false,
}: {
  initialData?: Partial<DeliveryTicket>;
  onSubmit: (
    ticket: Partial<DeliveryTicket>,
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
  const [availableProducts, setAvailableProducts] = useState<PODropdownItem[]>(
    []
  );
  const [runningOrders, setRunningOrders] = useState<any[]>([]);
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);
  const [customers, setCustomers] = useState<{ value: string; label: string }[]>([]);
  const [fulfillmentMap, setFulfillmentMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchProductsAndCustomers = async () => {
      try {
        const productRes = await getAvailableProducts();
        if (productRes) {
          setAvailableProducts(productRes);
        }

        const roRes = await getRunningOrdersDropdown();
        if (roRes) {
          setRunningOrders(roRes.map((ro: any) => ({
            ...ro,
            label: ro.invoice_number,
            value: ro._id
          })));
        }

        const customerRes = await getCustomerDropdown();

        if (customerRes?.success) {
          setCustomers(
            customerRes.data.map((c: any) => ({ value: c._id!, label: c.company || c.name || 'Unknown' }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch products or customers:', error);
      }
    };
    fetchProductsAndCustomers();
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      customerId: initialData?.customerId || '',
      runningOrderId: initialData?.runningOrderId || '',
      customerName: initialData?.customerName || '',
      deliveryDate:
        initialData?.deliveryDate || new Date().toISOString().slice(0, 10),
      ticketType: initialData?.ticketType || 'Delivery Note',
      ticketNo: initialData?.ticketNo,
      poNo: initialData?.poNo || '',
      invoiceNo: initialData?.invoiceNo || '',
      referenceNo: initialData?.referenceNo || '',
      subject: initialData?.subject || '',
      driverName: initialData?.driverName || '',
      projectLocation: initialData?.projectLocation || '',
      noteCategory: initialData?.noteCategory || 'Sale',
      vehicleNo: initialData?.vehicleNo || '',

      items: initialData?.items?.length
        ? initialData.items.map((item: any) => ({
          productId: item.productId || item.product?._id || '', // Handle population
          name: item.name || item.product?.name || '',
          itemCode: item.itemCode || '',
          unit: item.unit || '',
          availableQty: item.availableQty || '',
          requiredQty: item.requiredQty || '',
          quantity: item.quantity || '',
          orderQty: item.orderQty || '',
          description: item.description || '', // Ensure description is mapped
        }))
        : [
          {
            productId: '',
            name: '',
            itemCode: '',
            unit: '',
            availableQty: '',
            requiredQty: '',
            quantity: '',
            orderQty: '',
            description: '',
          },
        ],
      deliveredBy: {
        deliveredByName: initialData?.deliveredBy?.deliveredByName || '',
        deliveredByMobile: initialData?.deliveredBy?.deliveredByMobile || '',
        deliveredDate: initialData?.deliveredBy?.deliveredDate
          ? new Date(initialData.deliveredBy.deliveredDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      },
      receivedBy: {
        receivedByName: initialData?.receivedBy?.receivedByName || '',
        receivedByMobile: initialData?.receivedBy?.receivedByMobile || '',
        qatarId: initialData?.receivedBy?.qatarId || '',
        receivedDate: initialData?.receivedBy?.receivedDate
          ? new Date(initialData.receivedBy.receivedDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
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

      const formData = new FormData();

      // Add simple fields
      Object.keys(values).forEach(key => {
        if (!['items', 'deliveredBy', 'receivedBy', 'customerName'].includes(key)) {
          formData.append(key, (values as any)[key]);
        }
      });

      // Add nested fields as stringified JSON
      formData.append('customerName', customerName);
      formData.append('items', JSON.stringify(values.items.map((r) => ({
        productId: r.productId,
        name: r.name,
        itemCode: r.itemCode,
        unit: r.unit,
        quantity: Number(r.quantity) || 0,
        requiredQty: Number(r.requiredQty) || 0,
        description: r.description || '',
      }))));
      formData.append('deliveredBy', JSON.stringify(values.deliveredBy));
      formData.append('receivedBy', JSON.stringify(values.receivedBy));

      // Add files
      if (signedTicketFile) {
        formData.append('signedTicket', signedTicketFile);
      }
      supportingDocsFiles.forEach(file => {
        formData.append('supportingDocs', file);
      });

      onSubmit(formData as any, { setErrors, setSubmitting });
    },
  });

  const filteredRunningOrders = useMemo(() => {
    const customer = customers.find(c => c.value === formik.values.customerId);
    if (customer) {
      return runningOrders.filter(ro => {
        const isCustomerMatch = (ro.company_name && ro.company_name === customer.label) ||
          (ro.client_name && ro.client_name === customer.label);

        // Condition: Filter out Completed status for Deliveries
        const isNotCompleted = ro.status !== 'Completed';

        return isCustomerMatch && isNotCompleted;
      });
    }
    return [];
  }, [formik.values.customerId, runningOrders, customers]);

  /* ---------------- PREVIEW STATE ---------------- */
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [isCustomSource, setIsCustomSource] = useState(false);

  // File Upload State
  const [signedTicketFile, setSignedTicketFile] = useState<File | null>(null);
  const [supportingDocsFiles, setSupportingDocsFiles] = useState<File[]>([]);
  const [isFetchingNo, setIsFetchingNo] = useState(false);


  /* ---------------- APPLY BACKEND ERRORS ---------------- */
  useEffect(() => {
    if (backendErrors) {
      Object.keys(backendErrors).forEach((key) => {
        formik.setFieldError(key, backendErrors[key]);
      });
    }
  }, [backendErrors]);

  const handleRunningOrderSelection = async (orderId: string) => {
    formik.setFieldValue('runningOrderId', orderId);
    if (!orderId) {
      setSelectedOrderItems([]);
      return;
    }

    const order = runningOrders.find((o) => o.value === orderId);
    if (order) {
      // Auto-populate related fields
      formik.setFieldValue('invoiceNo', order.invoice_number);
      formik.setFieldValue('poNo', order.po_number || '');
      formik.setFieldValue('noteCategory', order.transaction_type || 'Sale');
      if (order.project_location) {
        setIsCustomLocation(true);
        formik.setFieldValue('projectLocation', order.project_location);
      }

      // Try to link customer by name
      const customer = customers.find((c) => c.label === order.company_name);
      if (customer) {
        formik.setFieldValue('customerId', customer.value);
        formik.setFieldValue('customerName', customer.label);
      }

      // Store items for filtering the product dropdown
      const orderItems = order.items || [];
      setSelectedOrderItems(orderItems);

      // Fetch fulfillment history
      try {
        const data = await getRunningOrderFulfillment(orderId);
        const map: Record<string, number> = {};
        if (data && data.items) {
          data.items.forEach((item: any) => {
            const pid = item.productId?._id || item.productId;
            map[pid] = item.deliveredQty || 0;
          });
          setFulfillmentMap(map);

          // Auto-populate form items with remaining quantities
          const autoFilledItems = orderItems
            .map((orderItem: any) => {
              const pid = orderItem.productId?._id || orderItem.productId;
              const delivered = map[pid] || 0;
              const remaining = (orderItem.quantity || 0) - delivered;

              if (remaining <= 0) return null;

              return {
                productId: pid,
                name: orderItem.name,
                itemCode: orderItem.itemCode,
                unit: orderItem.unit,
                orderQty: orderItem.quantity,
                requiredQty: remaining,
                quantity: remaining,
                description: orderItem.description || '',
                availableQty: '' // Will be fetched via effect
              };
            })
            .filter(Boolean);

          if (autoFilledItems.length > 0) {
            formik.setFieldValue('items', autoFilledItems);
          }
        }
      } catch (err) {
        console.error("Error fetching fulfillment", err);
      }
    }
  };

  useEffect(() => {
    if (formik.values.runningOrderId && runningOrders.length > 0) {
      const order = runningOrders.find((o) => o.value === formik.values.runningOrderId);
      if (order) {
        setSelectedOrderItems(order.items || []);
      }
    }
  }, [formik.values.runningOrderId, runningOrders]);

  const handleProductSelection = (index: number, productId: string) => {
    // If we have a selected order, find the product in THAT order's items
    if (formik.values.runningOrderId) {
      const orderItem = selectedOrderItems.find((i) => (i.productId?._id || i.productId) === productId);
      if (orderItem) {
        formik.setFieldValue(`items.${index}.productId`, orderItem.productId?._id || orderItem.productId);
        formik.setFieldValue(`items.${index}.name`, orderItem.name);
        formik.setFieldValue(`items.${index}.itemCode`, orderItem.itemCode);
        formik.setFieldValue(`items.${index}.unit`, orderItem.unit);
        const delivered = fulfillmentMap[orderItem.productId?._id || orderItem.productId] || 0;
        const remaining = (orderItem.quantity || 0) - delivered;

        formik.setFieldValue(`items.${index}.orderQty`, orderItem.quantity);
        formik.setFieldValue(`items.${index}.requiredQty`, remaining > 0 ? remaining : 0);
        formik.setFieldValue(`items.${index}.quantity`, 1);

        // Also find available stock from the main product list if needed
        const inventoryProduct = availableProducts.find((p) => {
          const pId = p.productId?.toString();
          const targetId = (orderItem.productId?._id || orderItem.productId)?.toString();
          return pId && targetId && pId === targetId;
        });
        if (inventoryProduct) {
          formik.setFieldValue(`items.${index}.availableQty`, inventoryProduct.availableQty);
        }
        return;
      }
    }

    const product = availableProducts.find((p) => p._id === productId);
    if (product) {
      formik.setFieldValue(`items.${index}.productId`, product._id);
      formik.setFieldValue(`items.${index}.name`, product.name);
      formik.setFieldValue(`items.${index}.itemCode`, product.itemCode);
      formik.setFieldValue(`items.${index}.unit`, product.unit);
      formik.setFieldValue(`items.${index}.availableQty`, product.availableQty);
    }
  };

  // Removed auto-fetch on mount to prevent multi-user race conditions.
  // Next ticket number will be fetched during Preview.

  useEffect(() => {
    if (!availableProducts.length || !formik.values.items.length) return;

    formik.values.items.forEach((item, index) => {
      if (item.productId && !item.availableQty) {
        const product = availableProducts.find((p) => p._id === item.productId);

        if (product) {
          formik.setFieldValue(
            `items.${index}.availableQty`,
            product.availableQty
          );
        }
      }
    });
  }, [availableProducts]);

  const handlePreview = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length === 0) {
      // If creating new ticket, fetch the latest number right before preview
      if (!isEditMode) {
        const loadingNoToast = toast.loading('Generating Ticket Number...');
        setIsFetchingNo(true);
        try {
          const res = await GetNextDeliveryTicketNo();
          if (res?.success && res.data) {
            formik.setFieldValue('ticketNo', res.data);
            toast.dismiss(loadingNoToast);
          } else {
            toast.error('Failed to generate ticket number. Please try again.');
            toast.dismiss(loadingNoToast);
            return; // Don't proceed to preview if we couldn't get a number
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
      // Also touch nested fields if any (like items array)
      if (errors.items && Array.isArray(errors.items)) {
        formik.setFieldTouched('items', true);
      }
    }
  };

  if (isPreviewMode) {
    const DeliveryTicketPreview = require('./delivery-ticket/DeliveryTicketPreview').default;
    return (
      <DeliveryTicketPreview
        data={formik.values}
        onBack={() => setIsPreviewMode(false)}
        onConfirm={formik.submitForm}
        isSubmitting={isLoading || formik.isSubmitting}
      />
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-50 px-8 py-6 rounded-lg">
      <div className="page-header mb-12">
        <div>
          <div className="page-header-eyebrow">
            <div className="page-header-marker" />
            <span>Operational Document</span>
          </div>
          <h1 className="page-header-title">
            {isEditMode ? 'Modify' : 'Initialize'} <span className="gradient-text">Delivery Note</span>
          </h1>
          <p className="page-header-description">
            {isEditMode
              ? 'Update the details of this delivery authorization. Changes will be reflected in inventory and tracking logs.'
              : 'Initialize a new delivery record. Select the customer and items to generate an official delivery note.'}
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={(e) => { e.preventDefault(); handlePreview(); }} className="space-y-10">
          {/* 🧱 BASIC INFO */}
          <Section eyebrow="Logistics" title="Delivery" highlight="Details">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FormikSelect
                label="Company Name"
                name="customerId"
                options={customers}
                required
                onChange={(e) => {
                  formik.handleChange(e);
                  // Update customerName based on selection
                  const selectedCustomer = customers.find(
                    (c) => c.value === e.target.value
                  );
                  if (selectedCustomer) {
                    formik.setFieldValue(
                      'customerName',
                      selectedCustomer.label
                    );
                  }
                  // Reset PO selection when Company changes
                  formik.setFieldValue('runningOrderId', '');
                  formik.setFieldValue('poNo', '');
                  formik.setFieldValue('invoiceNo', '');
                  setSelectedOrderItems([]);
                }}
              />


              {(isEditMode || formik.values.ticketNo) && (
                <FormikInput
                  label="Delivery Note No"
                  name="ticketNo"
                  value={formik.values.ticketNo}
                  readOnly
                  required
                  className="font-bold text-teal-700"
                />
              )}

              <FormikInput
                label="Delivery Date"
                name="deliveryDate"
                type="date"
                required
              />

              <FormikSelect
                label="Invoice Number"
                name="runningOrderId"
                options={filteredRunningOrders}
                onChange={(e) => {
                  formik.handleChange(e);
                  handleRunningOrderSelection(e.target.value);
                }}
                required
                disabled={!formik.values.customerId}
              />

              <FormikInput label="PO Number" name="poNo" readOnly />
              <FormikInput label="Reference" name="referenceNo" />

              {!isCustomSource ? (
                <FormikSelect
                  label="Delivered From"
                  name="subject"
                  options={SOURCE_OPTIONS}
                  required
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setIsCustomSource(true);
                      formik.setFieldValue('subject', '');
                    } else {
                      formik.handleChange(e);
                    }
                  }}
                />
              ) : (
                <div className="relative">
                  <FormikInput label="Delivered From" name="subject" required />
                </div>
              )}

              {!isCustomLocation ? (
                <FormikSelect
                  label="Project Location"
                  name="projectLocation"
                  options={LOCATION_OPTIONS}
                  required
                  disabled={!!formik.values.runningOrderId}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setIsCustomLocation(true);
                      formik.setFieldValue('projectLocation', '');
                    } else {
                      formik.handleChange(e);
                    }
                  }}
                />
              ) : (
                <div className="relative">
                  <FormikInput
                    label="Project Location"
                    name="projectLocation"
                    required
                    readOnly={!!formik.values.runningOrderId}
                  />
                </div>
              )}

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
                disabled={!!formik.values.runningOrderId}
              />
              <FormikInput label="Vehicle No" name="vehicleNo" required />
              <FormikInput label="Driver Name" name="driverName" />
            </div>
          </Section>

          {/*  ITEMS TABLE */}
          <Section title="Items">
            <FieldArray name="items">
              {({ push, remove }) => (
                <div className="overflow-x-auto">
                  <table className="akod-table whitespace-nowrap">
                    <thead>
                      <tr>
                        <th className="p-2 border border-gray-200">S.No</th>
                        <th className="p-2 border border-gray-200 min-w-[350px]">
                          Item & Code <span className="text-red-500">*</span>
                        </th>
                        <th className="p-2 border border-gray-200 min-w-[100px]">
                          Required Qty <span className="text-red-500">*</span>
                        </th>
                        <th className="p-2 border border-gray-200 min-w-[100px]">
                          Delivered Qty <span className="text-red-500">*</span>
                        </th>
                        <th className="p-2 border border-gray-200 min-w-[400px]">
                          Remarks
                        </th>
                        <th className="p-2 border border-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formik.values.items.map((row: any, idx: number) => {
                        const item = formik.values.items[idx];
                        const availableQty = item.availableQty ?? '';

                        return (
                          <tr key={idx}>
                            <td className="p-2 text-center border border-gray-200">
                              {idx + 1}
                            </td>

                            <td className="p-2 border border-gray-200">
                              <div className="space-y-1.5">
                                <FormikSelect
                                  name={`items.${idx}.productId`}
                                  options={
                                    (formik.values.runningOrderId && selectedOrderItems.length > 0
                                      ? selectedOrderItems.map(p => ({
                                        value: p.productId?._id || p.productId,
                                        label: `${p.name}`
                                      }))
                                      : availableProducts.map((p) => ({
                                        value: p._id!,
                                        label: p.name,
                                      }))
                                    ).filter(opt => {
                                      // Only show products NOT already selected in other rows
                                      const isAlreadySelected = formik.values.items.some((it: any, i: number) => 
                                        i !== idx && it.productId === opt.value
                                      );
                                      return !isAlreadySelected;
                                    })
                                  }
                                  onChange={(e) => {
                                    formik.handleChange(e);
                                    handleProductSelection(idx, e.target.value);
                                  }}
                                />
                                {item.itemCode && (
                                  <div className="text-[10px] font-medium text-gray-500 uppercase tracking-tight pl-1">
                                    Code: {item.itemCode}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-2 border border-gray-200 align-top">
                              <div className="flex flex-col gap-1.5">
                                <FormikInput
                                  label=""
                                  name={`items.${idx}.requiredQty`}
                                  type="number"
                                  readOnly
                                  className="text-center font-bold bg-blue-50/50 border-blue-200 text-blue-700"
                                />
                                {item.productId && (
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <span className={`text-[10px] font-black px-1.5 rounded border uppercase tracking-tighter whitespace-nowrap ${fulfillmentMap[item.productId] ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                      Prev Delivered: {fulfillmentMap[item.productId] || 0}
                                    </span>
                                    <span className="text-[10px] font-black px-1.5 rounded border bg-slate-50 text-slate-500 border-slate-200 uppercase tracking-tighter whitespace-nowrap">
                                      Total Order: {item.orderQty || 0}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-2 border border-gray-200 align-top">
                              <div className="flex flex-col gap-1.5">
                                {/* Quantity Input */}
                                <FormikInput
                                  label=""
                                  name={`items.${idx}.quantity`}
                                  type="number"
                                  min={1}
                                  max={availableQty}
                                />

                                {/* Available Qty Badge */}
                                {availableQty !== '' && (
                                  <div className="flex justify-start mt-1 gap-1">
                                    <span className="text-[10px] font-black px-1.5 rounded border bg-teal-50 text-teal-600 border-teal-100 uppercase tracking-tighter whitespace-nowrap">
                                      {item.unit}
                                    </span>
                                    <span className={`text-[10px] font-medium px-2 rounded border ${availableQty > 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                      Stock: {availableQty}
                                    </span>
                                  </div>
                                )}
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
                                className="text-teal-700 hover:text-teal-900 transition"
                              >
                                <Trash2 className="w-4 h-4 inline-block" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {formik.values.items.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-4 text-center text-gray-500"
                          >
                            No items added
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="flex flex-col items-start mt-4">
                    <button
                      type="button"
                      disabled={formik.values.items.length >= 15}
                      onClick={() => {
                        if (formik.values.items.length >= 15) return;
                        push({
                          productId: '',
                          name: '',
                          unit: '',
                          description: '',
                          quantity: 0,
                        });
                      }}
                      className={`px-4 py-2 text-white rounded-lg transition ${formik.values.items.length >= 15
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-sky-600 hover:bg-sky-700'
                        }`}
                    >
                      Add Item
                    </button>
                    {formik.values.items.length >= 15 && (
                      <span className="text-sm text-gray-500 italic mt-2">
                        Cannot add more than 15 items per ticket for single-page printing.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </FieldArray>
          </Section>

          {/*  DELIVERY INFO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Section title="Delivery Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormikSelect
                  label="Delivered By"
                  name="deliveredBy.deliveredByName"
                  options={STAFF_LIST.map(s => ({ value: s.name, label: s.name }))}
                  onChange={(e) => {
                    formik.handleChange(e);
                    const staff = STAFF_LIST.find(s => s.name === e.target.value);
                    if (staff) {
                      // Only prefix if it hasn't already been prefixed (though STAFF_LIST is raw numbers)
                      const phone = staff.phone.startsWith('+') ? staff.phone : `+974${staff.phone}`;
                      formik.setFieldValue('deliveredBy.deliveredByMobile', phone);
                    }
                  }}
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
                <FormikInput
                  label="Received By"
                  name="receivedBy.receivedByName"
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



          {/* Buttons */}
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
              Preview Ticket
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default DeliveryTicketForm;
