'use client';

import QuoteTrackForm from '@/components/QuoteTrackForm';
import { QuoteTrack } from '@/lib/types';
import { createQuoteTrack } from '@/services/quoteApi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const AddQuoteTrackPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (quoteTrackData: QuoteTrack) => {
    setIsLoading(true);
    try {
      const response = await createQuoteTrack(quoteTrackData);
      if (response.success) {
        toast.success(response.message || 'Quote track created successfully!');
        router.push('/quote-track');
      } else {
        toast.error(response.message || 'Failed to create quote track');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Something went wrong. Try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => router.push('/quote-track');

  return (
    <div className="min-h-screen bg-[#f9fafc] p-6 lg:p-10">
      <QuoteTrackForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditMode={false}
        isLoading={isLoading}
      />
    </div>
  );
};

export default withAuth(AddQuoteTrackPage, [{ module: 'quote_track', action: 'create' }]);
