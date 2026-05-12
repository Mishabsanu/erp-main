'use client';

import { useState, useEffect } from 'react';
import ExpenseForm from '@/components/finance/ExpenseForm';
import { getExpenseById, updateExpense } from '@/services/financeApi';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Expense } from '@/lib/types';
import { TableSkeleton } from '@/components/shared/TableSkeleton';

const EditExpensePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        if (typeof id === 'string') {
          const data = await getExpenseById(id);
          setExpense(data);
        }
      } catch (error) {
        toast.error('Failed to load expenditure data');
        router.push('/finance/expenses');
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id, router]);

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true);
    try {
      if (typeof id === 'string') {
        const response = await updateExpense(id, formData);
        toast.success('Expenditure record updated successfully');
        router.push('/finance/expenses');
        return response;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update expense');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => router.push('/finance/expenses');

  if (loading) return <div className="p-10"><TableSkeleton /></div>;
  if (!expense) return null;

  return (
    <div className="min-h-screen bg-[#f9fafc] p-6 lg:p-10">
      <ExpenseForm
        initialData={expense}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSaving}
      />
    </div>
  );
};

export default EditExpensePage;
