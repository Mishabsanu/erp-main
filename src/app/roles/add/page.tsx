'use client';

import RoleForm from '@/components/RoleForm';
import { createRole } from '@/services/roleApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { handleApiError } from '@/app/utils/errorHandler';
import withAuth from '@/components/withAuth';

const AddRolePage = () => {
  const router = useRouter();

  const handleSubmit = async (
    roleData: any,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    const loadingToast = toast.loading('Creating role...');
    setSubmitting(true);
    try {
      await createRole(roleData);
      toast.dismiss(loadingToast);
      toast.success('Role created successfully!');
      router.push('/roles');
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const handledError = handleApiError(error);
      if (handledError.fields) {
        setErrors(handledError.fields);
        toast.error(handledError.message);
      } else {
        toast.error(handledError.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/roles');
  };

  return (
    <div className="w-full">
      <RoleForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditMode={false}
      />
    </div>
  );
};

export default withAuth(AddRolePage, [{ module: 'role', action: 'create' }]);
