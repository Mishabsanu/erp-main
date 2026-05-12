import api from '@/lib/api';
import { ApiResponse } from '@/lib/types/api';

export interface AttendanceRecord {
  _id: string;
  user: string;
  date: string;
  signInTime: string;
  signOutTime?: string;
  sessions?: { startTime: string; endTime?: string; duration?: number }[];
  totalDuration?: number;
  status: 'present' | 'absent' | 'half-day';
  history: { action: string; timestamp: string }[];
}

export type AttendanceStatusResponse = {
  status: 'signed_in' | 'signed_out' | 'not_signed_in';
  data: AttendanceRecord | null;
  attendanceStartDate?: string;
};

// 🕒 Get today's attendance status
export const getAttendanceStatus = async (): Promise<AttendanceStatusResponse> => {
  const response = await api.get<AttendanceStatusResponse>('/attendance/status');
  return response.data;
};

// 🟢 Sign In
export const signInApi = async (): Promise<AttendanceRecord> => {
  const response = await api.post<ApiResponse<AttendanceRecord>>('/attendance/signin');
  return response.data.data;
};

// 🔴 Sign Out
export const signOutApi = async (): Promise<AttendanceRecord> => {
  const response = await api.post<ApiResponse<AttendanceRecord>>('/attendance/signout');
  return response.data.data;
};

// 📅 Get Attendance History
export const getAttendanceHistory = async (startDate?: string, endDate?: string): Promise<AttendanceRecord[]> => {
  const response = await api.get<{ data: AttendanceRecord[] }>('/attendance/history', {
    params: { startDate, endDate },
  });
  return response.data.data;
};

export interface RegularizationRequest {
  _id: string;
  user: { _id: string; name: string };
  date: string;
  type: string;
  note: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedOn: string;
  comments: { user: { name: string }; text: string; timestamp: string }[];
  lastActionBy?: { name: string };
  lastActionOn?: string;
  createdBy?: string | { _id: string; name: string };
}

// 📝 Request Attendance Regularization
export const requestRegularizationApi = async (date: string, note: string): Promise<RegularizationRequest> => {
  const response = await api.post<ApiResponse<RegularizationRequest>>('/attendance/regularization-request', {
    date,
    note,
  });
  return response.data.data;
};

// 📋 Get Regularization Requests
export const getRegularizationRequestsApi = async (): Promise<RegularizationRequest[]> => {
  const response = await api.get<{ data: RegularizationRequest[] }>('/attendance/regularization-requests');
  return response.data.data;
};

// 💬 Add Comment to Regularization Request
export const addRegularizationCommentApi = async (id: string, text: string): Promise<RegularizationRequest> => {
  const response = await api.post<ApiResponse<RegularizationRequest>>(`/attendance/regularization-request/${id}/comment`, {
    text,
  });
  return response.data.data;
};

// 👮 Admin: Get Daily Status Report (All Users)
export const getAdminAttendanceStatus = async (date?: string): Promise<{ data: any[], stats: any }> => {
  const response = await api.get<{ data: any[], stats: any }>('/attendance/admin/status', {
    params: { date }
  });
  return response.data;
};

// 📅 Admin: Get Range Report (Weekly/Monthly)
export const getAdminAttendanceRange = async (startDate: string, endDate: string): Promise<{ data: any[], range: string[] }> => {
  const response = await api.get<{ data: any[], range: string[] }>('/attendance/admin/range', {
    params: { startDate, endDate },
  });
  return response.data;
};
