'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ChecklistForm from '@/components/ChecklistForm';
import { getAuditReport, updateAuditReport } from '@/services/facilityApi';
import withAuth from '@/components/withAuth';

const EditChecklistPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getAuditReport(id as string);
        setInitialData(data);
      } catch (error) {
        toast.error('Audit report not found');
        router.push('/facilities/checklist');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, router]);

  const handleSubmit = async (formData: FormData) => {
    try {
      await updateAuditReport(id as string, formData);
      toast.success('Audit report updated successfully');
      router.push('/facilities/checklist');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10">
      <ChecklistForm
        isEditMode={true}
        initialData={initialData}
        onCancel={() => router.push('/facilities/checklist')}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default withAuth(EditChecklistPage, [{ module: 'facility_audit', action: 'update' }]);
