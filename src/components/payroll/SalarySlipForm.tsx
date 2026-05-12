'use client';

import { Save, ArrowLeft, ReceiptText, Calendar, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Section } from '@/components/ui/Section';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';

interface SalarySlipFormProps {
  employees: any[];
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

const validationSchema = Yup.object().shape({
  user: Yup.string().required('Employee selection is required'),
  month: Yup.number().required('Month is required'),
  year: Yup.number().required('Year is required'),
  paidDays: Yup.number().min(0).required('Paid days is required'),
  totalDays: Yup.number().min(1).required('Total days is required'),
});

export const SalarySlipForm: React.FC<SalarySlipFormProps> = ({
  employees,
  onSubmit,
  loading,
}) => {
  const router = useRouter();

  const initialValues = {
    user: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    paidDays: 30,
    totalDays: 30,
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString('default', { month: 'long' }),
  }));

  const employeeOptions = employees.map(emp => ({
    value: emp._id,
    label: `${emp.name} (${emp.email})`,
  }));

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <ReceiptText className="text-teal-700 w-6 h-6" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Generate New Payslip
          </h2>
        </div>
        <button 
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors font-medium"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Section title="Employee & Period Selection">
                <div className="space-y-6">
                  <FormikSelect 
                    label="Employee" 
                    name="user" 
                    options={employeeOptions} 
                    required 
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <FormikSelect 
                      label="Month" 
                      name="month" 
                      options={monthOptions} 
                      required 
                    />
                    <FormikInput 
                      label="Year" 
                      name="year" 
                      type="number" 
                      required 
                    />
                  </div>
                </div>
              </Section>

              <Section title="Attendance Summary">
                <div className="grid grid-cols-2 gap-6">
                  <FormikInput 
                    label="Paid Days" 
                    name="paidDays" 
                    type="number" 
                    required 
                  />
                  <FormikInput 
                    label="Total Days in Month" 
                    name="totalDays" 
                    type="number" 
                    required 
                  />
                </div>
                <p className="mt-4 text-xs text-gray-400 italic">
                  * Basic and HRA will be calculated proportionally based on paid days.
                </p>
              </Section>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-white font-semibold shadow-sm transition ${
                  loading || isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-700 hover:bg-teal-800'
                }`}
              >
                {loading || isSubmitting ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ReceiptText size={18} />
                )}
                Generate Statement
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
