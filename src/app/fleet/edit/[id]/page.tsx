'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import VehicleForm from '@/components/VehicleForm';
import { getVehicle, updateVehicle } from '@/services/fleetApi';
import withAuth from '@/components/withAuth';
import { Vehicle } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const EditVehiclePage = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const data = await getVehicle(id);
        setVehicle(data);
      } catch (error) {
        console.error('Failed to fetch vehicle:', error);
        toast.error('Vehicle not found or error loading data.');
        router.push('/fleet');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVehicle();
  }, [id, router]);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await updateVehicle(id, values);
      toast.success('Vehicle updated successfully');
      router.push('/fleet');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Syncing Asset Data...</p>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <VehicleForm
        initialData={vehicle}
        isEditMode={true}
        onCancel={() => router.push('/fleet')}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default withAuth(EditVehiclePage, [{ module: 'fleet', action: 'update' }]);
