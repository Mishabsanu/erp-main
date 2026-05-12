'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ChecklistForm from '@/components/ChecklistForm';
import { createAuditReport } from '@/services/facilityApi';
import withAuth from '@/components/withAuth';

const NewAuditReportPage = () => {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    try {
      await createAuditReport(formData);
      toast.success('Facility audit report submitted');
      router.push('/facilities/checklist');
    } catch (error) {
      toast.error('Submission failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10">
      <ChecklistForm
        isEditMode={false}
        onCancel={() => router.push('/facilities/checklist')}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default withAuth(NewAuditReportPage, [{ module: 'facility_audit', action: 'create' }]);
