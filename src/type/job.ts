export type JobStatus = 'draft' | 'published' | 'archived';

export type Job = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  location?: string | null;
  employmentType?: string | null;
  level?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  coverImageUrl?: string | null; // ảnh đại diện tin tuyển dụng
  status: JobStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
