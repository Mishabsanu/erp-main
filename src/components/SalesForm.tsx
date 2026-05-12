'use client';

import { FollowUpEntry, Sale } from '@/lib/types';
import { getLastEnquiries, getNextTicketNo } from '@/services/salesApi';
import { FormikProvider, useFormik } from 'formik';
import { 
  ClipboardList, 
  Edit3, 
  UserPlus, 
  Upload, 
  Trash2, 
  Save, 
  FileText,
  User,
  MapPin,
  Mail,
  Smartphone,
  Briefcase
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as Yup from 'yup';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikPhoneInput } from '@/components/shared/FormikPhoneInput';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { getFileUrl } from '@/app/utils/fileUtils';

const toISODate = (value?: string) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [dd, mm, yyyy] = value.split('-');
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
};

const SaleValidationSchema = Yup.object({
  companyName: Yup.string().trim().required('Company name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  contactPersonMobile: Yup.string()
    .matches(/^\+?[1-9]\d{6,14}$/, 'Enter valid mobile number')
    .required('Mobile number is required'),
  contactThrough: Yup.string()
    .oneOf(['Email', 'Phone', 'WhatsApp', 'Both', 'Other'])
    .required(),
  referenceNo: Yup.string().trim().optional(),
  position: Yup.string().trim().required('Position is required'),
  name: Yup.string().trim().required('Name is required'),
  location: Yup.string().trim().required('Location is required'),
  date: Yup.string().required('Date is required'),
  followUpDate: Yup.string().optional(),
  remarks: Yup.string().optional(),
  businessType: Yup.string().required('Business type is required'),
  contactedBy: Yup.string().required('Contacted by is required'),
  status: Yup.string().required('Status is required'),
});

interface SalesFormProps {
  initialData?: Sale;
  onSubmit?: (salesData: FormData) => Promise<void>;
  onCancel: () => void;
  isEditMode: boolean;
  isLoading: boolean;
}

const SalesForm: React.FC<SalesFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode,
  isLoading,
}) => {
  const [lastEnquiries, setLastEnquiries] = useState<Sale[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [removedAttachments, setRemovedAttachments] = useState<string[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const formik = useFormik({
    initialValues: {
      ticketNo: initialData?.ticketNo || '',
      companyName: initialData?.companyName || '',
      position: initialData?.position || '',
      email: initialData?.email || '',
      contactPersonMobile: initialData?.contactPersonMobile || '',
      contactThrough: initialData?.contactThrough || 'Other',
      referenceNo: initialData?.referenceNo || '',
      name: initialData?.name || '',
      location: initialData?.location || '',
      date: toISODate(initialData?.date) || today,
      followUpDate: toISODate(initialData?.nextFollowUpDate) || '',
      remarks: initialData?.remarks || '',
      businessType: initialData?.businessType || '',
      contactedBy: initialData?.contactedBy || '',
      status: initialData?.status || 'New Lead',
      attachments: initialData?.attachments || [],
      attachmentPreview:
        initialData?.attachments?.map((url) => ({
          name: url.split('/').pop() || 'attachment',
          url,
          isNew: false,
        })) || [],
    },
    validationSchema: SaleValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (!onSubmit) return;
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (key !== 'attachments' && key !== 'attachmentPreview' && key !== 'removed_op_attachments') {
            formData.append(key, value as string);
          }
        });
        if (Array.isArray(values.attachments)) {
          values.attachments.forEach((file) => {
            if (typeof file !== 'string') formData.append('attachments', file);
          });
        }
        if (removedAttachments.length > 0) {
          formData.append('removed_op_attachments', JSON.stringify(removedAttachments));
        }
        await onSubmit(formData);
      } catch (error) {
        toast.error('Failed to submit form.');
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    const fetchTicket = async () => {
      if (!isEditMode) {
        try {
          const nextNo = await getNextTicketNo();
          formik.setFieldValue('ticketNo', nextNo);
        } catch (err) {
          toast.error('Failed to fetch ticket number.');
        }
      }
    };
    fetchTicket();
  }, [isEditMode]);

  useEffect(() => {
    const fetchLastEnquiries = async () => {
      if (isEditMode) return;
      const searchKey =
        formik.values.companyName ||
        formik.values.name ||
        formik.values.contactPersonMobile;

      if (!searchKey || searchKey.length < 3) return;
      try {
        setLoadingEnquiries(true);
        const response = await getLastEnquiries(searchKey);
        setLastEnquiries(response || []);
      } catch (err) {
        toast.error('Failed to fetch last enquiries.');
        setLastEnquiries([]);
      } finally {
        setLoadingEnquiries(false);
      }
    };

    const timer = setTimeout(fetchLastEnquiries, 600);
    return () => clearTimeout(timer);
  }, [
    isEditMode,
    formik.values.companyName,
    formik.values.name,
    formik.values.contactPersonMobile,
  ]);

  return (
    <FormikProvider value={formik}>
      <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
        
        {/* HEADER AREA */}
        <div className="max-w-full mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#0f766e]/10 rounded-[1.5rem] flex items-center justify-center text-[#0f766e]">
              <UserPlus size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
                {isEditMode ? 'Modify' : 'Register'} <span className="text-[#0f766e]">Enquiry</span>
              </h2>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                Business Development &bull; Lead Registry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => formik.handleSubmit()}
              disabled={formik.isSubmitting || isLoading}
              className="px-8 py-3 bg-[#0f766e] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-900/20 hover:bg-[#134e4a] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {formik.isSubmitting || isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="max-w-full mx-auto space-y-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: INFORMATION FIELDS */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* CLIENT INFORMATION */}
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-10">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-4">
                  <div className="w-1.5 h-7 bg-[#0f766e] rounded-full" />
                  Client Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <FormikInput
                    label="Company Name"
                    name="companyName"
                    placeholder="e.g. Acme Corporation"
                    required
                  />
                  <FormikInput
                    label="Contact Person"
                    name="name"
                    placeholder="e.g. John Doe"
                    required
                  />
                  <FormikInput
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="e.g. john.doe@example.com"
                    required
                  />
                  <FormikInput
                    label="Position / Designation"
                    name="position"
                    placeholder="e.g. Purchase Manager"
                    required
                  />
                  <FormikPhoneInput
                    label="Mobile Number"
                    name="contactPersonMobile"
                    required
                  />
                  <FormikInput
                    label="Location"
                    name="location"
                    placeholder="e.g. Mumbai"
                    required
                  />
                  <FormikInput
                    label="Business Type"
                    name="businessType"
                    placeholder="e.g. Scaffolding, Construction"
                    required
                  />
                </div>
              </div>

              {/* ENQUIRY DETAILS */}
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-10">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-4">
                  <div className="w-1.5 h-7 bg-[#0f766e] rounded-full" />
                  Enquiry Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <FormikInput
                    label="Ticket No"
                    name="ticketNo"
                    readOnly
                    required
                  />
                  <FormikInput
                    label="Enquiry Date"
                    name="date"
                    type="date"
                    required
                  />
                  <FormikSelect
                    label="Enquiry Status"
                    name="status"
                    options={[
                      { value: 'New Lead', label: 'New Lead' },
                      { value: 'Call Required', label: 'Call Required' },
                      { value: 'Contacted', label: 'Contacted' },
                      { value: 'Follow-Up', label: 'Follow-Up' },
                      { value: 'Quotation Sent', label: 'Quotation Sent' },
                      { value: 'Negotiation', label: 'Negotiation' },
                      { value: 'Interested', label: 'Interested' },
                      { value: 'Not Interested', label: 'Not Interested' },
                      { value: 'On Hold', label: 'On Hold' },
                      { value: 'PO Received', label: 'PO Received' },
                      { value: 'Payment Pending', label: 'Payment Pending' },
                      { value: 'Processing', label: 'Processing' },
                      { value: 'Shipped', label: 'Shipped' },
                      { value: 'Delivered', label: 'Delivered' },
                    ]}
                    required
                  />
                  <FormikSelect
                    label="Contact Method"
                    name="contactThrough"
                    options={[
                      { value: 'Email', label: 'Email' },
                      { value: 'Phone', label: 'Phone' },
                      { value: 'WhatsApp', label: 'WhatsApp' },
                      { value: 'Both', label: 'Both' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    required
                  />
                  <FormikInput
                    label="Reference Number"
                    name="referenceNo"
                    placeholder="e.g. ENQ-2024-123"
                  />
                  <FormikInput
                    label="Contacted By"
                    name="contactedBy"
                    placeholder="e.g. Sales Team / Name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ATTACHMENTS & REMARKS */}
            <div className="space-y-8">
              
              {/* REMARKS */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Edit3 size={14} />
                  Remarks & Notes
                </h3>
                <FormikTextarea
                  name="remarks"
                  placeholder="Add any additional notes or details about the enquiry..."
                  rows={6}
                  className="bg-slate-50/50 border-none rounded-2xl p-5 text-sm outline-none focus:ring-2 focus:ring-[#0f766e]/10 transition-all resize-none shadow-inner"
                />
              </div>

              {/* ATTACHMENTS */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Upload size={14} />
                  Documentation
                </h3>
                
                <div
                  className="border-2 border-dashed border-slate-200 rounded-3xl p-8 bg-slate-50/30 
                         flex flex-col items-center justify-center cursor-pointer hover:border-[#0f766e]/30 
                         hover:bg-[#0f766e]/5 transition-all group text-center"
                  onClick={() => document.getElementById('attachmentsInput')?.click()}
                >
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#0f766e] transition-colors mb-3">
                    <Upload size={20} />
                  </div>
                  <p className="text-slate-700 text-sm font-black tracking-tight uppercase">Upload files</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PDF, JPG, PNG allowed</p>
                  
                  <input
                    id="attachmentsInput"
                    type="file"
                    hidden
                    multiple
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      const newPreviews = newFiles.map((file) => ({
                        name: file.name,
                        size: (file.size / 1024).toFixed(1) + ' KB',
                        isNew: true,
                        file: file,
                        url: URL.createObjectURL(file),
                      }));
                      formik.setFieldValue('attachments', [
                        ...formik.values.attachments,
                        ...newFiles,
                      ]);
                      formik.setFieldValue('attachmentPreview', [
                        ...formik.values.attachmentPreview,
                        ...newPreviews,
                      ]);
                    }}
                  />
                </div>

                {formik.values.attachmentPreview?.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {formik.values.attachmentPreview.map((file: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100 group transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0">
                            <FileText size={16} className="text-[#0f766e]" />
                          </div>
                          <div className="min-w-0">
                            <a href={getFileUrl(file.url)} target="_blank" rel="noopener noreferrer" className="text-[11px] font-black text-slate-800 hover:text-[#0f766e] truncate block uppercase tracking-tight">
                              {file.name}
                            </a>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{file.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const itemToRemove = formik.values.attachmentPreview[idx];
                            const updatedPreviews = formik.values.attachmentPreview.filter((_: any, i: number) => i !== idx);
                            formik.setFieldValue('attachmentPreview', updatedPreviews);
                            if (itemToRemove.isNew) {
                              const updatedFiles = formik.values.attachments.filter((f: any) => f instanceof File ? f.name !== itemToRemove.name : true);
                              formik.setFieldValue('attachments', updatedFiles);
                            } else {
                              setRemovedAttachments([...removedAttachments, itemToRemove.url]);
                              const updatedFiles = formik.values.attachments.filter((url: any) => url !== itemToRemove.url);
                              formik.setFieldValue('attachments', updatedFiles);
                            }
                          }}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* INFORMATION CARD (Like RawMaterialForm) */}
              <div className="bg-[#0f172a] p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                      <Briefcase size={16} className="text-teal-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sales Intelligence</span>
                  </div>
                  <p className="text-lg font-black leading-tight tracking-tight">Lead momentum is tracked automatically.</p>
                  <p className="text-[11px] text-slate-500 mt-4 leading-relaxed font-bold italic">
                    All enquiries are analyzed to predict closure probabilities. Ensure follow-up dates are set to maintain active engagement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* LAST ENQUIRY DETAILS TABLE (Bottom Section) */}
        {!isEditMode && (
          <div className="mt-8 bg-white border border-slate-200/60 rounded-[3rem] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0f766e]">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tighter">Last Enquiry Details</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Similarity analysis based on current inputs</p>
                </div>
              </div>
            </div>

            {loadingEnquiries ? (
              <div className="flex items-center gap-3 p-10 justify-center">
                 <div className="w-5 h-5 border-2 border-[#0f766e]/30 border-t-[#0f766e] rounded-full animate-spin" />
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Searching records...</p>
              </div>
            ) : lastEnquiries.length > 0 ? (
              <div className="overflow-x-auto rounded-[2rem] border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="py-5 px-6">Client</th>
                      <th className="py-5 px-6">Company</th>
                      <th className="py-5 px-6">Mobile</th>
                      <th className="py-5 px-6">Status</th>
                      <th className="py-5 px-6">Follow-Up</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {lastEnquiries.map((enq, idx) => (
                      <tr key={idx} className="text-xs text-slate-600 hover:bg-slate-50/50 transition-all group">
                        <td className="py-5 px-6 font-black text-slate-900 uppercase">{enq.name}</td>
                        <td className="py-5 px-6 uppercase font-bold text-slate-400">{enq.companyName}</td>
                        <td className="py-5 px-6 font-mono font-bold tracking-tighter">{enq.contactPersonMobile}</td>
                        <td className="py-5 px-6">
                          <span className="font-black text-[9px] px-3 py-1 rounded-full bg-sky-50 text-sky-600 uppercase tracking-widest border border-sky-100">
                            {enq.status}
                          </span>
                        </td>
                        <td className="py-5 px-6 font-black text-slate-400 italic">
                          {enq.nextFollowUpDate || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center border-2 border-dashed border-slate-50 rounded-[2rem]">
                 <p className="text-xs font-black text-slate-300 uppercase tracking-widest italic">No matching historical records found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </FormikProvider>
  );
};

export default SalesForm;
