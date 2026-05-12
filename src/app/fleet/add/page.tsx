'use client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import VehicleForm from '@/components/VehicleForm';
import { createVehicle } from '@/services/fleetApi';
import withAuth from '@/components/withAuth';

const AddVehiclePage = () => {
  const router = useRouter();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await createVehicle(values);
      toast.success('Vehicle added to fleet successfully');
      router.push('/fleet');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <VehicleForm
        isEditMode={false}
        onCancel={() => router.push('/fleet')}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default withAuth(AddVehiclePage, [{ module: 'fleet', action: 'create' }]);
