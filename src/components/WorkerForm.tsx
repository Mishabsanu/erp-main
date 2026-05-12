'use client';
import { getFileUrl } from '@/app/utils/fileUtils';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { Section } from '@/components/ui/Section';
import { useAuth } from '@/contexts/AuthContext';
import { Worker } from '@/lib/types';
import { getFacilityDropdown } from '@/services/facilityApi';
import { getUtilityDropdown } from '@/services/utilityItemApi';
import { FormikProvider, useFormik } from 'formik';
import { Award, Camera, CreditCard, FileText, Fingerprint, Heart, Minus, Plus, ShieldPlus, Upload, UserIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';


import { getWorkerUtilities } from '@/services/workerUtilityApi';

const WorkerValidationSchema = Yup.object({
  // workerId: Yup.string().required('ID is required'),
  name: Yup.string().required('Full name is required'),
  qidNo: Yup.string().required('QID number is required'),
  qidExpiryDate: Yup.string().required('QID expiry is required'),
});

interface WorkerFormProps {
  initialData?: Partial<Worker>;
  onSubmit: (data: FormData, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const WorkerForm: React.FC<WorkerFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const { can } = useAuth();
  const [facilities, setFacilities] = useState<{ value: string, label: string }[]>([]);
  const [utilityMaster, setUtilityMaster] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facData, utilData] = await Promise.all([
          getFacilityDropdown(),
          getUtilityDropdown()
        ]);
        setFacilities(facData.map((f: any) => ({ value: f._id, label: f.name })));
        setUtilityMaster(utilData.data || utilData);

        if (isEditMode && initialData?._id) {
           const existingUtils = await getWorkerUtilities(initialData._id);
           if (existingUtils && existingUtils.length > 0) {
              formik.setFieldValue('utilities', existingUtils.map(u => ({
                utilityItemId: u._id,
                itemName: u.itemName,
                size: u.size || 'N/A',
                quantity: u.quantity,
                cost: u.cost || 0,
                isRecoverable: u.isRecoverable || false,
                issueDate: u.issueDate ? new Date(u.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
              })));
           }
        }
      } catch (error) {
        console.error('Failed to load metadata');
      }
    };
    fetchData();
  }, [isEditMode, initialData]);

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    photo: null,
    cv: null,
    qidDoc: null,
    passportDoc: null,
    insuranceDoc: null,
    healthCardDoc: null,
    certificateDoc: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [fieldName]: e.target.files![0] }));
    }
  };

  const formik = useFormik({
    initialValues: {
      // workerId: initialData?.workerId || '',
      name: initialData?.name || '',
      nationality: initialData?.nationality || '',
      designation: initialData?.designation || '',
      mobile: initialData?.mobile || '',
      passportNo: initialData?.passportNo || '',
      qidNo: initialData?.qidNo || '',
      qidExpiryDate: initialData?.qidExpiryDate || '',
      passportExpiryDate: initialData?.passportExpiryDate || '',
      joinDate: initialData?.joinDate || new Date().toISOString().split('T')[0],
      dateOfBirth: initialData?.dateOfBirth || '',
      status: initialData?.status || 'active',
      remarks: initialData?.remarks || '',
      skills: initialData?.skills?.length ? initialData.skills : [{ skillName: '', certificateDoc: '' }],
      utilities: [{ utilityItemId: '', itemName: '', size: '', quantity: 1, cost: 0, isRecoverable: false, issueDate: new Date().toISOString().split('T')[0] }],
    },
    validationSchema: WorkerValidationSchema,
    onSubmit: async (values, helpers) => {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'utilities' || key === 'skills') {
          // Filter out File objects from skills before stringifying
          const cleanSkills = (values as any).skills.map((s: any) => ({
             skillName: s.skillName,
             certificateDoc: s.certificateDoc
          }));
          formData.append(key, JSON.stringify(cleanSkills));
          
          // Append skill files separately
          if (key === 'skills') {
            (values as any).skills.forEach((skill: any, index: number) => {
              if (skill.certificateFile) {
                formData.append(`skill_cert_${index}`, skill.certificateFile);
              }
            });
          }
        } else {
          formData.append(key, (values as any)[key]);
        }
      });

      // Append files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          formData.append(key, files[key] as File);
        }
      });

      await onSubmit(formData, helpers);
    },
    enableReinitialize: true,
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      <div className="max-w-full mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-700">
            <UserIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">
              {isEditMode ? 'Edit Worker Profile' : 'Add New Worker'}
            </h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
              Workforce / Personnel Management
            </p>
          </div>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10 relative z-10">
          <Section eyebrow="Basic Info" title="Personal" highlight="Details">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* <FormikInput label="ID" name="workerId" placeholder="e.g. W-1001" required /> */}
                <FormikInput label="Full Name" name="name" placeholder="As per QID/Passport" required />
                <FormikInput label="Nationality" name="nationality" placeholder="e.g. Indian" />
                <FormikInput label="Contact Number" name="mobile" placeholder="+974 XXXX XXXX" />
                <FormikInput label="Designation" name="designation" placeholder="e.g. Driver" />
                <FormikInput label="Join Date" name="joinDate" type="date" />
                <FormikInput label="Date of Birth" name="dateOfBirth" type="date" />
             </div>
          </Section>

          <Section eyebrow="Legal Compliance" title="Commercial" highlight="Status">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormikInput label="QID Number" name="qidNo" placeholder="2XXXXXXXXXX" required />
                <FormikInput label="QID Expiry Date" name="qidExpiryDate" type="date" required />
                <FormikInput label="Passport Number" name="passportNo" placeholder="PXXXXXXX" />
                <FormikInput label="Passport Expiry" name="passportExpiryDate" type="date" />
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Engagement Status</label>
                  <FormikSelect 
                    label="" 
                    name="status" 
                    options={[
                      { value: 'active', label: 'Active Service' },
                      { value: 'on_leave', label: 'Vacation Period' },
                      { value: 'resigned', label: 'Resigned / Off-boarded' },
                    ]} 
                  />
                </div>
             </div>
          </Section>

          <Section eyebrow="Digital Repository" title="Evidence" highlight="Management">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FileUploadCard 
                  label="Personnel Photo" 
                  icon={<Camera size={20} />} 
                  fieldName="photo" 
                  file={files.photo} 
                  existingUrl={initialData?.photo}
                  onChange={(e) => handleFileChange(e, 'photo')} 
                />
                <FileUploadCard 
                  label="Work CV" 
                  icon={<FileText size={20} />} 
                  fieldName="cv" 
                  file={files.cv} 
                  existingUrl={initialData?.cv}
                  onChange={(e) => handleFileChange(e, 'cv')} 
                />
                <FileUploadCard 
                  label="Qatar ID" 
                  icon={<Fingerprint size={20} />} 
                  fieldName="qidDoc" 
                  file={files.qidDoc} 
                  existingUrl={initialData?.qidDoc}
                  onChange={(e) => handleFileChange(e, 'qidDoc')} 
                />
                <FileUploadCard 
                  label="Passport" 
                  icon={<CreditCard size={20} />} 
                  fieldName="passportDoc" 
                  file={files.passportDoc} 
                  existingUrl={initialData?.passportDoc}
                  onChange={(e) => handleFileChange(e, 'passportDoc')} 
                />
                <FileUploadCard 
                  label="Insurance Doc" 
                  icon={<ShieldPlus size={20} />} 
                  fieldName="insuranceDoc" 
                  file={files.insuranceDoc} 
                  existingUrl={initialData?.insuranceDoc}
                  onChange={(e) => handleFileChange(e, 'insuranceDoc')} 
                />
                <FileUploadCard 
                  label="Health Card" 
                  icon={<Heart size={20} />} 
                  fieldName="healthCardDoc" 
                  file={files.healthCardDoc} 
                  existingUrl={initialData?.healthCardDoc}
                  onChange={(e) => handleFileChange(e, 'healthCardDoc')} 
                />
             </div>
              <div className="mt-8 space-y-6">
                 <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                       <Award size={18} className="text-teal-700" />
                       <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Professional Certifications</h3>
                    </div>
                    <button 
                       type="button"
                       onClick={() => formik.setFieldValue('skills', [...formik.values.skills, { skillName: '', certificateDoc: '' }])}
                       className="p-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-700 hover:text-white transition-all shadow-sm"
                    >
                       <Plus size={16} />
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(formik.values as any).skills.map((skill: any, idx: number) => (
                       <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group animate-in slide-in-from-bottom-2 duration-300">
                          {(formik.values as any).skills.length > 1 && (
                             <button 
                                type="button"
                                onClick={() => formik.setFieldValue('skills', (formik.values as any).skills.filter((_: any, i: number) => i !== idx))}
                                className="absolute -top-2 -right-2 w-8 h-8 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-rose-100 z-10"
                             >
                                <Minus size={14} strokeWidth={3} />
                             </button>
                          )}
                          <div className="space-y-4">
                             <FormikInput label="Certificate / Skill Name" name={`skills[${idx}].skillName`} placeholder="e.g. Forklift License" />
                             <FileUploadCard 
                                label="Attach Document" 
                                icon={<Upload size={18} />} 
                                fieldName={`skills[${idx}].certificateFile`} 
                                file={skill.certificateFile || null} 
                                existingUrl={skill.certificateDoc}
                                onChange={(e) => {
                                   if (e.target.files && e.target.files[0]) {
                                      const newSkills = [...(formik.values as any).skills];
                                      newSkills[idx].certificateFile = e.target.files[0];
                                      formik.setFieldValue('skills', newSkills);
                                   }
                                }} 
                             />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
          </Section>

          <Section eyebrow="Gear Lifecycle" title="Asset" highlight="Allocation">
             <div className="space-y-4">
                {(formik.values as any).utilities.map((item: any, idx: number) => {
                   const availableSizes = Array.from(new Set(utilityMaster.filter(u => u.name === item.itemName).map(u => u.size || 'N/A')));
                   const uniqueNames = Array.from(new Set(utilityMaster.map(u => u.name)));

                   return (
                   <div key={idx} className="grid grid-cols-12 gap-4 p-5 bg-white rounded-xl border border-gray-100 hover:border-teal-200 transition-all shadow-sm">
                     <div className="col-span-3 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Item Description</label>
                        <select 
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg font-bold text-sm text-gray-700 outline-none focus:bg-white focus:border-teal-600 transition-all appearance-none cursor-pointer"
                          value={item.itemName}
                          onChange={(e) => {
                             const name = e.target.value;
                             const variants = utilityMaster.filter(u => u.name === name);
                             const utils = [...(formik.values as any).utilities];
                             utils[idx].itemName = name;
                             if (variants.length > 0) {
                                utils[idx].size = variants[0].size || 'N/A';
                                utils[idx].utilityItemId = variants[0]._id;
                                utils[idx].cost = variants[0].rate || 0;
                             }
                             formik.setFieldValue('utilities', utils);
                          }}
                        >
                          <option value="">Select Gear...</option>
                          {uniqueNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                     </div>
                     <div className="col-span-1 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1 text-center block">Size</label>
                        <select 
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg font-bold text-xs text-teal-700 outline-none focus:bg-white focus:border-teal-600 transition-all cursor-pointer"
                          value={item.size}
                          disabled={!item.itemName}
                          onChange={(e) => {
                             const size = e.target.value;
                             const variant = utilityMaster.find(u => u.name === item.itemName && u.size === size);
                             const utils = [...(formik.values as any).utilities];
                             utils[idx].size = size;
                             if (variant) {
                                utils[idx].utilityItemId = variant._id;
                                utils[idx].cost = variant.rate || 0;
                             }
                             formik.setFieldValue('utilities', utils);
                          }}
                        >
                          {availableSizes.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                     </div>
                     <div className="col-span-1 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1 text-center block">Qty</label>
                        <input 
                          type="number" 
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg font-bold text-sm text-gray-700 focus:bg-white focus:border-teal-600 transition-all text-center"
                          value={item.quantity}
                          onChange={(e) => {
                            const utils = [...(formik.values as any).utilities];
                            utils[idx].quantity = parseInt(e.target.value);
                            formik.setFieldValue('utilities', utils);
                          }}
                        />
                     </div>
                     <div className="col-span-2 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Cost (QAR)</label>
                        <input 
                          type="number" 
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg font-bold text-sm text-gray-700 focus:bg-white focus:border-teal-600 transition-all"
                          value={item.cost}
                          onChange={(e) => {
                            const utils = [...(formik.values as any).utilities];
                            utils[idx].cost = parseFloat(e.target.value);
                            formik.setFieldValue('utilities', utils);
                          }}
                        />
                     </div>
                     <div className="col-span-1 space-y-2 text-center">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Deduct?</label>
                        <div className="h-[46px] flex items-center justify-center">
                           <input 
                             type="checkbox" 
                             className="w-5 h-5 accent-teal-700"
                             checked={item.isRecoverable}
                             onChange={(e) => {
                               const utils = [...(formik.values as any).utilities];
                               utils[idx].isRecoverable = e.target.checked;
                               formik.setFieldValue('utilities', utils);
                             }}
                           />
                        </div>
                     </div>
                     <div className="col-span-3 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1 text-center block">Issuance / Recovery</label>
                        <div className="h-[46px] flex items-center justify-center gap-2">
                           <input 
                             type="date" 
                             className="px-3 py-1.5 text-[10px] font-bold border border-gray-100 rounded-lg bg-gray-50 outline-none focus:bg-white focus:border-teal-700 w-full" 
                             value={item.issueDate}
                             onChange={(e) => {
                               const utils = [...(formik.values as any).utilities];
                               utils[idx].issueDate = e.target.value;
                               formik.setFieldValue('utilities', utils);
                             }}
                           />
                        </div>
                     </div>
                     
                     <div className="col-span-1 flex items-end pb-1.5 justify-center">
                        <button 
                          type="button"
                          onClick={() => {
                            const utils = (formik.values as any).utilities.filter((_: any, i: number) => i !== idx);
                            formik.setFieldValue('utilities', utils);
                          }}
                          disabled={(formik.values as any).utilities.length === 1}
                          className="p-2 text-rose-300 hover:text-rose-600 disabled:opacity-0 transition-all"
                        >
                           <Minus size={18} strokeWidth={3} />
                        </button>
                     </div>
                   </div>
                )})}

                <button 
                   type="button"
                   onClick={() => {
                     const utils = [...(formik.values as any).utilities, { utilityItemId: '', itemName: '', size: '', quantity: 1, cost: 0, isRecoverable: false, issueDate: new Date().toISOString().split('T')[0] }];
                     formik.setFieldValue('utilities', utils);
                   }}
                   className="w-full py-4 bg-white/50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-3 text-gray-400 hover:border-teal-200 hover:text-teal-700 transition-all group mt-2"
                >
                   <Plus size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Register New Asset Allocation</span>
                </button>
             </div>
          </Section>

          <Section eyebrow="Audit Records" title="Personnel" highlight="Remarks">
            <FormikTextarea 
                name="remarks"
                label=""
                placeholder="Enter internal audit logs, disciplinary records, or medical notes..."
            />
          </Section>

          <div className="flex justify-end items-center gap-4 pt-10 border-t border-gray-200">
            <button
               type="button"
               onClick={onCancel}
               className="px-8 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`px-10 py-2.5 rounded-xl text-white font-bold shadow-lg shadow-teal-700/10 transition-all active:scale-95 ${formik.isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-teal-700 hover:bg-teal-800'
                }`}
            >
              {isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

const FileUploadCard = ({ label, icon, fieldName, file, existingUrl, onChange }: { label: string, icon: React.ReactNode, fieldName: string, file: File | null, existingUrl?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  const isImage = existingUrl?.match(/\.(jpg|jpeg|png|gif)$/i);
  
  return (
    <div className="relative group cursor-pointer h-full min-h-[120px]">
      <input
        type="file"
        id={fieldName}
        name={fieldName}
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className={`h-full flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${file ? 'bg-teal-50/50 border-teal-700 shadow-sm' : existingUrl ? 'bg-teal-50/30 border-teal-500/50' : 'bg-white border-gray-200 hover:border-teal-400 hover:bg-teal-50/5'}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 ${file ? 'bg-teal-700 text-white shadow-sm' : existingUrl ? 'bg-teal-500 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-teal-700 group-hover:text-white'}`}>
          {isImage && existingUrl && !file ? (
            <img src={getFileUrl(existingUrl)} alt="Existing" className="w-full h-full object-cover rounded-xl" />
          ) : (
            icon
          )}
        </div>
        <div className="text-center px-1">
          <span className={`text-[10px] font-bold uppercase tracking-widest block ${file ? 'text-teal-900' : existingUrl ? 'text-teal-900' : 'text-gray-400'}`}>
            {file ? file.name.substring(0, 15) + (file.name.length > 15 ? '...' : '') : existingUrl ? 'Existing Document' : label}
          </span>
          {existingUrl && !file && (
            <span className="text-[8px] font-black text-teal-600 uppercase tracking-tighter">Click to replace</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerForm;
