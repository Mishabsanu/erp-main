'use client';

import { useState } from 'react';
import AccountForm from '@/components/finance/AccountForm';
import { createAccount } from '@/services/financeApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const AddAccountPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      await createAccount(values);
      toast.success('Ledger account initialized successfully');
      router.push('/finance/accounts');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initialize account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => router.push('/finance/accounts');

  return (
    <div className="min-h-screen bg-[#f9fafc] p-6 lg:p-10">
      <AccountForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddAccountPage;
