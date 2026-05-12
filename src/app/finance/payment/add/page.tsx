'use client';

import { useState } from 'react';
import PaymentForm from '@/components/finance/PaymentForm';
import { createPayment } from '@/services/financeApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Payment } from '@/lib/types';

const AddPaymentPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: Payment) => {
    setIsLoading(true);
    try {
      await createPayment(values);
      toast.success('Financial settlement posted to ledger');
      router.push('/finance/payment');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => router.push('/finance/payment');

  return (
    <div className="min-h-screen bg-[#f9fafc] p-6 lg:p-10">
      <PaymentForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddPaymentPage;
