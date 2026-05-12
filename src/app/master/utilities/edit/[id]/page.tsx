'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import UtilityItemForm from '@/components/master/UtilityItemForm';
import { getUtilityItems, updateUtilityItem, UtilityItem } from '@/services/utilityItemApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import withAuth from '@/components/withAuth';

const EditUtilityPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';
  
  const [initialData, setInitialData] = useState<UtilityItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUtilityItems(); // Currently fetches all, find by id client-side or we could add a getById
        const item = response.data.find((i: UtilityItem) => i._id === id);
        if (item) {
          setInitialData(item);
        } else {
          toast.error('Asset not found');
          router.push('/master/utilities');
        }
      } catch (error) {
        toast.error('Failed to synchronize asset data');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, router]);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await updateUtilityItem(id, values);
      toast.success('Asset record synchronized successfully');
      router.push('/master/utilities');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to synchronize asset');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <UtilityItemForm
        isEditMode={true}
        initialData={initialData!}
        onCancel={() => router.push('/master/utilities')}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default withAuth(EditUtilityPage, [{ module: 'utility', action: 'update' }]);
