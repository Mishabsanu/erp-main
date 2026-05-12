'use client';

import UserForm from '@/components/UserForm';
import { handleApiError } from '@/app/utils/errorHandler';
import { User } from '@/lib/types';
import { createUser } from '@/services/userApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const AddUserPage = () => {
  const router = useRouter();

  const handleSubmit = async (
    userData: Partial<User>,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    const loadingToast = toast.loading('Creating user...');
    setSubmitting(true);
    try {
      const response = await createUser(userData);
      toast.dismiss(loadingToast);
      if (response.success) {
        toast.success(response.message);
        router.push('/users');
      } else {
        toast.error(response.message || 'An unknown error occurred.');
      }
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
    router.push('/users');
  };

  return (
    <UserForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEditMode={false}
    />
  );
};

export default withAuth(AddUserPage, [{ module: 'user', action: 'create' }]);
