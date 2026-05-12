import api from '@/lib/api';
import { 
  Account, AccountFilter, 
  Expense, ExpenseFilter, 
  Invoice, InvoiceFilter, 
  Payment, PaymentFilter, 
  LedgerEntry, LedgerFilter 
} from '@/lib/types';
import { ApiResponse, GetApiResponse } from '@/lib/types/api';

// --- Accounts ---
export const getAccountById = async (id: string) => {
  const { data } = await api.get<ApiResponse<Account>>(`/finance/accounts/${id}`);
  return data.data;
};

export const deleteAccount = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/finance/accounts/${id}`);
  return data;
};

export const getAccounts = async (filter: AccountFilter, page = 1, limit = 100, signal?: AbortSignal) => {
  const params: any = { page, limit, ...filter };
  const { data } = await api.get<GetApiResponse<Account>>('/finance/accounts', { params, signal });
  return {
    accounts: data?.data?.content || [],
    totalCount: data?.data?.totalCount || 0,
    totalPages: data?.data?.totalPages || 1
  };
};

export const createAccount = async (payload: Account) => {
  const { data } = await api.post<ApiResponse<Account>>('/finance/accounts', payload);
  return data;
};

export const updateAccount = async (id: string, payload: Account) => {
  const { data } = await api.put<ApiResponse<Account>>(`/finance/accounts/${id}`, payload);
  return data;
};

// --- Expenses ---
export const getExpenseById = async (id: string) => {
  const { data } = await api.get<ApiResponse<Expense>>(`/finance/expenses/${id}`);
  return data.data;
};

export const deleteExpense = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/finance/expenses/${id}`);
  return data;
};

export const getExpenses = async (filter: ExpenseFilter, page = 1, limit = 10, signal?: AbortSignal) => {
  const params: any = { page, limit, ...filter };
  const { data } = await api.get<GetApiResponse<Expense>>('/finance/expenses', { params, signal });
  return {
    expenses: data?.data?.content || [],
    totalCount: data?.data?.totalCount || 0,
    totalPages: data?.data?.totalPages || 1
  };
};

export const getNextExpenseId = async () => {
    const { data } = await api.get<ApiResponse<{nextId: string}>>('/finance/expenses/next-id');
    return data.data.nextId;
};

export const createExpense = async (formData: any) => {
  const { data } = await api.post<ApiResponse<Expense>>('/finance/expenses', formData);
  return data;
};

export const updateExpense = async (id: string, formData: any) => {
  const { data } = await api.put<ApiResponse<Expense>>(`/finance/expenses/${id}`, formData);
  return data;
};

export const approveExpense = async (id: string) => {
  const { data } = await api.patch<ApiResponse<Expense>>(`/finance/expenses/${id}/approve`);
  return data;
};

// --- Invoices ---
export const getInvoiceById = async (id: string) => {
  const { data } = await api.get<ApiResponse<Invoice>>(`/finance/invoices/${id}`);
  return data.data;
};

export const deleteInvoice = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/finance/invoices/${id}`);
  return data;
};

export const getInvoices = async (filter: InvoiceFilter, page = 1, limit = 10, signal?: AbortSignal) => {
  const params: any = { page, limit, ...filter };
  const { data } = await api.get<GetApiResponse<Invoice>>('/finance/invoices', { params, signal });
  return {
    invoices: data?.data?.content || [],
    totalCount: data?.data?.totalCount || 0,
    totalPages: data?.data?.totalPages || 1
  };
};

export const createInvoice = async (payload: Invoice) => {
  const { data } = await api.post<ApiResponse<Invoice>>('/finance/invoices', payload);
  return data;
};

export const updateInvoice = async (id: string, payload: Invoice) => {
  const { data } = await api.put<ApiResponse<Invoice>>(`/finance/invoices/${id}`, payload);
  return data;
};

// --- Payments ---
export const getPaymentById = async (id: string) => {
  const { data } = await api.get<ApiResponse<Payment>>(`/finance/payments/${id}`);
  return data.data;
};

export const deletePayment = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/finance/payments/${id}`);
  return data;
};

export const getPayments = async (filter: PaymentFilter, page = 1, limit = 10, signal?: AbortSignal) => {
  const params: any = { page, limit, ...filter };
  const { data } = await api.get<GetApiResponse<Payment>>('/finance/payments', { params, signal });
  return {
    payments: data?.data?.content || [],
    totalCount: data?.data?.totalCount || 0,
    totalPages: data?.data?.totalPages || 1
  };
};

export const getNextPaymentId = async () => {
    const { data } = await api.get<ApiResponse<{nextId: string}>>('/finance/payments/next-id');
    return data.data.nextId;
};

export const createPayment = async (payload: any) => {
  const { data } = await api.post<ApiResponse<Payment>>('/finance/payments', payload);
  return data;
};

export const updatePayment = async (id: string, payload: any) => {
  const { data } = await api.put<ApiResponse<Payment>>(`/finance/payments/${id}`, payload);
  return data;
};

// --- Ledger ---
export const getLedger = async (filter: LedgerFilter, page = 1, limit = 50, signal?: AbortSignal) => {
  const params: any = { page, limit, ...filter };
  const { data } = await api.get<GetApiResponse<LedgerEntry>>('/finance/ledger', { params, signal });
  return {
    entries: data?.data?.content || [],
    totalCount: data?.data?.totalCount || 0,
    totalPages: data?.data?.totalPages || 1,
    totalDebit: (data?.data as any)?.totalDebit || 0,
    totalCredit: (data?.data as any)?.totalCredit || 0,
    openingBalance: (data?.data as any)?.openingBalance || 0,
    closingBalance: (data?.data as any)?.closingBalance || 0
  };
};

export const getFinanceStats = async () => {
  const { data } = await api.get('/finance/dashboard');
  return data.data;
};
