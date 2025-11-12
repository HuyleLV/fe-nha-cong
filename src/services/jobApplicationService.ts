import axiosClient from '@/utils/axiosClient';
import { apiUrl } from '@/utils/apiUrl';
import type { JobApplication, JobApplicationForm } from '@/type/jobApplication';

export const jobApplicationService = {
  async apply(jobIdOrSlug: number | string, body: JobApplicationForm): Promise<JobApplication> {
    const payload = await axiosClient.post<any, any>(apiUrl(`/api/jobs/${encodeURIComponent(String(jobIdOrSlug))}/apply`), body);
    return (payload?.data ?? payload) as JobApplication;
  },
};
