'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RawMaterialForm from '@/components/production/RawMaterialForm';
import { getRawMaterialById, updateRawMaterial } from '@/services/rawMaterialApi';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import withAuth from '@/components/withAuth';

const EditRawMaterialPage = () => {
    const params = useParams();
    const id = (params?.id as string) || '';
    const router = useRouter();
    const [material, setMaterial] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterial = async () => {
            try {
                const data = await getRawMaterialById(id as string);
                setMaterial(data);
            } catch (error) {
                toast.error('Failed to load material details');
                router.back();
            } finally {
                setLoading(false);
            }
        };
        fetchMaterial();
    }, [id, router]);

    const handleSubmit = async (values: any) => {
        try {
            await updateRawMaterial(id as string, values);
            toast.success('Material definition updated');
            router.back();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update material');
        }
    };

    if (loading) return <div className="p-10"><TableSkeleton /></div>;

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">

            <div className="w-full">
                <RawMaterialForm 
                    initialData={material}
                    onSubmit={handleSubmit}
                    onCancel={() => router.back()}
                    isEditMode={true}
                />
            </div>
        </div>
    );
};

export default withAuth(EditRawMaterialPage, [{ module: 'production', action: 'update' }]);
