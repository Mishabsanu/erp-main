import api from '@/lib/api';
import { ApiResponse } from '@/lib/types/api';
import { Vehicle, MechanicalCheckup } from '@/lib/types';

// --- VEHICLES ---
export const getVehicles = async (params?: any) => {
  const response = await api.get<{ data: { content: Vehicle[], totalCount: number, totalPages: number } }>('/fleet', { params });
  return response.data;
};

export const getVehicle = async (id: string) => {
  const response = await api.get<ApiResponse<Vehicle>>(`/fleet/${id}`);
  return response.data.data;
};

export const createVehicle = async (data: Partial<Vehicle>) => {
  const response = await api.post<ApiResponse<Vehicle>>('/fleet', data);
  return response.data.data;
};

export const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
  const response = await api.put<ApiResponse<Vehicle>>(`/fleet/${id}`, data);
  return response.data.data;
};

export const deleteVehicle = async (id: string) => {
  const response = await api.delete<ApiResponse<any>>(`/fleet/${id}`);
  return response.data;
};

export const getVehicleDropdown = async () => {
  const response = await api.get<ApiResponse<any[]>>('/fleet/dropdown');
  return response.data.data;
};

// --- MECHANICAL CHECKUPS ---
export const getMechanicalLogs = async (params?: any) => {
  const response = await api.get<{ data: { content: MechanicalCheckup[], totalCount: number } }>('/fleet/mechanical/logs', { params });
  return response.data;
};

export const createMechanicalCheckup = async (formData: FormData) => {
  const response = await api.post<ApiResponse<MechanicalCheckup>>('/fleet/mechanical/checkup', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const getCheckupDetails = async (id: string) => {
  const response = await api.get<ApiResponse<MechanicalCheckup>>(`/fleet/mechanical/logs/${id}`);
  return response.data.data;
};

export const getLastCheckup = async (vehicleId: string) => {
  const response = await api.get<ApiResponse<MechanicalCheckup>>(`/fleet/mechanical/last/${vehicleId}`);
  return response.data.data;
};

export const deleteMechanicalCheckup = async (id: string) => {
  const response = await api.delete<ApiResponse<any>>(`/fleet/mechanical/logs/${id}`);
  return response.data;
};
