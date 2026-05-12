import api from '@/lib/api';
import { ApiResponse, GetApiResponse } from '@/lib/types/api';

export const getProductions = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  status: string = ""
) => {
  const params = { page, limit, search, status };
  const { data } = await api.get<GetApiResponse<any>>('/production', { params });
  return {
    productions: data?.data?.content || [],
    totalPages: data?.data?.totalPages || 1,
    totalCount: data?.data?.totalCount || 0,
    currentPage: data?.data?.currentPage || page,
  };
};

export const approveProduction = async (id: string) => {
  const { data } = await api.patch<ApiResponse<any>>(`/production/${id}/approve`);
  return data;
};

export const createProduction = async (payload: FormData) => {
  const { data } = await api.post<ApiResponse<any>>('/production', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateProduction = async (id: string, payload: FormData) => {
  const { data } = await api.put<ApiResponse<any>>(`/production/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteProduction = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/production/${id}`);
  return data;
};

export const getProductionById = async (id: string) => {
  const { data } = await api.get<ApiResponse<any>>(`/production/${id}`);
  return data.data.content;
};
