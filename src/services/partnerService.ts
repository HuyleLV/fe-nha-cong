// services/partnerService.ts
import { PartnerLead, PartnerQuery, PartnerForm } from "@/type/partners";
import { PaginationMeta } from "@/type/common";
import axiosClient from "@/utils/axiosClient";

function normalizeList<T = any>(payload: any, params?: { page?: number; limit?: number }) {
  const items: T[] = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

  const meta: PaginationMeta = payload?.meta ?? {
    page: Number(params?.page ?? 1) || 1,
    limit: Number(params?.limit ?? (items.length || 10)) || 10,
    total: items.length,
    totalPages: 1,
  };

  return { items, meta } as { items: T[]; meta: PaginationMeta };
}

export const partnerService = {
  async getAll(params?: PartnerQuery): Promise<{ items: PartnerLead[]; meta: PaginationMeta }>
  {
    try {
      const payload = await axiosClient.get<any, any>("/api/partners", { params });
      return normalizeList<PartnerLead>(payload, params);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tải danh sách đối tác";
      throw new Error(msg);
    }
  },

  async getById(id: number | string): Promise<PartnerLead> {
    try {
      const payload = await axiosClient.get<any, any>(`/api/partners/${encodeURIComponent(String(id))}`);
      return (payload?.data ?? payload) as PartnerLead;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tải đối tác";
      throw new Error(msg);
    }
  },

  async create(body: PartnerForm): Promise<PartnerLead> {
    try {
      const payload = await axiosClient.post<any, any>("/api/partners", body);
      return (payload?.data ?? payload) as PartnerLead;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tạo đối tác";
      throw new Error(msg);
    }
  },

  async delete(id: number | string): Promise<boolean> {
    try {
      await axiosClient.delete<any, any>(`/api/partners/${encodeURIComponent(String(id))}`);
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể xoá đối tác";
      throw new Error(msg);
    }
  },
};
