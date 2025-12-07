import axiosClient from '@/utils/axiosClient';
import { apiUrl } from '@/utils/apiUrl';
import type { InvoicePayload } from '@/type/invoice';

export const invoiceService = {
  async list(params?: any) {
    const res = await axiosClient.get<any, any>(apiUrl('/api/invoices'), { params });
    return res || [];
  },
  async getById(id: number) {
    const res = await axiosClient.get<any, any>(apiUrl(`/api/invoices/${encodeURIComponent(String(id))}`));
    return res;
  },
  async create(payload: InvoicePayload) {
    const res = await axiosClient.post<any, any>(apiUrl('/api/invoices'), payload);
    return res;
  },
  async update(id: number, payload: InvoicePayload) {
    const res = await axiosClient.patch<any, any>(apiUrl(`/api/invoices/${encodeURIComponent(String(id))}`), payload);
    return res;
  },
  async remove(id: number) {
    const res = await axiosClient.delete<any, any>(apiUrl(`/api/invoices/${encodeURIComponent(String(id))}`));
    return res;
  },
};
