import { useAuth } from '@/contexts/AuthContext';

export const usePermission = () => {
  const { can, loading } = useAuth();
  return { can, loading };
};
