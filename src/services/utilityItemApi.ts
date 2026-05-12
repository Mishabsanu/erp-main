import api from '@/lib/api';

export interface UtilityItem {
  _id?: string;
  name: string;
  category: "Safety Gear" | "Uniform" | "Tools" | "Industrial Gear" | "Other";
  size: string;
  rate: number;
  quantity: number;
  minStockLevel: number;
  sku?: string;
  description?: string;
  isActive?: boolean;
}

export const getUtilityItems = async (params?: { category?: string; search?: string }) => {
  const response = await api.get("/utility-items", { params });
  return response.data;
};

export const getUtilityDropdown = async () => {
  const response = await api.get("/utility-items/dropdown");
  return response.data;
};

export const createUtilityItem = async (data: Partial<UtilityItem>) => {
  const response = await api.post("/utility-items", data);
  return response.data;
};

export const createBulkUtilityItems = async (data: { baseItem: Partial<UtilityItem>, variants: Partial<UtilityItem>[] }) => {
  const response = await api.post("/utility-items/bulk", data);
  return response.data;
};

export const updateUtilityItem = async (id: string, data: Partial<UtilityItem>) => {
  const response = await api.patch(`/utility-items/${id}`, data);
  return response.data;
};

export const deleteUtilityItem = async (id: string) => {
  const response = await api.delete(`/utility-items/${id}`);
  return response.data;
};
