'use client';

import { handleApiError } from '@/app/utils/errorHandler';
import { createReturnTicket } from '@/services/returnTicketApi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import ReturnTicketForm from '@/components/ReturnTicketForm';
import withAuth from '@/components/withAuth';
import { ReturnTicket } from '@/lib/types';

const AddReturnTicketPage = () => {
  const router = useRouter();
  const [backendErrors, setBackendErrors] = useState<{ [key: string]: string }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    ticketData: Partial<ReturnTicket>,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    setIsLoading(true);
    setSubmitting(true);
    try {
      setBackendErrors({});

      const response = await createReturnTicket(ticketData);

      if (response.success) {
        toast.success(response.message || 'Return ticket added successfully!');
        router.push('/return-ticket');
      } else {
        toast.error(response.message || 'Failed to add return ticket.');
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ReturnTicketForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/return-ticket')}
        isEditMode={false}
        backendErrors={backendErrors}
        isLoading={isLoading}
      />
    </div>
  );
};

export default withAuth(AddReturnTicketPage, [{ module: 'return_ticket', action: 'create' }]);
