import api from '@/lib/api';
import { ApiResponse, GetApiResponse } from '@/lib/types/api';

export const getAllBreakups = async () => {
  const { data } = await api.get<ApiResponse<any>>('/payroll/breakups');
  return data.data.content;
};

export const getBreakupByUserId = async (userId: string) => {
  const { data } = await api.get<ApiResponse<any>>(`/payroll/breakups/${userId}`);
  return data.data.content;
};

export const upsertBreakup = async (payload: any) => {
  const { data } = await api.post<ApiResponse<any>>('/payroll/breakups', payload);
  return data;
};

export const getSlips = async (params: { month?: number; year?: number; user?: string } = {}) => {
  const { data } = await api.get<ApiResponse<any>>('/payroll/slips', { params });
  return data.data.content;
};

export const getSlipById = async (id: string) => {
  const { data } = await api.get<ApiResponse<any>>(`/payroll/slips/${id}`);
  return data.data.content;
};

export const generateSlip = async (payload: {
  user: string;
  month: number;
  year: number;
  paidDays: number;
  totalDays: number;
}) => {
  const { data } = await api.post<ApiResponse<any>>('/payroll/slips/generate', payload);
  return data;
};

export const deleteSlip = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/payroll/slips/${id}`);
  return data;
};
