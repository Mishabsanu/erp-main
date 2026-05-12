'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import UtilityItemForm from '@/components/master/UtilityItemForm';
import { createUtilityItem } from '@/services/utilityItemApi';
import withAuth from '@/components/withAuth';

const AddUtilityPage = () => {
  const router = useRouter();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await createUtilityItem(values);
      toast.success('Asset record initialized successfully');
      router.push('/master/utilities');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initialize asset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <UtilityItemForm
        isEditMode={false}
        onCancel={() => router.push('/master/utilities')}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default withAuth(AddUtilityPage, [{ module: 'utility', action: 'create' }]);
