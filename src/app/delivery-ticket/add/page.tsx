'use client';

import DeliveryTicketForm from '@/components/DeliveryTicketForm';
import { handleApiError } from '@/app/utils/errorHandler';
import { DeliveryTicket } from '@/lib/types';
import { createDeliveryTicket, GetNextDeliveryTicketNo } from '@/services/deliveryTicketApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import { useState } from 'react';

const AddDeliveryTicketPage = () => {
  const router = useRouter();
  const [initialData, setInitialData] = useState<Partial<DeliveryTicket>>({});

  const handleSubmit = async (
    ticketData: any, 
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    const loadingToast = toast.loading('Creating delivery ticket...');
    setSubmitting(true);
    try {
      const response = await createDeliveryTicket(ticketData);
      
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
      
      // Check for ticket number collision
      const errorMessage = handledError.message.toLowerCase();
      if (errorMessage.includes('already created') || errorMessage.includes('already exists') || errorMessage.includes('ticket no')) {
        try {
          const nextNoRes = await GetNextDeliveryTicketNo();
          if (nextNoRes?.success && nextNoRes.data) {
            toast.error(`Collision detected: Ticket number was already taken. Updating to ${nextNoRes.data}. Please review and confirm again.`, { duration: 5000 });
            
            setInitialData((prev) => ({
              ...prev,
              ticketNo: nextNoRes.data
            }));
            
            setErrors({ ticketNo: `Already taken. New available: ${nextNoRes.data}` });
            return;
          }
        } catch (fetchError) {
          console.error('Failed to fetch next ticket number after collision', fetchError);
        }
      }

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

  return (
    <DeliveryTicketForm
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEditMode={false}
      isLoading={false}
    />
  );
};

export default withAuth(AddDeliveryTicketPage, [{ module: 'delivery_ticket', action: 'create' }]);
