import { User } from '../types';

export interface ApiResponse<T> {
  status: boolean;
  success: boolean;
  message: string;
  data: T;
  error?: string | string[];
}
export interface GetApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    content: T[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    role: 'admin' | 'sales' | 'finance';
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
