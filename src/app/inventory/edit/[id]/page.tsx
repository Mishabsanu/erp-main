"use client"
import { handleApiError } from '@/app/utils/errorHandler';
import InventoryForm from '@/components/InventoryForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { InventoryFormData, InventoryItem } from '@/lib/types';
import {
  getInventoryItemById,
  updateInventoryItem,
} from '@/services/inventoryApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const EditInventoryPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [initialData, setInitialData] = useState<InventoryFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchInventory = async () => {
        setLoading(true);
        try {
          const inventory = await getInventoryItemById(id);
          console.log('EditInventoryPage - Raw inventory from API:', inventory);
          // Transform the single InventoryItem into the structure expected by InventoryForm
          const transformedInitialData: InventoryFormData = {
            date: inventory.createdAt
              ? inventory.createdAt.split('T')[0]
              : new Date().toISOString().split('T')[0],
            reference: inventory.reference || '',
            poNo: inventory.poNo,
            vendor: typeof inventory.vendor === 'object' ? inventory.vendor?._id : inventory.vendor,
            items: [
              {
                id: inventory._id,
                productId: inventory.product?._id || '',
                itemCode: inventory.itemCode,
                unit: inventory.product?.unit || '',
                stock: inventory.availableQty,
              },
            ],
          };

          setInitialData(transformedInitialData);
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch inventory data.';
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchInventory();
    }
  }, [id]);

  const handleSubmit = async (
    InventoryData: Partial<InventoryItem>,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    const loadingToast = toast.loading('Updating inventory...');
    setSubmitting(true);
    try {
      const response = await updateInventoryItem(id, InventoryData);
      toast.dismiss(loadingToast);
      if (response.success) {
        toast.success(response.message);
        router.push('/inventory');
      } else {
        toast.error(response.message || 'An unknown error occurred.');
      }
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
    router.push('/inventory,');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!initialData) {
    return <div>Inventory not found.</div>;
  }

  return (
    <InventoryForm
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={false}
      isEditMode={true} // Add this prop
    />
  );
};

import withAuth, { RequiredPermission } from '@/components/withAuth';

const requiredPermissions: RequiredPermission[] = [
  { module: 'inventory', action: 'update' },
];

export default withAuth(EditInventoryPage, requiredPermissions);
