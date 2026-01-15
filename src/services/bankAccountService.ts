import axiosClient from "@/utils/axiosClient";
import { apiUrl } from "@/utils/apiUrl";
import { PaginationMeta } from "@/type/common";

export type BankAccount = {
  id: number;
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  branch?: string | null;
  note?: string | null;
  isDefault?: boolean;
  balance?: number | string;
};

export const bankAccountService = {
  async hostList(params?: { page?: number; limit?: number; q?: string }): Promise<{ items: BankAccount[]; meta: PaginationMeta }> {
    const payload = await axiosClient.get(apiUrl(`/api/bank-accounts/host`), { params }) as any;
    const items: BankAccount[] = payload?.items ?? payload?.data ?? [];
    const m = payload?.meta ?? { page: params?.page ?? 1, limit: params?.limit ?? 20, total: items.length, totalPages: 1 };
    // normalize keys
    const meta: PaginationMeta = {
      page: Number(m.page ?? m.currentPage ?? 1),
      limit: Number(m.limit ?? m.perPage ?? 20),
      total: Number(m.total ?? m.totalCount ?? items.length ?? 0),
      totalPages: Number(m.pageCount ?? m.totalPages ?? Math.max(1, Math.ceil((Number(m.total ?? items.length ?? 0)) / Number(m.limit ?? 20))))
    };
    return { items, meta };
  },

  async hostGet(id: number): Promise<BankAccount> {
    const data = await axiosClient.get(apiUrl(`/api/bank-accounts/host/${id}`)) as any;
    return (data?.data ?? data) as BankAccount;
  },

  async hostCreate(payload: Partial<BankAccount> & { accountHolder: string; accountNumber: string; bankName: string; }): Promise<any> {
    return axiosClient.post(apiUrl(`/api/bank-accounts/host`), payload);
  },

  async hostUpdate(id: number, payload: Partial<BankAccount>): Promise<any> {
    return axiosClient.patch(apiUrl(`/api/bank-accounts/host/${id}`), payload);
  },

  async hostDelete(id: number): Promise<any> {
    return axiosClient.delete(apiUrl(`/api/bank-accounts/host/${id}`));
  },

  async hostBalances(): Promise<{ id: number; balance: number }[]> {
    const res = await axiosClient.get(apiUrl(`/api/bank-accounts/host/balances`));
    // Normalize: backend might return array or { data: [...] }
    const payload: any = res as any;
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (payload.data && Array.isArray(payload.data)) return payload.data;
    if (payload.items && Array.isArray(payload.items)) return payload.items;
    return [];
  },
  async hostDailyCashbook(params?: { start?: string; end?: string; page?: number; limit?: number }) {
    const res = await axiosClient.get(apiUrl(`/api/bank-accounts/host/daily-cashbook`), { params });
    const payload: any = res as any;
    // normalize possible shapes: array or { items, meta }
    if (Array.isArray(payload)) return { items: payload, meta: { page: params?.page ?? 1, limit: params?.limit ?? 20, total: payload.length } };
    if (Array.isArray(payload?.items)) return { items: payload.items, meta: payload.meta ?? { page: params?.page ?? 1, limit: params?.limit ?? 20, total: payload.items.length } };
    if (Array.isArray(payload?.data)) return { items: payload.data, meta: payload.meta ?? { page: params?.page ?? 1, limit: params?.limit ?? 20, total: payload.data.length } };
    return { items: [], meta: { page: params?.page ?? 1, limit: params?.limit ?? 20, total: 0 } };
  }
};
