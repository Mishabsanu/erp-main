import api from '@/lib/api';
import { RunningOrder } from '@/lib/types';
import { GetApiResponse, ApiResponse } from '@/lib/types/api';

export const getRunningOrders = async (
  search = '',
  page = 1,
  limit = 10,
  status?: string,
  transaction_type?: string
) => {
  try {
    const params: Record<string, any> = {
      page,
      limit,
    };
    if (search) params.search = search;
    if (status) params.status = status;
    if (transaction_type) params.transaction_type = transaction_type;

    const { data } = await api.get<GetApiResponse<RunningOrder>>(
      '/running-orders',
      { params }
    );

    return {
      result: data?.data?.content || [],
      totalPages: data?.data?.totalPages || 1,
      totalCount: data?.data?.totalCount || 0,
      currentPage: data?.data?.currentPage || page,
    };
  } catch (error) {
    console.error('Error fetching running orders:', error);
    return {
      result: [],
      totalPages: 1,
      totalCount: 0,
      currentPage: page,
    };
  }
};

export const createRunningOrder = async (payload: Partial<RunningOrder>) => {
  const { data } = await api.post<ApiResponse<RunningOrder>>('/running-orders', payload);
  return data;
};

export const updateRunningOrder = async (id: string, payload: Partial<RunningOrder>) => {
  const { data } = await api.put<ApiResponse<RunningOrder>>(`/running-orders/${id}`, payload);
  return data;
};

export const getRunningOrderById = async (id: string) => {
  const { data } = await api.get<ApiResponse<RunningOrder>>(`/running-orders/${id}`);
  return data.data;
};

export const deleteRunningOrder = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/running-orders/${id}`);
  return data;
};

export const updateRunningOrderStatusApi = async (id: string, status: string) => {
  const { data } = await api.patch<ApiResponse<any>>(`/running-orders/${id}/status`, { status });
  return data;
};

export const getRunningOrdersDropdown = async () => {
  const { data } = await api.get<ApiResponse<any>>('/running-orders/dropdown');
  return data.data;
};

export const getRunningOrderFulfillment = async (id: string) => {
  const { data } = await api.get<ApiResponse<any>>(`/running-orders/${id}/fulfillment`);
  return data.data;
};

export const getLatestRunningOrderNo = async () => {
    const { data } = await api.get<ApiResponse<string>>('/running-orders/latest-no');
    return data.data;
};
