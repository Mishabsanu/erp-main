'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import FacilityForm from '@/components/FacilityForm';
import { getFacility, updateFacility } from '@/services/facilityApi';
import withAuth from '@/components/withAuth';

const EditFacilityPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const data = await getFacility(id as string);
        setInitialData(data);
      } catch (error) {
        toast.error('Facility not found');
        router.push('/facilities');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchFacility();
  }, [id, router]);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await updateFacility(id as string, values);
      toast.success('Facility updated successfully');
      router.push('/facilities');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f766e]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <FacilityForm
        isEditMode={true}
        initialData={initialData}
        onCancel={() => router.push('/facilities')}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default withAuth(EditFacilityPage, [{ module: 'facility', action: 'update' }]);
