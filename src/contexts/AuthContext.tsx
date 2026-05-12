'use client';

import { User } from '@/lib/types';
import { loginApi, logoutApi, meApi } from '@/services/authApi';
import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (
    module: string,
    action: 'view' | 'create' | 'update' | 'delete'
  ) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname() || '';

  const login = async (email: string, password: string) => {
    await loginApi(email, password);
    const fetchedUser = await meApi();
    setUser(fetchedUser);
    router.push('/');
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
    router.push('/login');
  };

  const can = (
    module: string,
    action: 'view' | 'create' | 'update' | 'delete'
  ): boolean => {
    if (!user?.role || typeof user.role === 'string' || !user.role.permissions)
      return false;
    return !!user.role.permissions[module]?.[action];
  };

  useEffect(() => {
    const publicRoutes = ['/login', '/forgot-password'];

    const fetchUser = async () => {
      try {
        const fetchedUser = await meApi();
        setUser(fetchedUser);
      } catch {
        setUser(null);
        if (!publicRoutes.includes(pathname)) {
          router.replace('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
