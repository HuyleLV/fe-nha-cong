import axiosClient from '@/utils/axiosClient';
import { apiUrl } from '@/utils/apiUrl';

export const thuChiService = {
  async list(params?: any) {
    const res = await axiosClient.get<any, any>(apiUrl('/api/thu-chi'), { params });
    return res || [];
  },
  async getById(id: number) {
    const res = await axiosClient.get<any, any>(apiUrl(`/api/thu-chi/${encodeURIComponent(String(id))}`));
    return res;
  },
  async create(payload: any) {
    const res = await axiosClient.post<any, any>(apiUrl('/api/thu-chi'), payload);
    return res;
  },
  async update(id: number, payload: any) {
    const res = await axiosClient.patch<any, any>(apiUrl(`/api/thu-chi/${encodeURIComponent(String(id))}`), payload);
    return res;
  },
  async remove(id: number) {
    const res = await axiosClient.delete<any, any>(apiUrl(`/api/thu-chi/${encodeURIComponent(String(id))}`));
    return res;
  },
};
