import api from '@/lib/api';
import { DeliveryTicket, DeliveryTicketFilter } from '@/lib/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface GetDeliveryTicketsApiResponse {
  success: boolean;
  message: string;
  data: {
    content: DeliveryTicket[];
    totalPages: number;
    totalCount: number;
    currentPage: number;
    limit: number;
  };
}

export const getDeliveryTickets = async (
  filter: DeliveryTicketFilter,
  page: number = 1,
  limit: number = 10
) => {
  const params: Record<string, any> = { page, limit };
  if (filter.search) params.search = filter.search;
  if (filter.status) params.status = filter.status;
  if (filter.startDate) params.startDate = filter.startDate;
  if (filter.endDate) params.endDate = filter.endDate;
  if (filter.category) params.category = filter.category;

  const { data } = await api.get<GetDeliveryTicketsApiResponse>(
    '/delivery-tickets',
    { params }
  );

  return {
    deliveryTickets: data.data.content,
    totalPages: data.data.totalPages,
    totalCount: data.data.totalCount,
    currentPage: data.data.currentPage,
    limit: data.data.limit,
  };
};

export const getDeliveryTicketById = async (id: string) => {
  const { data } = await api.get<ApiResponse<DeliveryTicket>>(
    `/delivery-tickets/${id}`
  );
  return data.data;
};

export const createDeliveryTicket = async (payload: any) => {
  const { data } = await api.post<ApiResponse<any>>(
    '/delivery-tickets',
    payload
  );
  return data;
};

export const updateDeliveryTicket = async (
  id: string,
  payload: Partial<DeliveryTicket> | FormData,
  config: any = {}
) => {
  const { data } = await api.put<ApiResponse<DeliveryTicket>>(
    `/delivery-tickets/${id}`,
    payload,
    config
  );
  return data;
};
export const GetNextDeliveryTicketNo = async () => {
  const { data } =
    await api.get<ApiResponse<string>>(`/delivery-tickets/next-ticket-no`);
  return data;
};

export const deleteDeliveryTicket = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(
    `/delivery-tickets/${id}`
  );
  return data;
};
