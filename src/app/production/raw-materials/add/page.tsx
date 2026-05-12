'use client';

import React from 'react';
import RawMaterialForm from '@/components/production/RawMaterialForm';
import { createRawMaterial } from '@/services/rawMaterialApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import withAuth from '@/components/withAuth';

const AddRawMaterialPage = () => {
    const router = useRouter();

    const handleSubmit = async (values: any) => {
        try {
            await createRawMaterial(values);
            toast.success('Raw material registered successfully');
            router.push('/production/raw-materials');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to register material');
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">

            <div className="w-full">
                <RawMaterialForm 
                    onSubmit={handleSubmit}
                    onCancel={() => router.back()}
                    isEditMode={false}
                />
            </div>
        </div>
    );
};

export default withAuth(AddRawMaterialPage, [{ module: 'production', action: 'create' }]);
