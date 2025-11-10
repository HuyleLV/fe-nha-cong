import { jobService } from '@/services/jobService';
import { notFound } from 'next/navigation';
import { MapPin, Clock, Target, CalendarDays, ArrowLeft, Wallet } from 'lucide-react';
import Link from 'next/link';
import ShareCopyButton from '@/components/ShareCopyButton';

export const dynamic = 'force-dynamic';

export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  try {
    const job = await jobService.get(params.slug);
    const salary = job.salaryMin || job.salaryMax
      ? `${job.salaryMin ? job.salaryMin.toLocaleString() : ''}${job.salaryMax ? ' - ' + job.salaryMax.toLocaleString() : ''} ${job.currency || 'VND'}`
      : 'Thoả thuận';

    return (
      <div className="mx-auto max-w-screen-2xl">
        {/* HERO */}
        <div className="relative">
          <div className="h-48 sm:h-60 md:h-72 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={(process.env.NEXT_PUBLIC_API_URL || "") + (job.coverImageUrl || '/images/hero-jobs-fallback.jpg')}
              alt={job.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-4 sm:px-6 md:px-8 py-4 text-white">
            <div className="flex flex-wrap items-center gap-2 text-emerald-200 text-xs">
              {job.publishedAt && (
                <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                  <CalendarDays className="w-3.5 h-3.5" /> {new Date(job.publishedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold leading-tight">{job.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              {job.location && (
                <span className="inline-flex items-center gap-1.5 bg-white/15 px-2 py-1 rounded">
                  <MapPin className="w-4 h-4" /> {job.location}
                </span>
              )}
              {job.employmentType && (
                <span className="inline-flex items-center gap-1.5 bg-white/15 px-2 py-1 rounded">
                  <Clock className="w-4 h-4" /> {job.employmentType}
                </span>
              )}
              {job.level && (
                <span className="inline-flex items-center gap-1.5 bg-white/15 px-2 py-1 rounded">
                  <Target className="w-4 h-4" /> {job.level}
                </span>
              )}
              {(job.salaryMin || job.salaryMax) && (
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/90 text-white px-2 py-1 rounded font-medium">
                  <Wallet className="w-4 h-4" /> {salary}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
          {/* MAIN */}
          <div className="lg:col-span-2 space-y-6">
            {job.description && (
              <section className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Mô tả công việc</h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.description }} />
              </section>
            )}

            {job.requirements && (
              <section className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Yêu cầu</h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.requirements }} />
              </section>
            )}

            {job.benefits && (
              <section className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Quyền lợi</h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.benefits }} />
              </section>
            )}

            {!job.description && !job.requirements && !job.benefits && (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                Thông tin chi tiết sẽ được cập nhật.
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="text-sm text-slate-600 mb-2">Mức lương</div>
                <div className="text-emerald-600 font-semibold">{salary}</div>
                <button className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                  Ứng tuyển ngay
                </button>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <ShareCopyButton />
                  <Link href="/tuyen-dung" className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-slate-200 hover:bg-slate-50 text-sm w-full">
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* SEO JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'JobPosting',
              title: job.title,
              description: job.description || '',
              hiringOrganization: { '@type': 'Organization', name: 'Nhà Cộng' },
              jobLocation: job.location ? { '@type': 'Place', address: job.location } : undefined,
              employmentType: job.employmentType || undefined,
              datePosted: job.publishedAt || undefined,
              validThrough: undefined,
              baseSalary: (job.salaryMin || job.salaryMax)
                ? {
                    '@type': 'MonetaryAmount',
                    currency: job.currency || 'VND',
                    value: {
                      '@type': 'QuantitativeValue',
                      minValue: job.salaryMin || undefined,
                      maxValue: job.salaryMax || undefined,
                    },
                  }
                : undefined,
              image: job.coverImageUrl || undefined,
              url: typeof window !== 'undefined' ? window.location.href : undefined,
            }),
          }}
        />
      </div>
    );
  } catch (e) {
    notFound();
  }
}
