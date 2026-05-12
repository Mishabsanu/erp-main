import api from '@/lib/api';
import { RoleFilter } from '@/lib/types';
import { ApiResponse, GetApiResponse } from '@/lib/types/api';

export const getRoles = async (
  filter: RoleFilter,
  page: number = 1,
  limit: number = 10
) => {
  // Build query params dynamically
  const params: Record<string, any> = {
    page,
    limit,
  };
  if (filter.search) params.search = filter.search;
  if (filter.role) params.role = filter.role;
  if (filter.status) params.status = filter.status;
  const { data } = await api.get<GetApiResponse<any>>('/roles', { params });
  return {
    roles: data?.data?.content || [],
    totalPages: data?.data?.totalPages || 1,
    totalCount: data?.data?.totalCount || 0,
    currentPage: data?.data?.currentPage || page,
    limit: data?.data?.limit || limit,
  };
};

export const createRole = async (payload: any) => {
  const { data } = await api.post<ApiResponse<any>>('/roles', payload);
  return data;
};

export const updateRole = async (id: string, payload: any) => {
  const { data } = await api.put<ApiResponse<any>>(`/roles/${id}`, payload);
  return data.data;
};
export const getRoleById = async (id: string) => {
  const { data } = await api.get<ApiResponse<any>>(`/roles/${id}`);
  return data.data.content;
};

export const deleteRole = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/roles/${id}`);
  return data;
};

export const getRolesCount = async () => {
  const { data } = await api.get<ApiResponse<number>>('/roles/count');
  return data.data;
};

export const getRoleDropdown = async () => {
  const { data } = await api.get<ApiResponse<any[]>>('/roles/dropdown');
  return data;
};