'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, Save, ArrowLeft, PieChart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Section } from '@/components/ui/Section';
import { FormikInput } from '@/components/shared/FormikInput';

interface SalaryBreakupFormProps {
  initialData?: any;
  userName: string;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

const validationSchema = Yup.object().shape({
  basic: Yup.number().min(0).required('Required'),
  hra: Yup.number().min(0).required('Required'),
  conveyance: Yup.number().min(0),
  specialAllowance: Yup.number().min(0),
  pf: Yup.number().min(0),
  esi: Yup.number().min(0),
  tds: Yup.number().min(0),
  otherDeductions: Yup.number().min(0),
});

export const SalaryBreakupForm: React.FC<SalaryBreakupFormProps> = ({
  initialData,
  userName,
  onSubmit,
  loading,
}) => {
  const router = useRouter();
  
  const initialValues = {
    basic: initialData?.basic || 0,
    hra: initialData?.hra || 0,
    conveyance: initialData?.conveyance || 0,
    specialAllowance: initialData?.specialAllowance || 0,
    pf: initialData?.pf || 0,
    esi: initialData?.esi || 0,
    tds: initialData?.tds || 0,
    otherDeductions: initialData?.otherDeductions || 0,
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-50/30 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-16 relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#be123c] rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-rose-900/20 transition-transform hover:rotate-6">
            <PieChart size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
               <div className="w-1 h-3 bg-[#be123c] rounded-full" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Finance Node</p>
            </div>
            <h2 className="text-3xl font-black text-[#0f172a] tracking-tight uppercase">
              Configure <span className="text-[#be123c]">Salary</span>
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-70">Employee: {userName}</p>
          </div>
        </div>
        <button 
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border-2 border-gray-100 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, isSubmitting }) => (
          <Form className="space-y-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Earnings Section */}
              <div className="bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100 shadow-inner">
                 <div className="flex items-center gap-3 mb-10">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Earnings Components</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <FormikInput label="Basic Salary" name="basic" type="number" required />
                   <FormikInput label="HRA" name="hra" type="number" required />
                   <FormikInput label="Conveyance" name="conveyance" type="number" />
                   <FormikInput label="Special Allowance" name="specialAllowance" type="number" />
                 </div>
              </div>

              {/* Deductions Section */}
              <div className="bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100 shadow-inner">
                 <div className="flex items-center gap-3 mb-10">
                    <div className="w-1 h-4 bg-rose-500 rounded-full" />
                    <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-[0.3em]">Deductions Ledger</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <FormikInput label="PF (Provident Fund)" name="pf" type="number" />
                   <FormikInput label="ESI (Insurance)" name="esi" type="number" />
                   <FormikInput label="TDS (Income Tax)" name="tds" type="number" />
                   <FormikInput label="Other Deductions" name="otherDeductions" type="number" />
                 </div>
              </div>
            </div>

            {/* Summary Block */}
            <div className="bg-white p-10 rounded-[3rem] border-2 border-dashed border-gray-100 shadow-sm overflow-hidden relative group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-rose-50/50 transition-colors duration-500" />
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Gross Yield</p>
                    <p className="text-3xl font-black text-[#0f172a] tracking-tighter tabular-nums">
                      ₹{(Number(values.basic) + Number(values.hra) + Number(values.conveyance) + Number(values.specialAllowance)).toLocaleString()}
                    </p>
                    <div className="w-8 h-1 bg-emerald-500/20 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Total Fiscal Attrition</p>
                    <p className="text-3xl font-black text-gray-900 tracking-tighter tabular-nums">
                      ₹{(Number(values.pf) + Number(values.esi) + Number(values.tds) + Number(values.otherDeductions)).toLocaleString()}
                    </p>
                    <div className="w-8 h-1 bg-rose-500/20 rounded-full" />
                  </div>
                  <div className="md:border-l-2 border-gray-100 md:pl-10 space-y-1">
                    <p className="text-[10px] font-black text-[#be123c] uppercase tracking-[0.2em] px-1">Net Disposable Income</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black text-[#be123c] tracking-tighter tabular-nums">
                        ₹{(
                          (Number(values.basic) + Number(values.hra) + Number(values.conveyance) + Number(values.specialAllowance)) -
                          (Number(values.pf) + Number(values.esi) + Number(values.tds) + Number(values.otherDeductions))
                        ).toLocaleString()}
                       </span>
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">/ M</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-6 pt-12 border-t border-gray-50">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-10 py-5 rounded-2xl border-2 border-gray-100 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all active:scale-95"
              >
                Cancel Configuration
              </button>
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className={`flex items-center gap-4 px-12 py-5 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${
                  loading || isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#be123c] shadow-rose-900/30 hover:bg-[#9f1239]'
                }`}
              >
                {loading || isSubmitting ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Commit Configuration
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
