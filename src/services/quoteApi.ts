import api from '@/lib/api';
import { QuoteTrackFilter } from '@/lib/types';
import { ApiResponse, GetApiResponse } from '@/lib/types/api';

export const getQuoteTracks = async (
  filter: QuoteTrackFilter,
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

    const { data } = await api.get<GetApiResponse<any>>('/quote-tracks', {
      params,
    });

    console.log('--- DEBUG: quote-tracks data ---', data);


    return {
      quoteTracks: data?.data?.content || [],
      totalPages: data?.data?.totalPages || 1,
      totalCount: data?.data?.totalCount || 0,
      currentPage: data?.data?.currentPage || page,
      limit: data?.data?.limit || limit,
    };
  } catch (error) {
    console.error('Error fetching quote tracks:', error);
    return {
      quoteTracks: [],
      totalPages: 1,
      totalCount: 0,
      currentPage: page,
      limit,
    };
  }
};

export const createQuoteTrack = async (payload: any) => {
  const { data } = await api.post<ApiResponse<any>>('/quote-tracks', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateQuoteTrack = async (id: string, payload: any) => {
  const { data } = await api.put<ApiResponse<any>>(
    `/quote-tracks/${id}`,
    payload,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

export const getQuoteTrackById = async (id: string) => {
  const { data } = await api.get<ApiResponse<any>>(`/quote-tracks/${id}`);
  return data.data.content;
};

export const deleteQuoteTrack = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/quote-tracks/${id}`);
  return data;
};

export const updateQuoteTrackStatusApi = async (id: string, status: string) => {
  const { data } = await api.patch<ApiResponse<any>>(`/quote-tracks/${id}/status`, { status });
  return data;
};

export const importQuoteTrackFromGoogleSheet = async (url: string) => {
  const { data } = await api.post<ApiResponse<any>>('/quote-tracks/import/google-sheet', { url });
  return data;
};

export const importQuoteTrackFromCsv = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<ApiResponse<any>>('/quote-tracks/import/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
