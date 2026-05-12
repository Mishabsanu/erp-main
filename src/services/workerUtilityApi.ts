import api from '@/lib/api';
import { WorkerUtility } from '@/lib/types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const issueUtility = async (payload: Partial<WorkerUtility>) => {
  const { data } = await api.post<ApiResponse<WorkerUtility>>('/worker-utilities', payload);
  return data.data;
};

export const issueBulkUtilities = async (workerId: string, items: any[], force: boolean = false) => {
  const { data } = await api.post<ApiResponse<WorkerUtility[]>>('/worker-utilities/bulk', { workerId, items, force });
  return data.data;
};

export const getWorkerUtilities = async (workerId: string) => {
  const { data } = await api.get<ApiResponse<WorkerUtility[]>>(`/worker-utilities/worker/${workerId}`);
  return data.data;
};

export const updateUtilityStatus = async (id: string, status: string, remarks?: string) => {
  const { data } = await api.patch<ApiResponse<WorkerUtility>>(`/worker-utilities/${id}/status`, { status, remarks });
  return data.data;
};

export const deleteUtility = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/worker-utilities/${id}`);
  return data;
};

export const getUtilityStats = async () => {
  const { data } = await api.get<ApiResponse<any[]>>('/worker-utilities/stats');
  return data.data;
};
