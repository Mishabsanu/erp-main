'use client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import FacilityForm from '@/components/FacilityForm';
import { createFacility } from '@/services/facilityApi';
import withAuth from '@/components/withAuth';

const AddFacilityPage = () => {
  const router = useRouter();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await createFacility(values);
      toast.success('Facility created successfully');
      router.push('/facilities');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create facility');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <FacilityForm
        isEditMode={false}
        onCancel={() => router.push('/facilities')}
        onSubmit= {handleSubmit}
      />
    </div>
  );
};

export default withAuth(AddFacilityPage, [{ module: 'facility', action: 'create' }]);
