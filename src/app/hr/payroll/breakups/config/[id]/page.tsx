'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SalaryBreakupForm } from '@/components/payroll/SalaryBreakupForm';
import { getBreakupByUserId, upsertBreakup } from '@/services/payrollApi';
import { getUserById } from '@/services/userApi';
import withAuth from '@/components/withAuth';

function ConfigSalaryBreakupPage() {
  const params = useParams();
  const id = (params?.id as string) || '';
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    setFetching(true);
    try {
      const [userData, breakupData] = await Promise.all([
        getUserById(id),
        getBreakupByUserId(id)
      ]);
      setUser(userData);
      setInitialData(breakupData);
    } catch (error) {
      console.error('Error fetching details:', error);
      toast.error('Failed to load configuration data');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await upsertBreakup({ ...data, userId: id });
      toast.success('Salary breakup configuration saved');
      router.push('/hr/payroll/personnel');
    } catch (error) {
      console.error('Error saving breakup:', error);
      toast.error('Failed to save salary configuration');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-20 text-center">Loading configuration...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-black text-gray-950 uppercase tracking-tight">Configure <span className="text-teal-700">Salary Breakup</span></h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Personnel: {user?.name} ({user?.itemCode})</p>
      </div>

      <SalaryBreakupForm 
        initialData={initialData} 
        userName={user?.name || 'Personnel Profile'}
        onSubmit={handleSubmit} 
        loading={loading}
      />
    </div>
  );
}

export default withAuth(ConfigSalaryBreakupPage, [{ module: 'payroll', action: 'update' }]);
