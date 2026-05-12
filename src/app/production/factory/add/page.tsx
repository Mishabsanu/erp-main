'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import FactoryForm from '@/components/FactoryForm';
import { createProduction } from '@/services/productionApi';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

function AddProductionPage() {
  const router = useRouter();

  const handleSubmit = async (formData: FormData, { setSubmitting }: any) => {
    try {
      await createProduction(formData);
      toast.success('New production log recorded');
      router.push('/production/factory');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <div className="w-full">
        <FactoryForm
            isEditMode={false}
            onCancel={() => router.push('/production/factory')}
            onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default withAuth(AddProductionPage, [{ module: 'production', action: 'create' }]);
