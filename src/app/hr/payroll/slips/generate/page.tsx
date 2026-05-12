'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SalarySlipForm } from '@/components/payroll/SalarySlipForm';
import { generateSlip } from '@/services/payrollApi';
import { getUsers } from '@/services/userApi';
import withAuth from '@/components/withAuth';

function GenerateSalarySlipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setFetching(true);
    try {
      const data = await getUsers({ status: 'active' }, 1, 100);
      setEmployees(data.users || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      await generateSlip(formData);
      toast.success('Salary slip generated successfully');
      router.push('/hr/payroll/slips');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate slip');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <SalarySlipForm
        loading={loading}
        employees={employees}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
export default withAuth(GenerateSalarySlipPage, [{ module: 'payroll', action: 'create' }]);
