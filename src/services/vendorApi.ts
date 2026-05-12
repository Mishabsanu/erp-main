import api from '@/lib/api';
import { Vendor, VendorFilter } from '@/lib/types';

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

export const getVendors = async (
  filter: VendorFilter,
  page: number = 1,
  limit: number = 10
) => {
  const params: Record<string, any> = { page, limit };
  if (filter.search) params.search = filter.search;
  if (filter.status) params.status = filter.status;
  const { data } = await api.get<GetCollectionApiResponse<Vendor>>('/vendors', {
    params,
  });
  return {
    vendors: data?.data?.content || [],
    totalPages: data?.data?.totalPages || 1,
    totalCount: data?.data?.totalCount || 0,
    currentPage: data?.data?.currentPage || page,
    limit: data?.data?.limit || limit,
  };
};
export const getVendorDropdown = async () => {
  const { data } = await api.get<ApiResponse<any[]>>('/vendors/dropdown');
  return data;
};
export const getVendorById = async (id: string) => {
  const { data } = await api.get<ApiResponse<Vendor>>(`/vendors/${id}`);
  return data.data;
};

export const createVendor = async (payload: Omit<Vendor, '_id'>) => {
  const { data } = await api.post<ApiResponse<Vendor>>('/vendors', payload);
  return data;
};

export const updateVendor = async (id: string, payload: Partial<Vendor>) => {
  const { data } = await api.put<ApiResponse<Vendor>>(
    `/vendors/${id}`,
    payload
  );
  return data;
};

export const deleteVendor = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/vendors/${id}`);
  return data;
};
