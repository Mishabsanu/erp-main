'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

export type RequiredPermission = {
  module: string;
  action: 'view' | 'create' | 'update' | 'delete';
};

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermissions?: RequiredPermission[]
) => {
  const AuthComponent = (props: P) => {
    const { user, loading, can } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          // Not authenticated
          router.push('/login');
        } else if (requiredPermissions && requiredPermissions.length > 0) {
          // Authenticated, now check permissions
          const userHasAllPermissions = requiredPermissions.every(perm =>
            can(perm.module, perm.action)
          );
          if (!userHasAllPermissions) {
            router.push('/'); // Or a dedicated "unauthorized" page
          }
        }
      }
    }, [user, loading, router, requiredPermissions, can]);

    if (loading) {
      return <LoadingSpinner />; // Show a loading spinner while authentication is in progress
    }

    if (!user) {
      return null; // User is not authenticated, redirect will handle
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      const userHasAllPermissions = requiredPermissions.every(perm =>
        can(perm.module, perm.action)
      );
      if (!userHasAllPermissions) {
        return null; // User does not have required permissions, redirect will handle
      }
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
