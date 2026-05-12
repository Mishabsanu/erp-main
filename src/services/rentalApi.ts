import api from '@/lib/api';

export interface RentalItemStat {
  productId: string;
  name: string;
  itemCode: string;
  orderedQty: number;
  deliveredQty: number;
  returnedQty: number;
  siteBalance: number;
  isClosed: boolean;
}

export interface Rental {
  _id: string;
  orderNumber: string;
  invoiceNumber: string;
  poNumber: string;
  companyName: string;
  clientName: string;
  orderedDate: string;
  projectLocation: string;
  status: 'Active' | 'Closed';
  itemStats: RentalItemStat[];
}

export interface RentalDetails {
  order: {
    _id: string;
    orderNumber: string;
    invoiceNumber: string;
    companyName: string;
    poNumber: string;
    projectLocation: string;
  };
  itemStats: RentalItemStat[];
  history: {
    deliveries: any[];
    returns: any[];
  };
}

export const getRentals = async (page: number = 1, limit: number = 10, search: string = "", status?: string) => {
  const { data } = await api.get('/rentals', {
    params: { page, limit, search, status }
  });
  return data.data;
};

export const getRentalDetails = async (id: string) => {
  const { data } = await api.get(`/rentals/${id}`);
  return data.data;
};
