'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import LeaveForm from '@/components/LeaveForm';
import { getLeaveById, updateLeave } from '@/services/leaveApi';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

interface EditLeavePageProps {
  params: Promise<{ id: string }>;
}

function EditLeavePage({ params: paramsPromise }: EditLeavePageProps) {
  const router = useRouter();
  const params = use(paramsPromise);
  const { id } = params;
  
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLeaveById(id);
        setInitialData(data);
      } catch (error) {
        toast.error('Failed to load leave record');
        router.push('/workers/leaves');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, router]);

  const handleSubmit = async (formData: FormData, { setSubmitting }: any) => {
    try {
      await updateLeave(id, formData);
      toast.success('Leave record updated');
      router.push('/workers/leaves');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#f8fafc]">
      <div className="max-w-[1000px] mx-auto">
        <LeaveForm
            isEditMode={true}
            initialData={initialData}
            onCancel={() => router.push('/workers/leaves')}
            onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default withAuth(EditLeavePage, [{ module: 'leave', action: 'update' }]);
