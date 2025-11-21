import axiosClient from "@/utils/axiosClient";
import { apiUrl } from "@/utils/apiUrl";
import { Bed } from "@/type/bed";

export const bedService = {
  async getAll(params?: any): Promise<{ items: Bed[]; meta: any }> {
    const payload = await axiosClient.get<any, any>(apiUrl('/api/beds'), { params });
    return { items: payload?.items ?? [], meta: payload?.meta ?? { total: 0, page: 1, limit: 20, pageCount: 1 } };
  },

  async getById(id: number | string): Promise<Bed> {
    const payload = await axiosClient.get<any, any>(apiUrl(`/api/beds/${encodeURIComponent(String(id))}`));
    return (payload?.data ?? payload) as Bed;
  },

  async create(body: any): Promise<Bed> {
    const payload = await axiosClient.post<any, any>(apiUrl(`/api/beds`), body);
    return (payload?.data ?? payload) as Bed;
  },

  async update(id: number | string, body: any): Promise<Bed> {
    const payload = await axiosClient.patch<any, any>(apiUrl(`/api/beds/${encodeURIComponent(String(id))}`), body);
    return (payload?.data ?? payload) as Bed;
  },

  async remove(id: number | string): Promise<boolean> {
    const payload = await axiosClient.delete<any, any>(apiUrl(`/api/beds/${encodeURIComponent(String(id))}`));
    return (payload as any)?.success ?? true;
  },
};
