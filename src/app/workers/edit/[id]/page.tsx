'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import WorkerForm from '@/components/WorkerForm';
import { getWorker, updateWorker } from '@/services/workerApi';
import { issueBulkUtilities } from '@/services/workerUtilityApi';
import withAuth from '@/components/withAuth';

const EditWorkerPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorker = useCallback(async () => {
    try {
      const data = await getWorker(id as string);
      setWorker(data);
    } catch (error) {
      toast.error('Failed to load worker data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorker();
  }, [fetchWorker]);

  const handleSubmit = async (formData: FormData, { setSubmitting }: any) => {
    try {
      const utilsString = formData.get('utilities') as string;
      const initialUtils = utilsString ? JSON.parse(utilsString) : [];

      await updateWorker(id as string, formData);

      // Issue new utilities (those without an _id)
      const newItems = initialUtils.filter((i: any) => !i._id && i.itemName).map((i: any) => {
        const expiryDate = new Date(i.issueDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        return {
          ...i,
          expiryDate: expiryDate.toISOString().split('T')[0],
          status: 'issued'
        };
      });

      if (newItems.length > 0) {
        await issueBulkUtilities(id as string, newItems);
      }

      toast.success('Worker record updated. Changes are being processed.');
      router.push(`/workers/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-indigo-600 font-black animate-pulse uppercase tracking-[0.4em]">Retrieving Personnel Records...</div>;
  if (!worker) return <div className="p-10 text-center text-gray-400">Worker not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <WorkerForm
        initialData={worker}
        isEditMode={true}
        onCancel={() => router.push('/workers')}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default withAuth(EditWorkerPage, [{ module: 'worker', action: 'update' }]);
