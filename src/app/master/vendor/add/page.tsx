'use client';

import VendorForm from '@/components/master/VendorForm';
import { handleApiError } from '@/app/utils/errorHandler';
import { Vendor } from '@/lib/types';
import { createVendor } from '@/services/vendorApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const AddVendorPage = () => {
  const router = useRouter();

  const handleSubmit = async (
    vendorData: Omit<Vendor, '_id'>,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    const loadingToast = toast.loading('Creating vendor...');
    setSubmitting(true);
    try {
      const response = await createVendor(vendorData);
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
        toast.error(handledError.message); // Main message for fields
      } else {
        toast.error(handledError.message); // General error
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/master/vendor');
  };

  return (
    <VendorForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEditMode={false}
    />
  );
};

export default withAuth(AddVendorPage, [{ module: 'vendor', action: 'create' }]);
