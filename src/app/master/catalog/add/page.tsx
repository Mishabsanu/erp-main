'use client';

import ProductForm from '@/components/ProductForm';
import { handleApiError } from '@/app/utils/errorHandler';
import { Product } from '@/lib/types';
import { createProduct } from '@/services/catalogApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const AddProductPage = () => {
  const router = useRouter();
  const handleSubmit = async (
    productData: Partial<Product>,
    imageFile: File | null,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    const loadingToast = toast.loading('Creating product...');
    setSubmitting(true);
    try {
      const response = await createProduct(productData);
      toast.dismiss(loadingToast);
      if (response.success) {
        toast.success(response.message);
        router.push('/master/catalog');
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
    router.push('/master/catalog');
  };

  return (
    <ProductForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEditMode={false}
      isLoading={false} 
    />
  );
};

export default withAuth(AddProductPage, [{ module: 'product', action: 'create' }]);
