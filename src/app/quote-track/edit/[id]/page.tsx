'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import QuoteTrackForm from '@/components/QuoteTrackForm';
import { QuoteTrack } from '@/lib/types';
import { getQuoteTrackById, updateQuoteTrack } from '@/services/quoteApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

interface EditQuoteTrackPageProps {
  params: Promise<{ id: string }>;
}

const EditQuoteTrackPage = ({ params: paramsPromise }: EditQuoteTrackPageProps) => {
  const router = useRouter();
  const params = use(paramsPromise);
  const { id } = params;
  const [quoteTrack, setQuoteTrack] = useState<QuoteTrack | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchQuoteTrack = async () => {
        try {
          const fetchedQuoteTrack = await getQuoteTrackById(id as string);
          setQuoteTrack(fetchedQuoteTrack);
        } catch (error) {
          toast.error('Failed to fetch quote track data.');
        } finally {
          setLoading(false);
        }
      };
      fetchQuoteTrack();
    }
  }, [id]);

  const handleSubmit = async (quoteTrackData: QuoteTrack) => {
    if (id) {
      setIsUpdating(true);
      try {
        const response = await updateQuoteTrack(id as string, quoteTrackData);
        if (response.success) {
          toast.success(response.message || 'Quote track updated successfully!');
          router.push('/quote-track');
        } else {
          toast.error(response.message || 'Failed to update quote track.');
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || 'Something went wrong. Try again.'
        );
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleCancel = () => {
    router.push('/quote-track');
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
  }

  if (!quoteTrack) {
    return (
        <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center p-6 text-center">
             <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#0f766e]">Quote track not found</h2>
                <button onClick={handleCancel} className="text-[#0f766e] font-bold hover:underline">Return to list</button>
             </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafc] p-6 lg:p-10">
      <QuoteTrackForm
        initialData={quoteTrack}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditMode={true}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default withAuth(EditQuoteTrackPage, [{ module: 'quote_track', action: 'update' }]);
