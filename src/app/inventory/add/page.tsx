'use client';

import { handleApiError } from '@/app/utils/errorHandler';
import InventoryForm from '@/components/InventoryForm';
import { CreateInventoryPayload } from '@/lib/types';
import { createInventoryItem } from '@/services/inventoryApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const AddInventoryPage = () => {
  const router = useRouter();

  const handleSubmit = async (
    payload: CreateInventoryPayload,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    const loadingToast = toast.loading('Adding inventory items...');
    setSubmitting(true);

    try {
      const response = await createInventoryItem(payload); // 🔥 ONE CALL

      if (!response.success) {
        throw new Error(response.message || 'Failed to add inventory.');
      }

      toast.dismiss(loadingToast);
      toast.success('Inventory created successfully!');
      router.push('/inventory');
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const handledError = handleApiError(error);
      if (handledError.fields) {
        setErrors(handledError.fields);
        toast.error(handledError.message);
      } else {
        toast.error(handledError.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/inventory');
  };

  return (
    <InventoryForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEditMode={false}
    />
  );
};

import withAuth, { RequiredPermission } from '@/components/withAuth';

const requiredPermissions: RequiredPermission[] = [
  { module: 'inventory', action: 'create' },
];

export default withAuth(AddInventoryPage, requiredPermissions);
