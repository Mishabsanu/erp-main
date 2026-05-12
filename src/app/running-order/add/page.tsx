'use client';

import RunningOrderForm from '@/components/RunningOrderForm';
import { createRunningOrder } from '@/services/runningOrderApi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const AddRunningOrderPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (values: any) => {
        setIsLoading(true);
        try {
            const response = await createRunningOrder(values);
            if (response.success) {
                toast.success('Order tracking created successfully');
                router.push('/running-order');
            } else {
                toast.error(response.message || 'Failed to create record');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6 lg:p-10">
            <RunningOrderForm
                onSubmit={handleSubmit}
                onCancel={() => router.push('/running-order')}
                isEditMode={false}
                isLoading={isLoading}
            />
        </div>
    );
};

export default withAuth(AddRunningOrderPage, [{ module: 'running_order', action: 'create' }]);
