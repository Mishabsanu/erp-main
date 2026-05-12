'use client';

import { useState, useEffect } from 'react';
import PaymentForm from '@/components/finance/PaymentForm';
import { getPaymentById, updatePayment } from '@/services/financeApi';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Payment } from '@/lib/types';
import { TableSkeleton } from '@/components/shared/TableSkeleton';

const EditPaymentPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        if (typeof id === 'string') {
          const data = await getPaymentById(id);
          setPayment(data);
        }
      } catch (error) {
        toast.error('Failed to load transaction data');
        router.push('/finance/payment');
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [id, router]);

  const handleSubmit = async (values: Payment) => {
    setIsSaving(true);
    try {
      if (typeof id === 'string') {
        await updatePayment(id, values);
        toast.success('Legecy record rectified and updated');
        router.push('/finance/payment');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update transaction');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => router.push('/finance/payment');

  if (loading) return <div className="p-10"><TableSkeleton /></div>;
  if (!payment) return null;

  return (
    <div className="min-h-screen bg-[#f9fafc] p-6 lg:p-10">
      <PaymentForm
        initialData={payment}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSaving}
      />
    </div>
  );
};

export default EditPaymentPage;
