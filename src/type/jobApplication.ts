export type JobApplication = {
  id: number;
  jobId: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  cvUrl?: string | null;
  message?: string | null;
  status?: string;
  internalNote?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type JobApplicationForm = {
  name: string;
  email?: string;
  phone?: string;
  cvUrl?: string | null;
  message?: string;
};

export type JobApplicationUpdate = {
  status?: string;
  internalNote?: string | null;
};
