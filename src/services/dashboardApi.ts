import api from '@/lib/api';
import { ApiResponse } from '@/lib/types/api';

export const getDashboardData = async () => {
  const { data } = await api.get<ApiResponse<any>>(`/dashboard`);
  return data.data;
};
