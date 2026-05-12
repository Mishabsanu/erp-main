'use client';

import DeliveryTicketForm from '@/components/DeliveryTicketForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { DeliveryTicket } from '@/lib/types';
import { handleApiError } from '@/app/utils/errorHandler';
import { getDeliveryTicketById, updateDeliveryTicket } from '@/services/deliveryTicketApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const EditDeliveryTicketPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [initialData, setInitialData] = useState<DeliveryTicket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchTicket = async () => {
        setLoading(true);
        try {
          const ticket = await getDeliveryTicketById(id);
          setInitialData(ticket);
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch delivery ticket data.';
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchTicket();
    }
  }, [id]);

  const handleSubmit = async (
    ticketData: any, 
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    const loadingToast = toast.loading('Updating delivery ticket...');
    setSubmitting(true);
    try {
      const response = await updateDeliveryTicket(id, ticketData);
      
      toast.dismiss(loadingToast);
      if (response.success) {
        toast.success(response.message);
        router.push('/delivery-ticket');
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
    router.push('/delivery-ticket');
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!initialData) {
    return <div>Delivery ticket not found.</div>;
  }
  
  return (
    <DeliveryTicketForm
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEditMode={true}
      isLoading={false}
    />
  );
};

export default withAuth(EditDeliveryTicketPage, [{ module: 'delivery_ticket', action: 'update' }]);
