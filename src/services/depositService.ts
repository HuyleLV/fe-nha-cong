import axiosClient from '@/utils/axiosClient';
import { apiUrl } from '@/utils/apiUrl';

export const depositService = {
  async list(params?: any) {
    const res = await axiosClient.get<any, any>(apiUrl('/api/admin/deposits'), { params });
    return { data: res?.data ?? res, meta: res?.meta ?? {} };
  },
  async get(id: number) {
    const res = await axiosClient.get<any>(apiUrl(`/api/admin/deposits/${id}`));
    return res?.data ?? res;
  },
  async create(data: any) {
    const res = await axiosClient.post<any>(apiUrl('/api/admin/deposits'), data);
    return res?.data ?? res;
  },
  async update(id: number, data: any) {
    const res = await axiosClient.patch<any>(apiUrl(`/api/admin/deposits/${id}`), data);
    return res?.data ?? res;
  },
  async remove(id: number) {
    const res = await axiosClient.delete<any>(apiUrl(`/api/admin/deposits/${id}`));
    return res?.data ?? res;
  }
};
