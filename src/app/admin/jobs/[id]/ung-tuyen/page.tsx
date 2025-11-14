"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { jobService } from '@/services/jobService';
import AdminJobApplicationTable from '@/components/AdminJobApplicationTable';
import Spinner from '@/components/spinner';
import Link from 'next/link';

export default function AdminJobApplicationsPage() {
  const params = useParams();
  const rawId = params?.id as string;
  const jobId = rawId ? Number(rawId) : undefined;
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState<string>('');

  useEffect(()=>{
    let mounted = true;
    (async () => {
      if (!jobId) return;
      try {
        const job = await jobService.get(jobId);
        if (mounted) setTitle(job.title);
      } finally { if (mounted) setLoading(false); }
    })();
    return ()=>{ mounted = false; };
  }, [jobId]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Đơn ứng tuyển {title ? `- ${title}` : ''}</h1>
        <Link href="/admin/tuyen-dung" className="text-sm text-emerald-600 hover:underline">← Quay lại danh sách tin</Link>
      </div>
      {loading && <div className="p-10 text-center"><Spinner /></div>}
      {!loading && jobId && (
        <AdminJobApplicationTable jobId={jobId} />
      )}
    </div>
  );
}