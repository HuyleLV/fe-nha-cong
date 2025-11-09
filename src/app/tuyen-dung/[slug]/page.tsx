import { jobService } from '@/services/jobService';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  try {
    const job = await jobService.get(params.slug);
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <div className="mt-2 text-sm text-gray-600 flex gap-3 flex-wrap">
          {job.location && <span>📍 {job.location}</span>}
          {job.employmentType && <span>⏱ {job.employmentType}</span>}
          {job.level && <span>🎯 {job.level}</span>}
        </div>
        {job.publishedAt && (
          <div className="mt-2 text-xs text-gray-500">Đăng: {new Date(job.publishedAt).toLocaleDateString()}</div>
        )}
        {job.salaryMin || job.salaryMax ? (
          <div className="mt-2 font-medium">
            Mức lương: {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()} {job.currency || 'VND'}
          </div>
        ) : null}

        {job.description && (
          <section className="prose max-w-none mt-6" dangerouslySetInnerHTML={{ __html: job.description }} />
        )}
        {job.requirements && (
          <section className="prose max-w-none mt-6">
            <h2 className="text-xl font-semibold mb-2">Yêu cầu</h2>
            <div dangerouslySetInnerHTML={{ __html: job.requirements }} />
          </section>
        )}
        {job.benefits && (
          <section className="prose max-w-none mt-6">
            <h2 className="text-xl font-semibold mb-2">Quyền lợi</h2>
            <div dangerouslySetInnerHTML={{ __html: job.benefits }} />
          </section>
        )}
      </div>
    );
  } catch (e) {
    notFound();
  }
}
