import api from '@/lib/api';
import { Customer, CustomerFilter } from '@/lib/types';

// This is a placeholder for the actual API response structure.
// In a real app, this should be defined in a central types file.
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

export const getCustomers = async (
  filter: CustomerFilter,
  page: number = 1,
  limit: number = 10
) => {
  const params: Record<string, any> = { page, limit };
  if (filter.search) params.search = filter.search;
  if (filter.status) params.status = filter.status;

  // NOTE: This will fail until the /api/customers endpoint is created.
  const { data } = await api.get<GetCollectionApiResponse<Customer>>(
    '/customers',
    { params }
  );
  return {
    customers: data?.data?.content || [],
    totalPages: data?.data?.totalPages || 1,
    totalCount: data?.data?.totalCount || 0,
    currentPage: data?.data?.currentPage || page,
    limit: data?.data?.limit || limit,
  };
};

export const getCustomerDropdown = async () => {
    const { data } = await api.get<ApiResponse<any[]>>('/customers/dropdown');
    return data;
};

export const getCustomerById = async (id: string) => {
  const { data } = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
  return data.data;
};

export const createCustomer = async (payload: Omit<Customer, '_id'>) => {
  const { data } = await api.post<ApiResponse<Customer>>('/customers', payload);
  return data;
};

export const updateCustomer = async (
  id: string,
  payload: Partial<Customer>
) => {
  const { data } = await api.put<ApiResponse<Customer>>(
    `/customers/${id}`,
    payload
  );
  return data;
};

export const deleteCustomer = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/customers/${id}`);
  return data;
};
