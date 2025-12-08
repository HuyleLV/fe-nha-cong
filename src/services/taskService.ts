import axiosClient from '@/utils/axiosClient';
import { apiUrl } from '@/utils/apiUrl';

const base = '/api/tasks';

export const taskService = {
  async list(params?: any) {
    const res = await axiosClient.get<any, any>(apiUrl(base), { params });
    return res || { items: [], meta: {} };
  },
  async getById(id: number) {
    const res = await axiosClient.get<any, any>(apiUrl(`${base}/${encodeURIComponent(String(id))}`));
    return res;
  },
  async create(payload: any) {
    const res = await axiosClient.post<any, any>(apiUrl(base), payload);
    return res;
  },
  async update(id: number, payload: any) {
    const res = await axiosClient.patch<any, any>(apiUrl(`${base}/${encodeURIComponent(String(id))}`), payload);
    return res;
  },
  async remove(id: number) {
    const res = await axiosClient.delete<any, any>(apiUrl(`${base}/${encodeURIComponent(String(id))}`));
    return res;
  },
};
