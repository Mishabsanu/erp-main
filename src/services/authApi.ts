import api from '@/lib/api';
import { User } from '@/lib/types';
import { ApiResponse, LoginResponse } from '@/lib/types/api';

// 🔐 Login user
export const loginApi = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
    email,
    password,
  });
  return response.data.data;
};

// ♻️ Refresh JWT token (if expired)
export const refreshTokenApi = async () => {
  const { data } = await api.post('/auth/refresh-token');
  return data;
};

// 🚪 Logout user (clear cookies/session)
export const logoutApi = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

// 👤 Get current logged-in user
export const meApi = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>('/auth/me');
  return response.data.data;
};
