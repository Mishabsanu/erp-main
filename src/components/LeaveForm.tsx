'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { getWorkersDropdown } from '@/services/workerApi';
import { FormikProvider, useFormik } from 'formik';
import { Calendar, CheckCircle2, Clock, Paperclip } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { toast } from 'sonner';

const LeaveValidationSchema = Yup.object({
  workerId: Yup.string().required('Worker is required'),
  relieverId: Yup.string().nullable(),
  type: Yup.string().required('Leave type is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date().required('End date is required').min(Yup.ref('startDate'), 'End date must be after start date'),
  reason: Yup.string().required('Reason is required'),
  totalDays: Yup.number().required().min(1, 'At least 1 day required'),
  contactDuringLeave: Yup.string().required('Contact info is required'),
});

interface LeaveFormProps {
  initialData?: any;
  onSubmit: (data: FormData, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const LeaveForm: React.FC<LeaveFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const [workers, setWorkers] = useState<{ value: string, label: string }[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const data = await getWorkersDropdown();
        setWorkers(data.map((w: any) => ({ value: w._id, label: `${w.name} (${w.workerId})` })));
      } catch (error) {
        console.error('Failed to load workers');
      }
    };
    fetchWorkers();
  }, []);

  const formik = useFormik({
    initialValues: {
      workerId: initialData?.workerId?._id || initialData?.workerId || '',
      relieverId: initialData?.relieverId?._id || initialData?.relieverId || '',
      type: initialData?.type || 'Annual',
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      totalDays: initialData?.totalDays || 1,
      reason: initialData?.reason || '',
      status: initialData?.status || 'Pending',
      contactDuringLeave: initialData?.contactDuringLeave || '',
      airTicketRequired: initialData?.airTicketRequired || false,
      exitPermitRequired: initialData?.exitPermitRequired || false,
      remarks: initialData?.remarks || '',
    },
    validationSchema: LeaveValidationSchema,
    onSubmit: async (values, helpers) => {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        formData.append(key, (values as any)[key]);
      });
      if (attachment) {
        formData.append('attachment', attachment);
      }
      await onSubmit(formData, helpers);
    },
    enableReinitialize: true,
  });

  // Calculate total days whenever dates change
  useEffect(() => {
    if (formik.values.startDate && formik.values.endDate) {
      const start = new Date(formik.values.startDate);
      const end = new Date(formik.values.endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
      if (formik.values.totalDays !== diffDays) {
        formik.setFieldValue('totalDays', diffDays);
      }
    }
  }, [formik.values.startDate, formik.values.endDate, formik.values.totalDays]);

  // Debug/Toast validation errors
  useEffect(() => {
    if (formik.submitCount > 0 && !formik.isValid) {
      const errorFields = Object.keys(formik.errors).join(', ');
      toast.error(`Please correct the following fields: ${errorFields}`);
    }
  }, [formik.submitCount, formik.isValid, formik.errors]);

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-6">
      {/* HEADER SECTION */}
      <div className="w-full mb-8 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-900/20">
            <Calendar size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {isEditMode ? 'Authorize' : 'Record'} <span className="text-teal-600">Absence Node</span>
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Workforce Presence Management System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="px-8 py-3 rounded-xl border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={() => formik.handleSubmit()}
            disabled={formik.isSubmitting}
            className="px-10 py-3 bg-teal-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-teal-900/20 hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {formik.isSubmitting ? 'Synchronizing...' : (isEditMode ? 'Authorize Update' : 'Finalize Request')}
          </button>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMN 1: PERSONNEL & TYPE */}
          <div className="lg:col-span-1 space-y-8">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-5 bg-teal-600 rounded-full" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Personnel Assignment</h3>
                </div>
                
                <div className="space-y-6">
                  <FormikSelect label="Primary Worker" name="workerId" options={workers} required />
                  <FormikSelect label="Covering Person (Reliever)" name="relieverId" options={workers} />
                  <FormikSelect 
                    label="Absence Classification" 
                    name="type" 
                    options={[
                      { value: 'Annual', label: 'Annual Leave / Vacation' },
                      { value: 'Sick', label: 'Sick Leave (Medical)' },
                      { value: 'Emergency', label: 'Emergency Leave' },
                      { value: 'Unpaid', label: 'LWP (Leave Without Pay)' },
                      { value: 'Other', label: 'Other Leave Types' },
                    ]} 
                    required 
                  />
                </div>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-5 bg-teal-600 rounded-full" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Travel Compliance</h3>
                </div>
                
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-teal-600 transition-colors">
                            <Clock size={18} />
                         </div>
                         <div>
                            <p className="text-[11px] font-black text-slate-700 leading-none">Air Ticket</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1">Company Provision</p>
                         </div>
                      </div>
                      <input 
                        type="checkbox" 
                        name="airTicketRequired"
                        checked={formik.values.airTicketRequired}
                        onChange={formik.handleChange}
                        className="w-5 h-5 rounded-md border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                   </div>

                   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-teal-600 transition-colors">
                            <CheckCircle2 size={18} />
                         </div>
                         <div>
                            <p className="text-[11px] font-black text-slate-700 leading-none">Exit Permit</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1">Immigration Clearance</p>
                         </div>
                      </div>
                      <input 
                        type="checkbox" 
                        name="exitPermitRequired"
                        checked={formik.values.exitPermitRequired}
                        onChange={formik.handleChange}
                        className="w-5 h-5 rounded-md border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* COLUMN 2: TEMPORAL DATA */}
          <div className="lg:col-span-1 space-y-8">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-5 bg-teal-600 rounded-full" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Duration & Timeline</h3>
                </div>
                
                <div className="space-y-6">
                   <FormikInput label="Commence Date" name="startDate" type="date" required />
                   <FormikInput label="Resumption Date" name="endDate" type="date" required />
                   
                   <div className="p-6 bg-teal-50/50 rounded-2xl border border-teal-100 flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-black text-teal-900 uppercase tracking-widest">Total Duration</p>
                         <p className="text-3xl font-black text-teal-700 mt-1">{formik.values.totalDays} <span className="text-xs font-bold uppercase">Days</span></p>
                      </div>
                      <Calendar className="text-teal-600/30" size={48} />
                   </div>

                   <FormikSelect 
                    label="Authorization State" 
                    name="status" 
                    options={[
                      { value: 'Pending', label: 'Verification Pending' },
                      { value: 'Approved', label: 'Authorized / Active' },
                      { value: 'Rejected', label: 'Declined' },
                    ]} 
                    required 
                   />
                </div>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-5 bg-teal-600 rounded-full" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Contact Information</h3>
                </div>
                <FormikInput 
                  label="Phone / Mobile while on Leave" 
                  name="contactDuringLeave" 
                  placeholder="+974 ..." 
                  required 
                />
             </div>
          </div>

          {/* COLUMN 3: JUSTIFICATION & ASSETS */}
          <div className="lg:col-span-1 space-y-8">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 h-full flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-5 bg-teal-600 rounded-full" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Context & Evidence</h3>
                </div>
                
                <div className="flex-1 space-y-6">
                   <FormikTextarea 
                    label="Formal Justification" 
                    name="reason" 
                    placeholder="Reason for absence..." 
                    rows={6}
                    required
                   />

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Supporting Artifact (Medical/Other)</label>
                      <div className="relative group min-h-[150px]">
                        <input
                          type="file"
                          onChange={(e) => e.target.files && setAttachment(e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        <div className={`w-full h-full rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 ${attachment ? 'bg-teal-50 border-teal-600' : 'bg-slate-50 border-slate-200 hover:border-teal-600'}`}>
                           {attachment ? (
                             <div className="text-center p-4">
                               <CheckCircle2 size={32} className="text-teal-600 mx-auto mb-2" />
                               <p className="text-[10px] font-black text-teal-900 uppercase truncate px-4">{attachment.name}</p>
                             </div>
                           ) : (
                             <>
                               <Paperclip size={32} className="text-slate-300 group-hover:text-teal-600 transition-colors mb-2" />
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attach Proof</p>
                             </>
                           )}
                        </div>
                      </div>
                   </div>

                   <FormikTextarea 
                    label="Administrative Remarks" 
                    name="remarks" 
                    placeholder="Internal office notes..." 
                    rows={4}
                   />
                </div>
             </div>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default LeaveForm;
