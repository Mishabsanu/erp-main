'use client';

import { useState } from 'react';
import ExpenseForm from '@/components/finance/ExpenseForm';
import { createExpense } from '@/services/financeApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const AddExpensePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const response = await createExpense(formData);
      toast.success('Expenditure record posted successfully');
      router.push('/finance/expenses');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => router.push('/finance/expenses');

  return (
    <div className="min-h-screen bg-[#f9fafc] p-6 lg:p-10">
      <ExpenseForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddExpensePage;
