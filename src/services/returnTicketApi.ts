import api from '@/lib/api';
import { DeliveryTicket, ReturnTicket, ReturnTicketFilter } from '@/lib/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface GetCollectionApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    content: T[];
    totalPages: number;
    totalCount: number;
    currentPage: number;
    limit: number;
  };
}

export const getReturnTickets = async (
  filter: ReturnTicketFilter,
  page: number = 1,
  limit: number = 10
) => {
  const params: Record<string, any> = { page, limit };
  if (filter.search) params.search = filter.search;
  if (filter.status) params.status = filter.status;
  if (filter.startDate) params.startDate = filter.startDate;
  if (filter.endDate) params.endDate = filter.endDate;
  if (filter.category) params.category = filter.category;

  const { data } = await api.get<GetCollectionApiResponse<ReturnTicket>>(
    '/return-tickets',
    { params }
  );

  return {
    returnTickets: data.data.content,
    totalPages: data.data.totalPages,
    totalCount: data.data.totalCount,
    currentPage: data.data.currentPage,
    limit: data.data.limit,
  };
};

export const getReturnTicketById = async (id: string) => {
  const { data } = await api.get<ApiResponse<ReturnTicket>>(
    `/return-tickets/${id}`
  );
  return data.data;
};

export const createReturnTicket = async (payload: Partial<ReturnTicket>) => {
  const { data } = await api.post<ApiResponse<ReturnTicket>>(
    '/return-tickets',
    payload
  );
  return data;
};

export const updateReturnTicket = async (
  id: string,
  payload: Partial<ReturnTicket> | FormData,
  config: any = {}
) => {
  const { data } = await api.put<ApiResponse<ReturnTicket>>(
    `/return-tickets/${id}`,
    payload,
    config
  );
  return data;
};

export const deleteReturnTicket = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/return-tickets/${id}`);
  return data;
};

export const getPODropdown = async () => {
  const { data } =
    await api.get<GetCollectionApiResponse<DeliveryTicket>>(
      '/delivery-tickets/po-dropdown'
    );
  return data.data;
};
export const getDeliveryTicketByPo = async (poNo: string) => {
  const { data } = await api.get<ApiResponse<any>>(
    `/return-tickets/by-po?poNo=${poNo}`
  );
  return data.data.deliveryTickets[0];
};

export const GetNextReturnTicketNo = async () => {
  const { data } =
    await api.get<ApiResponse<string>>(`/return-tickets/next-ticket-no`);
  return data;
};