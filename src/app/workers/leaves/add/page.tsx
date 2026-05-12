'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LeaveForm from '@/components/LeaveForm';
import { createLeave } from '@/services/leaveApi';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

function AddLeavePage() {
  const router = useRouter();

  const handleSubmit = async (formData: FormData, { setSubmitting }: any) => {
    try {
      await createLeave(formData);
      toast.success('New leave request recorded');
      router.push('/workers/leaves');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (

    <LeaveForm
      isEditMode={false}
      onCancel={() => router.push('/workers/leaves')}
      onSubmit={handleSubmit}
    />

  );
}

export default withAuth(AddLeavePage, [{ module: 'leave', action: 'create' }]);
