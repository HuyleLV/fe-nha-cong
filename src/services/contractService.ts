import axiosClient from '@/utils/axiosClient';
import { apiUrl } from '@/utils/apiUrl';

export const contractService = {
  async list(params?: any): Promise<{ data: any[]; meta: any }> {
    const payload: any = await axiosClient.get(apiUrl(`/api/contracts`), { params }) as any;
    // Normalize possible payload shapes returned by various backends/interceptors
    let data: any[] = [];
    if (Array.isArray(payload)) data = payload;
    else if (Array.isArray(payload?.data)) data = payload.data;
    else if (Array.isArray(payload?.items)) data = payload.items;
    else if (Array.isArray(payload?.data?.items)) data = payload.data.items;
    else data = [];
    const meta = payload?.meta ?? payload?.data?.meta ?? payload?.meta ?? {};
    return { data, meta };
  },
  async stats(): Promise<any> {
    const payload: any = await axiosClient.get(apiUrl(`/api/contracts/stats`)) as any;
    return payload?.data ?? payload;
  },
  async get(id: number) {
    const payload: any = await axiosClient.get(apiUrl(`/api/contracts/${id}`)) as any;
    return payload?.data ?? payload;
  },
  async create(data: any) {
    const payload: any = await axiosClient.post(apiUrl(`/api/contracts`), data) as any;
    return payload?.data ?? payload;
  },
  async update(id: number, data: any) {
    const payload: any = await axiosClient.patch(apiUrl(`/api/contracts/${id}`), data) as any;
    return payload?.data ?? payload;
  },
  async remove(id: number) {
    const payload: any = await axiosClient.delete(apiUrl(`/api/contracts/${id}`)) as any;
    return payload?.data ?? payload;
  }
};
