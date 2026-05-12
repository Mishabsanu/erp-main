'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import UserForm from '@/components/UserForm';
import { User } from '@/lib/types';
import { handleApiError } from '@/app/utils/errorHandler';
import { getUserById, updateUser } from '@/services/userApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';

const EditUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [initialData, setInitialData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const user = await getUserById(id);
          setInitialData(user);
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch user data.';
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id]);

  const handleSubmit = async (
    userData: Partial<User>,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    const loadingToast = toast.loading('Updating user...');
    setSubmitting(true);
    try {
      const response = await updateUser(id, userData);
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
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!initialData) {
    return <div>User not found.</div>;
  }

  return (
    <UserForm
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEditMode={true}
    />
  );
};

export default withAuth(EditUserPage, [{ module: 'user', action: 'update' }]);
