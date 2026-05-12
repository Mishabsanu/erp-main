'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import CustomerForm from '@/components/master/CustomerForm';
import { Customer } from '@/lib/types';
import { handleApiError } from '@/app/utils/errorHandler';
import { getCustomerById, updateCustomer } from '@/services/customerApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const EditCustomerPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [initialData, setInitialData] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        setLoading(true);
        try {
          const customer = await getCustomerById(id);
          setInitialData(customer);
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch customer data.';
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id]);

  const handleSubmit = async (
    customerData: Partial<Customer>,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    const loadingToast = toast.loading('Updating customer...');
    setSubmitting(true);
    try {
      const response = await updateCustomer(id, customerData);
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
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!initialData) {
    return <div>Customer not found.</div>;
  }

  return (
    <CustomerForm
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEditMode={true}
    />
  );
};

export default withAuth(EditCustomerPage, [{ module: 'customer', action: 'update' }]);
