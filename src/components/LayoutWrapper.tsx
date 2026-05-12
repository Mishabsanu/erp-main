'use client';

import { usePathname } from 'next/navigation';
import Layout from './Layout';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { loading } = useAuth();
  const isLoginPage = pathname === '/login';

  if (loading) {
    return <LoadingSpinner />;
  }

  return <>{isLoginPage ? children : <Layout>{children}</Layout>}</>;
}
