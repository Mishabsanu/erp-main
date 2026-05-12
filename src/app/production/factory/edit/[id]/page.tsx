'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import FactoryForm from '@/components/FactoryForm';
import { getProductionById, updateProduction } from '@/services/productionApi';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

interface EditProductionPageProps {
  params: Promise<{ id: string }>;
}

function EditProductionPage({ params: paramsPromise }: EditProductionPageProps) {
  const router = useRouter();
  const params = use(paramsPromise);
  const { id } = params;
  
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProductionById(id);
        setInitialData(data);
      } catch (error) {
        toast.error('Failed to load production record');
        router.push('/production/factory');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, router]);

  const handleSubmit = async (formData: FormData, { setSubmitting }: any) => {
    try {
      await updateProduction(id, formData);
      toast.success('Production log updated');
      router.push('/production/factory');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <div className="w-full">
        <FactoryForm
            isEditMode={true}
            initialData={initialData}
            onCancel={() => router.push('/production/factory')}
            onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default withAuth(EditProductionPage, [{ module: 'production', action: 'update' }]);
