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
};
