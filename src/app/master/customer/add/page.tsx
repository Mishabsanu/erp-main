'use client';

import CustomerForm from '@/components/master/CustomerForm';
import { handleApiError } from '@/app/utils/errorHandler';
import { Customer } from '@/lib/types';
import { createCustomer } from '@/services/customerApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const AddCustomerPage = () => {
  const router = useRouter();

  const handleSubmit = async (
    customerData: Omit<Customer, '_id'>,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    const loadingToast = toast.loading('Creating customer...');
    setSubmitting(true);
    try {
      const response = await createCustomer(customerData);
      toast.dismiss(loadingToast);
      if (response.success) {
        toast.success(response.message);
        router.push('/master/customer');
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
    router.push('/master/customer');
  };

  return (
    <CustomerForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEditMode={false}
    />
  );
};

export default withAuth(AddCustomerPage, [{ module: 'customer', action: 'create' }]);
