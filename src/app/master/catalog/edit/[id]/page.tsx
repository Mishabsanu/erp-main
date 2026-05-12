'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import ProductForm from '@/components/ProductForm';
import { Product } from '@/lib/types';
import { handleApiError } from '@/app/utils/errorHandler';
import { getProductById, updateProduct } from '@/services/catalogApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [initialData, setInitialData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const product = await getProductById(id);
          setInitialData(product);
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch product data.';
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleSubmit = async (
    productData: Partial<Product>,
    imageFile: File | null,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    const loadingToast = toast.loading('Updating product...');
    setSubmitting(true);
    try {
      const response = await updateProduct(id, productData);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!initialData) {
    return <div>Product not found.</div>;
  }

  return (
    <ProductForm
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEditMode={true}
      isLoading={false} // Manage loading state in the page
    />
  );
};

export default withAuth(EditProductPage, [{ module: 'product', action: 'update' }]);
