'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import RunningOrderForm from '@/components/RunningOrderForm';
import { getRunningOrderById, updateRunningOrder } from '@/services/runningOrderApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

interface EditRunningOrderPageProps {
  params: Promise<{ id: string }>;
}

const EditRunningOrderPage = ({ params: paramsPromise }: EditRunningOrderPageProps) => {
    const router = useRouter();
    const params = use(paramsPromise);
    const { id } = params;
    
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchOrder = async () => {
                try {
                    const result = await getRunningOrderById(id as string);
                    setOrder(result);
                } catch {
                    toast.error('Failed to fetch order details');
                } finally {
                    setLoading(false);
                }
            };
            fetchOrder();
        }
    }, [id]);

    const handleSubmit = async (values: any) => {
        if (id) {
            setIsUpdating(true);
            try {
                const response = await updateRunningOrder(id as string, values);
                if (response.success) {
                    toast.success('Order tracking updated');
                    router.push('/running-order');
                } else {
                    toast.error(response.message || 'Update failed');
                }
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Something went wrong');
            } finally {
                setIsUpdating(false);
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );

    if (!order) return (
         <div className="min-h-screen bg-[#f9fafc] flex flex-col items-center justify-center text-center p-6">
            <h2 className="text-2xl font-bold text-[#0f766e] mb-4">Order record not found</h2>
            <button onClick={() => router.push('/running-order')} className="text-[#0f766e] font-bold hover:underline">Return to list</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-white p-6 lg:p-10">
            <RunningOrderForm
                initialData={order}
                onSubmit={handleSubmit}
                onCancel={() => router.push('/running-order')}
                isEditMode={true}
                isLoading={isUpdating}
            />
        </div>
    );
};

export default withAuth(EditRunningOrderPage, [{ module: 'running_order', action: 'update' }]);
