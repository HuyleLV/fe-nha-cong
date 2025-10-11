// services/partnerService.ts
import { PartnerLead, PartnerQuery, PartnerForm } from "@/type/partners";
import { ApiResponse, PaginatedResponse, PaginationMeta } from "@/type/common";
import axiosClient from "@/utils/axiosClient";

export const partnerService = {
  async getAll(params?: PartnerQuery): Promise<{ items: PartnerLead[]; meta: PaginationMeta }> {
    const res = await axiosClient.get<PaginatedResponse<PartnerLead>>(
      "/api/partners",
      { params, validateStatus: () => true }
    );
    if (res.status >= 400) throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
    return { items: res.data.data, meta: res.data.meta };
  },

  async getById(id: number | string): Promise<PartnerLead> {
    const res = await axiosClient.get<ApiResponse<PartnerLead>>(
      `/api/partners/${id}`,
      { validateStatus: () => true }
    );
    if (res.status !== 200) throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
    return (res.data as any).data ?? (res.data as unknown as PartnerLead);
  },

  async create(payload: PartnerForm): Promise<PartnerLead> {
    const res = await axiosClient.post<ApiResponse<PartnerLead>>(
      "/api/partners",
      payload,
      { validateStatus: () => true }
    );
    if (res.status !== 201 && res.status !== 200)
      throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
    return (res.data as any).data ?? (res.data as unknown as PartnerLead);
  },

  async delete(id: number | string): Promise<boolean> {
    const res = await axiosClient.delete<ApiResponse<null>>(
      `/api/partners/${id}`,
      { validateStatus: () => true }
    );
    if (res.status !== 200 && res.status !== 204)
      throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
    return true;
  },
};
