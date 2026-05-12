'use client';

import { formatDateTime } from '@/app/utils/formatDateTime';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Section } from '@/components/ui/Section';
import { User } from '@/lib/types';
import { getUserById } from '@/services/userApi';
import { Edit2, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const ViewUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const fetchedUser = await getUserById(id);
          setUser(fetchedUser);
        } catch (error) {
          toast.error('Failed to fetch user data.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id]);

  const handleEdit = () => {
    router.push(`/users/edit/${id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        User not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-semibold text-gray-800">User Details</h1>
        </div>
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#134e4a] text-white font-semibold py-2.5 px-5 rounded-lg shadow transition-all"
        >
          <Edit2 className="w-4 h-4" /> Edit User
        </button>
      </div>

      <Section title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Detail label="Name" value={user.name} />
          <Detail label="Email" value={user.email} />
          <Detail label="Mobile" value={user.mobile} />
          <Detail
            label="Role"
            value={typeof user.role === 'object' ? user.role?.name : user.role}
          />
          <div>
            <strong>Status:</strong>{' '}
            <span
              className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${
                user.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-teal-100 text-teal-900'
              }`}
            >
              {user.status}
            </span>
          </div>
        </div>
      </Section>

      <Section title="System Information" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Detail label="Created At" value={formatDateTime(user.createdAt)} />
          <Detail label="Updated At" value={formatDateTime(user.updatedAt)} />
        </div>
      </Section>
    </div>
  );
};

/* ================= Reusable Detail Component ================= */
const Detail = ({ label, value }: { label: string; value?: string | null }) => (
  <p>
    <strong>{label}:</strong>{' '}
    <span className="text-gray-700">{value || '-'}</span>
  </p>
);

export default ViewUserPage;
