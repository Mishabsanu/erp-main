'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import SalesForm from '@/components/SalesForm';
import { Sale } from '@/lib/types';
import { getSaleById, updateSale } from '@/services/salesApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import withAuth from '@/components/withAuth';
import { toast } from 'sonner';

interface EditSalePageProps {
  params: Promise<{ id: string }>;
}

const EditSalePage = ({ params: paramsPromise }: EditSalePageProps) => {
  const router = useRouter();
  const params = use(paramsPromise);
  const { id } = params;
  const [sale, setSale] = useState<Sale | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchSale = async () => {
        try {
            const fetchedSale = await getSaleById(id as string);
            setSale(fetchedSale);
        } catch (error) {
            toast.error('Failed to load enquiry details');
        } finally {
            setLoading(false);
        }
      };
      fetchSale();
    }
  }, [id]);

  const handleSubmit = async (saleData: FormData) => {
    if (id) {
      setIsLoading(true);
      try {
        const response = await updateSale(id as string, saleData);
        if (response.success) {
          toast.success(response.message || 'Enquiry updated successfully!');
          router.push('/sales');
        } else {
          toast.error(response.message || 'Failed to update enquiry');
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || 'Something went wrong. Try again.'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    router.push('/sales');
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
  }

  if (!sale) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-black text-amber-700 uppercase tracking-widest">Enquiry Node Not Found</h2>
                <button onClick={handleCancel} className="text-amber-600 font-black uppercase text-[10px] tracking-widest hover:text-amber-700 transition-colors">Terminate & Return</button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-2 lg:p-4">
      <SalesForm
        initialData={sale}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditMode={true}
        isLoading={isLoading}
      />
    </div>
  );
};

export default withAuth(EditSalePage, [{ module: 'sales', action: 'update' }]);
