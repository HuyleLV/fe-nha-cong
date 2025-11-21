import axiosClient from "@/utils/axiosClient";
import { apiUrl } from "@/utils/apiUrl";
import { Asset } from "@/type/asset";

export const assetService = {
  async getAll(params?: any): Promise<{ items: Asset[]; meta: any }> {
    const payload = await axiosClient.get<any, any>(apiUrl('/api/assets'), { params });
    return { items: payload?.items ?? [], meta: payload?.meta ?? { total: 0, page: 1, limit: 20, pageCount: 1 } };
  },

  async getById(id: number | string): Promise<Asset> {
    const payload = await axiosClient.get<any, any>(apiUrl(`/api/assets/${encodeURIComponent(String(id))}`));
    return (payload?.data ?? payload) as Asset;
  },

  async create(body: any): Promise<Asset> {
    const payload = await axiosClient.post<any, any>(apiUrl(`/api/assets`), body);
    return (payload?.data ?? payload) as Asset;
  },

  async update(id: number | string, body: any): Promise<Asset> {
    const payload = await axiosClient.patch<any, any>(apiUrl(`/api/assets/${encodeURIComponent(String(id))}`), body);
    return (payload?.data ?? payload) as Asset;
  },

  async remove(id: number | string): Promise<boolean> {
    const payload = await axiosClient.delete<any, any>(apiUrl(`/api/assets/${encodeURIComponent(String(id))}`));
    return (payload as any)?.success ?? true;
  },
};
