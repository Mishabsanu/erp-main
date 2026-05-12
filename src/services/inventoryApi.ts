import api from '@/lib/api';
import {
  CreateInventoryPayload,
  InventoryFilter,
  InventoryItem,
  InventoryResponse,
  PODropdownItem,
} from '@/lib/types';
import { ApiResponse, GetApiResponse } from '@/lib/types/api'; // Import from central types

export const getInventoryItems = async (
  filter: InventoryFilter,
  page: number = 1,
  limit: number = 10
) => {
  const params: Record<string, any> = { page, limit };
  if (filter.search) params.search = filter.search;
  if (filter.status) params.status = filter.status;
  if (filter.minStock) params.minStock = filter.minStock;
  if (filter.maxStock) params.maxStock = filter.maxStock;
  if (filter.vendor) params.vendor = filter.vendor;
  if (filter.customer) params.customer = filter.customer;
  if ((filter as any).onlyLowStock) params.onlyLowStock = (filter as any).onlyLowStock;

  const { data } = await api.get<GetApiResponse<InventoryItem>>('/inventory', {
    params,
  });

  return {
    inventoryItems: data?.data?.content || [],
    totalPages: data?.data?.totalPages || 1,
    totalCount: data?.data?.totalCount || 0,
    currentPage: data?.data?.currentPage || page,
    limit: data?.data?.limit || limit,
  };
};

export const getInventoryItemById = async (id: string) => {
  const { data } = await api.get<ApiResponse<InventoryItem>>(
    `/inventory/${id}`
  );
  return data.data; // Assuming data.data directly contains the InventoryItem
};

export const createInventoryItem = async (payload: CreateInventoryPayload) => {
  const formData = new FormData();
  
  // Append basic fields
  formData.append('date', payload.date);
  if (payload.poNo) formData.append('poNo', payload.poNo);
  if (payload.reference) formData.append('reference', payload.reference);
  if (payload.remarks) formData.append('remarks', payload.remarks);
  if (payload.vendor) formData.append('vendor', payload.vendor);
  
  // Append files
  if (payload.deliveryNote) formData.append('deliveryNote', payload.deliveryNote);
  if (payload.productImage) formData.append('productImage', payload.productImage);
  
  // Append items as JSON string
  formData.append('items', JSON.stringify(payload.items));

  const { data } = await api.post<ApiResponse<InventoryResponse[]>>(
    '/inventory',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data;
};

export const updateInventoryItem = async (
  id: string,
  payload: any
) => {
  const formData = new FormData();
  
  // Append fields if they exist
  if (payload.reference !== undefined) formData.append('reference', payload.reference);
  if (payload.remarks !== undefined) formData.append('remarks', payload.remarks);
  if (payload.poNo !== undefined) formData.append('poNo', payload.poNo);
  if (payload.vendor !== undefined) formData.append('vendor', payload.vendor);
  if (payload.itemCode !== undefined) formData.append('itemCode', payload.itemCode);
  if (payload.product !== undefined) formData.append('product', payload.product);
  if (payload.reorderLevel !== undefined) formData.append('reorderLevel', payload.reorderLevel.toString());
  if (payload.orderedQty !== undefined) formData.append('orderedQty', payload.orderedQty.toString());
  
  if (payload.deliveryNote instanceof File) {
    formData.append('deliveryNote', payload.deliveryNote);
  }
  if (payload.productImage instanceof File) {
    formData.append('productImage', payload.productImage);
  }

  const { data } = await api.put<ApiResponse<InventoryItem>>(
    `/inventory/${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data;
};

export const deleteInventoryItem = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/inventory/${id}`);
  return data;
};

export const getAvailableProducts = async (): Promise<PODropdownItem[]> => {
  const { data } = await api.get<ApiResponse<PODropdownItem[]>>(
    '/inventory/available-products'
  );
  return data.data;
};
