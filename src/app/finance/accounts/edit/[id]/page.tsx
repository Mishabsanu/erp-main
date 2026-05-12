'use client';

import { useState, useEffect } from 'react';
import AccountForm from '@/components/finance/AccountForm';
import { getAccountById, updateAccount } from '@/services/financeApi';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Account } from '@/lib/types';
import { TableSkeleton } from '@/components/shared/TableSkeleton';

const EditAccountPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        if (typeof id === 'string') {
          const data = await getAccountById(id);
          setAccount(data);
        }
      } catch (error) {
        toast.error('Failed to load account data');
        router.push('/finance/accounts');
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [id, router]);

  const handleSubmit = async (values: any) => {
    setIsSaving(true);
    try {
      if (typeof id === 'string') {
        await updateAccount(id, values);
        toast.success('Ledger account updated successfully');
        router.push('/finance/accounts');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update account');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => router.push('/finance/accounts');

  if (loading) return <div className="p-10"><TableSkeleton /></div>;
  if (!account) return null;

  return (
    <div className="min-h-screen bg-[#f9fafc] p-6 lg:p-10">
      <AccountForm
        initialData={account}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSaving}
      />
    </div>
  );
};

export default EditAccountPage;
