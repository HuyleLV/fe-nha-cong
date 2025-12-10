import axiosClient from '@/utils/axiosClient';
import { apiUrl } from '@/utils/apiUrl';

export const meterReadingService = {
  async create(payload: any) {
    const res = await axiosClient.post<any, any>(apiUrl('/api/meter-readings'), payload);
    return res;
  },

  async list(params?: any) {
    const res = await axiosClient.get<any, any>(apiUrl('/api/meter-readings'), { params });
    return res || [];
  },
  async getById(id: number) {
    const res = await axiosClient.get<any, any>(apiUrl(`/api/meter-readings/${encodeURIComponent(String(id))}`));
    return res;
  },
  async update(id: number, payload: any) {
    const res = await axiosClient.patch<any, any>(apiUrl(`/api/meter-readings/${encodeURIComponent(String(id))}`), payload);
    return res;
  },
  async remove(id: number) {
    const res = await axiosClient.delete<any, any>(apiUrl(`/api/meter-readings/${encodeURIComponent(String(id))}`));
    return res;
  },
  async getLatestByApartment(apartmentId: number, meterType: 'electricity' | 'water') {
    const qs = `apartmentId=${encodeURIComponent(String(apartmentId))}&meterType=${encodeURIComponent(meterType)}`;
    const res = await axiosClient.get<any, any>(apiUrl(`/api/meter-readings/latest/by-apartment?${qs}`));
    return res;
  }
,
  async stats() {
    const res = await axiosClient.get<any, any>(apiUrl('/api/meter-readings/stats'));
    return res;
  }
,
  async approve(id: number, approve: boolean) {
    const res = await axiosClient.patch<any, any>(apiUrl(`/api/meter-readings/${encodeURIComponent(String(id))}/approve`), { approve });
    return res;
  }
};
