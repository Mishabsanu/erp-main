'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import RoleForm from '@/components/RoleForm';
import { Role } from '@/lib/types';
import { getRoleById, updateRole } from '@/services/roleApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { handleApiError } from '@/app/utils/errorHandler';
import withAuth from '@/components/withAuth';

const EditRolePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';
  const [role, setRole] = useState<Role | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchRole = async () => {
        try {
          const fetchedRole = await getRoleById(id as string);
          setRole(fetchedRole);
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch role data.';
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchRole();
    }
  }, [id]);

  const handleSubmit = async (
    roleData: Role,
    { setErrors, setSubmitting }: { setErrors: any; setSubmitting: any }
  ) => {
    if (id) {
      const loadingToast = toast.loading('Updating role...');
      setSubmitting(true);
      try {
        await updateRole(id as string, roleData);
        toast.dismiss(loadingToast);
        toast.success('Role updated successfully!');
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
    }
  };

  const handleCancel = () => {
    router.push('/roles');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!role) {
    return <div className="container mx-auto p-4">Role not found.</div>;
  }

  return (
    <div className="w-full">
      <RoleForm
        initialData={role}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditMode={true}
      />
    </div>
  );
};

export default withAuth(EditRolePage, [{ module: 'role', action: 'update' }]);
