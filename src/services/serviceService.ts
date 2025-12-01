import axiosClient from '@/utils/axiosClient';
import { apiUrl } from '@/utils/apiUrl';

export const serviceService = {
  async getAll(params?: any) {
    const payload: any = await axiosClient.get(apiUrl(`/api/services`), { params }) as any;
    // Normalize possible payload shapes into an array of items and meta
    let items: any[] = [];
    if (Array.isArray(payload)) items = payload;
    else if (Array.isArray(payload?.items)) items = payload.items;
    else if (Array.isArray(payload?.data)) items = payload.data;
    else if (Array.isArray(payload?.data?.items)) items = payload.data.items;
    else items = [];

    const meta = payload?.meta ?? payload?.data?.meta ?? {};
    return { items, meta };
  },
  async get(id: number) {
    const payload: any = await axiosClient.get(apiUrl(`/api/services/${id}`)) as any;
    return payload?.data ?? payload;
  },
  async create(data: any) {
    const payload: any = await axiosClient.post(apiUrl(`/api/services`), data) as any;
    return payload?.data ?? payload;
  },
  async update(id: number, data: any) {
    const payload: any = await axiosClient.patch(apiUrl(`/api/services/${id}`), data) as any;
    return payload?.data ?? payload;
  },
  async remove(id: number) {
    const payload: any = await axiosClient.delete(apiUrl(`/api/services/${id}`)) as any;
    return payload?.data ?? payload;
  }
};
