import axiosClient from '@/utils/axiosClient';
import { apiUrl } from '@/utils/apiUrl';
import type { JobApplication, JobApplicationForm, JobApplicationUpdate } from '@/type/jobApplication';

export const jobApplicationService = {
  async apply(jobIdOrSlug: number | string, body: JobApplicationForm): Promise<JobApplication> {
    const payload = await axiosClient.post<any, any>(apiUrl(`/api/jobs/${encodeURIComponent(String(jobIdOrSlug))}/apply`), body);
    return (payload?.data ?? payload) as JobApplication;
  },
  async adminList(params?: { jobId?: number; page?: number; limit?: number; status?: string; q?: string }): Promise<{ items: JobApplication[]; meta: any }> {
    const payload = await axiosClient.get<any, any>(apiUrl('/api/admin/job-applications'), { params });
    const items: JobApplication[] = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload?.data) ? payload.data : [];
    const meta = payload?.meta ?? { page: params?.page||1, limit: params?.limit||items.length, total: items.length, totalPages: 1 };
    return { items, meta };
  },
  async adminGet(id: number): Promise<JobApplication> {
    const payload = await axiosClient.get<any, any>(apiUrl(`/api/admin/job-applications/${id}`));
    return (payload?.data ?? payload) as JobApplication;
  },
  async adminUpdate(id: number, body: JobApplicationUpdate): Promise<JobApplication> {
    const payload = await axiosClient.patch<any, any>(apiUrl(`/api/admin/job-applications/${id}`), body);
    return (payload?.data ?? payload) as JobApplication;
  },
  async adminRemove(id: number): Promise<boolean> {
    const payload = await axiosClient.delete<any, any>(apiUrl(`/api/admin/job-applications/${id}`));
    return (payload?.success ?? true) as boolean;
  },
  async adminCounts(jobIds: number[]): Promise<Record<number, { total: number; byStatus: Record<string, number> }>> {
    if (!jobIds.length) return {};
    const payload = await axiosClient.get<any, any>(apiUrl('/api/admin/job-applications/counts'), { params: { jobIds: jobIds.join(',') } });
    return payload?.data ?? payload;
  },
};
