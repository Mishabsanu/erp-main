import api from '@/lib/api';
import { UserFilter } from '@/lib/types';
import { ApiResponse, GetApiResponse } from '@/lib/types/api';

export const getUsers = async (
  filter: UserFilter,
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
  const { data } = await api.get<GetApiResponse<any>>('/users', { params });
  return {
    users: data?.data?.content || [],
    totalPages: data?.data?.totalPages || 1,
    totalCount: data?.data?.totalCount || 0,
    currentPage: data?.data?.currentPage || page,
    limit: data?.data?.limit || limit,
  };
};

export const createUser = async (payload: any) => {
  const { data } = await api.post<ApiResponse<any>>('/users', payload);
  return data;
};

export const updateUser = async (id: string, payload: any) => {
  const { data } = await api.put<ApiResponse<any>>(`/users/${id}`, payload);
  return data;
};
export const getUserById = async (id: string) => {
  const { data } = await api.get<ApiResponse<any>>(`/users/${id}`);
  return data.data.content;
};

export const deleteUser = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/users/${id}`);
  return data;
};

export const getUsersCount = async () => {
  const { data } = await api.get<ApiResponse<number>>('/users/count');
  return data.data;
};
