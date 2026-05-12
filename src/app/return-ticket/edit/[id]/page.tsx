'use client';

import { handleApiError } from '@/app/utils/errorHandler';
import { getReturnTicketById, updateReturnTicket } from '@/services/returnTicketApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import LoadingSpinner from '@/components/LoadingSpinner';
import ReturnTicketForm from '@/components/ReturnTicketForm';
import { ReturnTicket } from '@/lib/types';

const EditReturnTicketPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';
  const [returnTicket, setReturnTicket] = useState<Partial<ReturnTicket> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReturnTicket = async () => {
      try {
        const response = await getReturnTicketById(id as string);
        if (response) {
          setReturnTicket(response);
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to load return ticket.';
        toast.error(errorMessage);
      }
    };
    fetchReturnTicket();
  }, [id]);

  const handleSubmit = async (
    ticketData: Partial<ReturnTicket>,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    setIsLoading(true);
    setSubmitting(true);
    try {
      const response = await updateReturnTicket(id as string, ticketData);

      if (response.success) {
        toast.success('Return ticket updated successfully!');
        router.push('/return-ticket');
      } else {
        toast.error('Failed to update return ticket.');
      }
    } catch (error: any) {
      const handledError = handleApiError(error);
      if (handledError.fields) {
        setErrors(handledError.fields);
        toast.error(handledError.message);
      } else {
        toast.error(handledError.message);
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  if (!returnTicket) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ReturnTicketForm
        initialData={returnTicket}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/return-ticket')}
        isEditMode={true}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditReturnTicketPage;
