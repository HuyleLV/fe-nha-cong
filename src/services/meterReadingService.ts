import axiosClient from '@/utils/axiosClient';
import { apiUrl } from '@/utils/apiUrl';

export const meterReadingService = {
  async create(payload: any) {
    const res = await axiosClient.post<any, any>(apiUrl('/api/meter-readings'), payload);
    return res;
  },

  async list() {
    const res = await axiosClient.get<any, any>(apiUrl('/api/meter-readings'));
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
};
