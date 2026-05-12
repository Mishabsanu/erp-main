'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import VendorForm from '@/components/master/VendorForm';
import { handleApiError } from '@/app/utils/errorHandler';
import { getVendorById, updateVendor } from '@/services/vendorApi';
import withAuth from '@/components/withAuth';
import { Vendor } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';

const EditVendorPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [initialData, setInitialData] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchVendor = async () => {
        setLoading(true);
        try {
          const vendor = await getVendorById(id);
          setInitialData(vendor);
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch vendor data.';
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchVendor();
    }
  }, [id]);

  const handleSubmit = async (
    vendorData: Partial<Vendor>,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    const loadingToast = toast.loading('Updating vendor...');
    setSubmitting(true);
    try {
      const response = await updateVendor(id, vendorData);
      toast.dismiss(loadingToast);
      if (response.success) {
        toast.success(response.message);
        router.push('/master/vendor');
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
    router.push('/master/vendor');
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!initialData) {
    return <div>Vendor not found.</div>;
  }

  return (
    <VendorForm
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEditMode={true}
    />
  );
};

export default withAuth(EditVendorPage, [{ module: 'vendor', action: 'update' }]);
