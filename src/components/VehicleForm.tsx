'use client';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { useAuth } from '@/contexts/AuthContext';
import { Vehicle } from '@/lib/types';
import { FormikProvider, useFormik } from 'formik';
import { Truck, CheckCircle2 } from 'lucide-react';
import React from 'react';
import * as Yup from 'yup';

const VehicleValidationSchema = Yup.object({
  name: Yup.string().required('Vehicle name is required'),
  plateNo: Yup.string().required('Plate number is required'),
  type: Yup.string().required('Vehicle type is required'),
  odometer: Yup.number().min(0, 'Must be positive').required('Initial odometer is required'),
});

interface VehicleFormProps {
  initialData?: Partial<Vehicle>;
  onSubmit: (data: Partial<Vehicle>, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      plateNo: initialData?.plateNo || '',
      type: initialData?.type || 'Pickup',
      model: initialData?.model || '',
      year: initialData?.year || '',
      engineNo: initialData?.engineNo || '',
      chassisNo: initialData?.chassisNo || '',
      odometer: initialData?.odometer || 0,
      status: initialData?.status || 'active',
      remarks: initialData?.remarks || '',
      insuranceExpiry: initialData?.insuranceExpiry ? new Date(initialData.insuranceExpiry).toISOString().split('T')[0] : '',
      registrationExpiry: initialData?.registrationExpiry ? new Date(initialData.registrationExpiry).toISOString().split('T')[0] : '',
    },
    validationSchema: VehicleValidationSchema,
    onSubmit: async (values, helpers) => {
      await onSubmit(values as any, helpers);
    },
    enableReinitialize: true,
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      {/* HEADER SECTION */}
      <div className="max-w-full mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[1.5rem] border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-[#0f766e]/10 rounded-2xl flex items-center justify-center text-[#0f766e]">
            <Truck size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              {isEditMode ? 'Authorize Asset' : 'New Vehicle Initialization'}
            </h2>
            <p className="text-slate-400 font-medium text-sm">
              Logistics Intelligence &bull; Asset Node Registry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            Discard Changes
          </button>
          <button
            type="submit"
            form="vehicle-form"
            disabled={formik.isSubmitting}
            className="px-8 py-2.5 bg-[#0f766e] text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-900/20 hover:bg-[#134e4a] transition-all active:scale-95 disabled:opacity-50"
          >
            {isEditMode ? 'Update' : 'Save'}
          </button>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form id="vehicle-form" onSubmit={formik.handleSubmit} className="max-w-full mx-auto space-y-8 pb-20">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* MAIN INFORMATION CARD */}
            <div className="xl:col-span-2 space-y-8">
              <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -mr-10 -mt-10 opacity-40" />

                <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <span className="w-2 h-6 bg-[#0f766e] rounded-full" />
                  Technical Specifications
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormikInput label="Vehicle Name" name="name" placeholder="e.g. Toyota Hilux 4x4" required />
                  <FormikInput label="Plate Number" name="plateNo" placeholder="REG-12345" required />
                  <FormikSelect
                    label="Vehicle Type"
                    name="type"
                    required
                    options={[
                      { value: 'Pickup', label: 'Pickup Truck' },
                      { value: 'Truck', label: 'Heavy Truck' },
                      { value: 'Van', label: 'Transit Van' },
                      { value: 'Car', label: 'Sedan/SUV' },
                      { value: 'Forklift', label: 'Forklift' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                  <FormikSelect
                    label="Operational Status"
                    name="status"
                    required
                    options={[
                      { value: 'active', label: 'Active Service' },
                      { value: 'maintenance', label: 'Under Maintenance' },
                      { value: 'inactive', label: 'Decommissioned' },
                    ]}
                  />
                  <FormikInput label="Model Reference" name="model" placeholder="e.g. SR5 Premium" />
                  <FormikInput label="Year of Manufacture" name="year" type="number" placeholder="2024" />
                  <FormikInput label="Initial Odometer" name="odometer" type="number" placeholder="0" required />
                  <FormikInput label="Engine Reference" name="engineNo" placeholder="E-XXXXXXX" />
                  <FormikInput label="Chassis Reference" name="chassisNo" placeholder="C-XXXXXXX" />
                </div>
              </div>

              {/* COMPLIANCE CARD */}
              <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <span className="w-2 h-6 bg-teal-600/40 rounded-full" />
                  Compliance & Legal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormikInput label="Insurance Expiry Date" name="insuranceExpiry" type="date" />
                  <FormikInput label="Registration Expiry Date" name="registrationExpiry" type="date" />
                </div>
              </div>

              {/* REMARKS CARD */}
              <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <span className="w-2 h-6 bg-amber-600/40 rounded-full" />
                  Operational Remarks
                </h3>
                <textarea
                  name="remarks"
                  value={formik.values.remarks}
                  onChange={formik.handleChange}
                  placeholder="Enter internal logistics logs or maintenance history..."
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium outline-none focus:bg-white focus:border-[#0f766e] transition-all resize-none"
                />
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="xl:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                  Asset Identity
                </h3>
                <div className="p-6 rounded-2xl border-2 border-[#0f766e] bg-[#0f766e]/5 shadow-md shadow-teal-900/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#0f766e] rounded-xl flex items-center justify-center text-white">
                      <Truck size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#0f766e]">Active Fleet Asset</p>
                      <p className="text-[10px] text-slate-400 font-medium">Standard Logistics Protocol</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    Telemetry Synchronization
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                    This vehicle will be tracked in the mechanical diagnostic and delivery ticket modules once initialized.
                  </p>
                </div>
              </div>

              <div className="bg-[#0f766e] p-8 rounded-[2rem] shadow-xl shadow-teal-900/20 text-white relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <h4 className="text-xs font-black uppercase tracking-widest text-teal-100/60 mb-2">Fleet Summary</h4>
                <p className="text-2xl font-bold leading-tight">Secure Logistics Data</p>
                <div className="mt-6 flex items-center gap-2">
                  <div className="w-8 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-white rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-50 italic">Validation Active</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default VehicleForm;
