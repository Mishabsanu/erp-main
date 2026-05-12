import api from '@/lib/api';
import { ApiResponse } from '@/lib/types/api';
import { Worker } from '@/lib/types';

export const getWorkers = async (params?: any) => {
  const response = await api.get<{ data: { content: Worker[], totalCount: number, totalPages: number } }>('/workers', { params });
  return response.data;
};

export const getWorkersDropdown = async () => {
  const response = await api.get<{ data: Worker[] }>('/workers/dropdown');
  return response.data.data;
};

export const getWorker = async (id: string) => {
  const response = await api.get<ApiResponse<Worker>>(`/workers/${id}`);
  return response.data.data;
};

export const createWorker = async (formData: FormData) => {
  const response = await api.post<ApiResponse<Worker>>('/workers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const updateWorker = async (id: string, data: any) => {
  const isFormData = data instanceof FormData;
  const response = await api.put<ApiResponse<Worker>>(`/workers/${id}`, data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data.data;
};

export const deleteWorker = async (id: string) => {
  const response = await api.delete<ApiResponse<any>>(`/workers/${id}`);
  return response.data;
};
