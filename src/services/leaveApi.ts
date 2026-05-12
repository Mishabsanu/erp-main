import api from '@/lib/api';
import { ApiResponse, GetApiResponse } from '@/lib/types/api';

export const getLeaves = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  status?: string,
  type?: string,
  startDate?: string,
  endDate?: string
) => {
  const params: any = { page, limit, search };
  if (status) params.status = status;
  if (type) params.type = type;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const { data } = await api.get<GetApiResponse<any>>('/leaves', { params });
  return {
    leaves: data?.data?.content || [],
    totalPages: data?.data?.totalPages || 1,
    totalCount: data?.data?.totalCount || 0,
    currentPage: data?.data?.currentPage || page,
  };
};

export const createLeave = async (payload: FormData) => {
  const { data } = await api.post<ApiResponse<any>>('/leaves', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateLeave = async (id: string, payload: FormData | any) => {
  const isFormData = payload instanceof FormData;
  const { data } = await api.put<ApiResponse<any>>(`/leaves/${id}`, payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return data;
};

export const deleteLeave = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/leaves/${id}`);
  return data;
};

export const getLeaveById = async (id: string) => {
  const { data } = await api.get<ApiResponse<any>>(`/leaves/${id}`);
  return data.data.content;
};
