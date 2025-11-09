import { Job, JobStatus } from '@/type/job';
import axiosClient from '@/utils/axiosClient';
import { apiUrl } from '@/utils/apiUrl';
import { PaginationMeta } from '@/type/common';

export type JobQuery = { page?: number; limit?: number; q?: string; status?: JobStatus };

/** Normalize list payload to { items, meta } like other services */
function normalizeList(payload: any, fallbackPage: number, fallbackLimit: number) {
  const items: Job[] = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload) ? payload : [];
  const meta: PaginationMeta = payload?.meta ?? {
    page: fallbackPage,
    limit: fallbackLimit,
    total: items.length,
    totalPages: 1,
  };
  return { items, meta };
}

export const jobService = {
  /** Public list GET /api/jobs */
  async list(params?: JobQuery): Promise<{ items: Job[]; meta: PaginationMeta }> {
    try {
      const payload = await axiosClient.get<any, any>(apiUrl('/api/jobs'), { params });
      return normalizeList(payload, Number(params?.page || 1), Number(params?.limit || 20));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách tuyển dụng';
      throw new Error(msg);
    }
  },

  /** Public detail GET /api/jobs/:idOrSlug → entity or { data: entity } */
  async get(idOrSlug: string | number): Promise<Job> {
    try {
      const payload = await axiosClient.get<any, any>(apiUrl(`/api/jobs/${encodeURIComponent(String(idOrSlug))}`));
      return (payload?.data ?? payload) as Job;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tải tin tuyển dụng';
      throw new Error(msg);
    }
  },

  /** Admin list GET /api/admin/jobs */
  async adminList(params?: JobQuery): Promise<{ items: Job[]; meta: PaginationMeta }> {
    try {
      const payload = await axiosClient.get<any, any>(apiUrl('/api/admin/jobs'), { params });
      return normalizeList(payload, Number(params?.page || 1), Number(params?.limit || 20));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách (admin)';
      throw new Error(msg);
    }
  },

  /** Admin create POST /api/admin/jobs */
  async create(body: Partial<Job>): Promise<Job> {
    try {
      const payload = await axiosClient.post<any, any>(apiUrl('/api/admin/jobs'), body);
      return (payload?.data ?? payload) as Job;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tạo tin tuyển dụng';
      throw new Error(msg);
    }
  },

  /** Admin update PATCH /api/admin/jobs/:id */
  async update(id: number | string, body: Partial<Job>): Promise<Job> {
    try {
      const payload = await axiosClient.patch<any, any>(apiUrl(`/api/admin/jobs/${encodeURIComponent(String(id))}`), body);
      return (payload?.data ?? payload) as Job;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể cập nhật tin tuyển dụng';
      throw new Error(msg);
    }
  },

  /** Admin delete DELETE /api/admin/jobs/:id */
  async remove(id: number | string): Promise<boolean> {
    try {
      const payload = await axiosClient.delete<any, any>(apiUrl(`/api/admin/jobs/${encodeURIComponent(String(id))}`));
      return (payload?.success ?? true) as boolean;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xoá tin tuyển dụng';
      throw new Error(msg);
    }
  },
};
