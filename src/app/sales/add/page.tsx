'use client';
import { useState } from 'react';
import SalesForm from '@/components/SalesForm';
import withAuth from '@/components/withAuth';
import { createSale } from '@/services/salesApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const AddSalePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (saleData: FormData) => {
    setIsLoading(true);
    try {
      const response = await createSale(saleData);
      if (response.success) {
        toast.success(response.message || 'Enquiry created successfully!');
        router.push('/sales');
      } else {
        toast.error(response.message || 'Failed to create enquiry');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Something went wrong. Try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => router.push('/sales');

  return (
    <div className="min-h-screen bg-[#f9fafc] p-2 lg:p-4">
      <SalesForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditMode={false}
        isLoading={isLoading}
      />
    </div>
  );
};

export default withAuth(AddSalePage, [{ module: 'sales', action: 'create' }]);
