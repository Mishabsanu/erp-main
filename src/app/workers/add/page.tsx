'use client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import WorkerForm from '@/components/WorkerForm';
import { createWorker } from '@/services/workerApi';
import { issueBulkUtilities } from '@/services/workerUtilityApi';
import withAuth from '@/components/withAuth';

const AddWorkerPage = () => {
  const router = useRouter();

  const handleSubmit = async (formData: FormData, { setSubmitting }: any) => {
    try {
      const utilsString = formData.get('utilities') as string;
      const initialUtils = utilsString ? JSON.parse(utilsString) : [];

      const worker = await createWorker(formData);

      if (initialUtils.length > 0 && worker?._id) {
        const itemsToIssue = initialUtils
          .filter((i: any) => i.itemName)
          .map((i: any) => {
            const expiryDate = new Date(i.issueDate);
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);

            return {
              ...i,
              expiryDate: expiryDate.toISOString().split('T')[0],
              status: 'issued'
            };
          });

        if (itemsToIssue.length > 0) {
          await issueBulkUtilities(worker._id, itemsToIssue);
        }
      }

      toast.success('Worker enrolled successfully. Documents are being processed in the background.');
      router.push(`/workers/${worker._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to enroll worker');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <WorkerForm
        isEditMode={false}
        onCancel={() => router.push('/workers')}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default withAuth(AddWorkerPage, [{ module: 'worker', action: 'create' }]);
