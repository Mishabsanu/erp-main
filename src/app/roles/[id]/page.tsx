'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import { getRoleById } from '@/services/roleApi';
import {
  ArrowLeft,
  ShieldCheck,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Role {
  _id: string;
  name: string;
  status: 'active' | 'inactive';
  permissions: Record<
    string,
    { view: boolean; create: boolean; update: boolean; delete: boolean }
  >;
  createdAt: string;
  updatedAt: string;
}

const RoleViewPage = () => {
  const params = useParams();
  const id = (params?.id as string) || '';
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!id) return;
      try {
        const res = await getRoleById(id as string);
        setRole(res);
      } catch (err) {
        console.error('Failed to load role details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [id]);

  if (loading || !role) return <LoadingSpinner />;

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          Role Details —{' '}
          <span className="text-teal-700">{role.name}</span>
        </h1>
      </div>

      {/* ROLE INFO CARD */}
      <div className="bg-white rounded-xl border p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="text-teal-700 w-6 h-6" />
          <h2 className="text-xl font-semibold text-gray-800">
            Role Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Role Name</p>
            <p className="text-lg font-semibold">{role.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-white text-sm mt-1 ${
                role.status === 'active'
                  ? 'bg-green-600'
                  : 'bg-teal-700'
              }`}
            >
              {role.status}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(role.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Updated At</p>
            <p className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(role.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* PERMISSIONS CARD */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Permissions
        </h2>

        <div className="overflow-x-auto">
          <table className="akod-table">
            <thead>
              <tr>
                <th className="border px-4 py-2 text-left">Module</th>
                {['View', 'Create', 'Update', 'Delete'].map((action) => (
                  <th
                    key={action}
                    className="border px-4 py-2 text-center"
                  >
                    {action}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Object.entries(role.permissions).map(
                ([module, perms]) => (
                  <tr key={module} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 capitalize font-medium">
                      {module.replace('_', ' ')}
                    </td>

                    {(['view', 'create', 'update', 'delete'] as const).map(
                      (action) => (
                        <td
                          key={action}
                          className="border px-4 py-2 text-center"
                        >
                          {perms[action] ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400 mx-auto" />
                          )}
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoleViewPage;
