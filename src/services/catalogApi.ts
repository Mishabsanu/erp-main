import api from '@/lib/api';
import { PODropdownItem, ProductFilter } from '@/lib/types';
import { ApiResponse, GetApiResponse } from '@/lib/types/api';

export const getCatalog = async (
  filter: ProductFilter,
  page: number = 1,
  limit: number = 10
) => {
  const params: Record<string, any> = {
    page,
    limit,
  };
  if (filter.search) params.search = filter.search;

  if (filter.status) params.status = filter.status;
  const { data } = await api.get<GetApiResponse<any>>('/products', {
    params,
  });
  return {
    products: data?.data?.content || [],
    totalPages: data?.data?.totalPages || 1,
    totalCount: data?.data?.totalCount || 0,
    currentPage: data?.data?.currentPage || page,
    limit: data?.data?.limit || limit,
  };
};

export const createProduct = async (payload: any) => {
  const { data } = await api.post<ApiResponse<any>>('/products', payload);
  return data;
};

export const updateProduct = async (id: string, payload: any) => {
  const { data } = await api.put<ApiResponse<any>>(`/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/products/${id}`);
  return data;
};

export const getProductDropdown = async (): Promise<PODropdownItem[]> => {
  const { data } =
    await api.get<ApiResponse<PODropdownItem[]>>('/products/dropdown');
  return data.data;
};

export const getProductById = async (id: string) => {
  const { data } = await api.get<ApiResponse<any>>(`/products/${id}`);
  return data.data.content;
};

export const getProductHistory = async (id: string) => {
  const { data } = await api.get<ApiResponse<any>>(`/products/${id}/history`);
  return data.data;
};

export const bulkImportProducts = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<ApiResponse<any>>('/products/import/csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const importProductsFromGoogleSheet = async (url: string) => {
  const response = await api.post<ApiResponse<any>>('/products/import/google-sheet', { url });
  return response.data;
};

export const getProductsCount = async () => {
  const { data } = await api.get<ApiResponse<number>>('/products/count');
  return data.data;
};
export const updateQuoteStatus = async (id: string, status: string) => {
  const { data } = await api.patch(`/quote-track/${id}/status`, { status });
  return data;
};
