import api from '@/lib/api';
import { Sale, SaleFilter } from '@/lib/types';
import { ApiResponse, GetApiResponse } from '@/lib/types/api';

export const getSales = async (
  filter: SaleFilter,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const params: Record<string, any> = {
      page,
      limit,
    };
    if (filter.search) params.search = filter.search;
    if (filter.status) params.status = filter.status;
    if (filter.startDate) params.startDate = filter.startDate;
    if (filter.endDate) params.endDate = filter.endDate;
    if (filter.nextFollowUpDate) params.nextFollowUpDate = filter.nextFollowUpDate;

    const { data } = await api.get<GetApiResponse<Sale>>('/sales', {
      params,
    });

    return {
      sales: data?.data?.content || [],
      totalPages: data?.data?.totalPages || 1,
      totalCount: data?.data?.totalCount || 0,
    };
  } catch (error) {
    console.error('Error fetching sales:', error);
    return {
      sales: [],
      totalPages: 1,
      totalCount: 0,
    };
  }
};

export const getSalesStats = async (filter: SaleFilter) => {
  const params: Record<string, any> = {};
  if (filter.search) params.search = filter.search;
  if (filter.startDate) params.startDate = filter.startDate;
  if (filter.endDate) params.endDate = filter.endDate;
  if (filter.nextFollowUpDate) params.nextFollowUpDate = filter.nextFollowUpDate;

  const { data } = await api.get<ApiResponse<Record<string, number>>>(
    '/sales/stats',
    { params }
  );
  return data.data;
};

export const getLastEnquiries = async (searchKey?: string) => {
  const { data } = await api.get<ApiResponse<Sale[]>>('/sales/last-enquiries', {
    params: { search: searchKey },
  });
  return data.data;
};

export const createSale = async (formData: FormData) => {
  const { data } = await api.post<ApiResponse<Sale>>('/sales', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateSale = async (id: string, formData: FormData) => {
  const { data } = await api.put<ApiResponse<Sale>>(`/sales/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getSaleById = async (id: string) => {
  const { data } = await api.get<ApiResponse<Sale>>(`/sales/${id}`);
  return data.data;
};

export const deleteSale = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/sales/${id}`);
  return data;
};

export const updateSaleStatus = async (
  id: string,
  payload: {
    status: string;
    nextFollowUpDate?: string;
    remarks?: string;
  }
) => {
  const { data } = await api.patch<ApiResponse<any>>(
    `/sales/${id}/update-status`,
    payload
  );
  return data;
};

export const addFollowUp = async (
  saleId: string,
  payload: {
    status: string;
    notes?: string;
    remarks?: string;
    nextFollowUpDate?: string;
  }
) => {
  const { data } = await api.post<ApiResponse<Sale>>(
    `/sales/${saleId}/follow-up`,
    payload
  );
  return data;
};


export const importSalesFromGoogleSheet = async (url: string) => {
  const res = await api.post('/sales/import/google-sheet', { url });
  return res.data;
};

export const importSalesFromCsv = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/sales/import/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getNextTicketNo = async () => {
  const res = await api.get('/sales/ticket/no');
  return res.data?.data?.ticketNo;
};
