import { jobService } from '@/services/jobService';
import { notFound } from 'next/navigation';
import { MapPin, Clock, Target, CalendarDays, ArrowLeft, Wallet, Phone, Mail, Globe } from 'lucide-react';
import { fNumber } from '@/utils/format-number';
import JobApplyModal from '@/components/JobApplyModal';
import Link from 'next/link';
import ShareCopyButton from '@/components/ShareCopyButton';

export const dynamic = 'force-dynamic';

export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  try {
    const job = await jobService.get(params.slug);
    const salary = job.salaryMin || job.salaryMax
      ? `${job.salaryMin ? fNumber(Number(job.salaryMin)) : ''}${job.salaryMax ? ' - ' + fNumber(Number(job.salaryMax)) : ''} ${job.currency || 'VND'}`
      : 'Thoả thuận';

    const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/,'');
    const banner = (job as any).bannerImageUrl || '';
    const cover = job.coverImageUrl || '';
    const rawHero = banner || cover;
    const heroSrc = rawHero
      ? (rawHero.startsWith('http') ? rawHero : `${base}${rawHero}`)
      : '/logo.png'; // fallback ảnh công khai trong public

    return (
      <div className="mx-auto max-w-screen-2xl pb-5">
        {/* HERO */}
        <div className="relative w-full h-[280px] sm:h-[340px] md:h-[420px] lg:h-[460px] overflow-hidden rounded-b-2xl">
          <img
            src={heroSrc}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover blur-md scale-105 opacity-70"
          />
          <img
            src={heroSrc}
            alt={job.title}
            className="relative z-10 mx-auto h-full w-auto max-w-full object-contain drop-shadow-xl"
          />
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 z-30 px-4 sm:px-6 md:px-8 py-4 text-white">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
          {/* MAIN */}
          <div className="lg:col-span-2 space-y-6">
            {job.description && (
              <section className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Mô tả công việc</h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.description }} />
              </section>
            )}

            {job.benefits && (
              <section className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Quyền lợi</h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.benefits }} />
              </section>
            )}

            {job.requirements && (
              <section className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Yêu cầu</h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.requirements }} />
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
                {/* Apply via popup modal */}
                <div className="mt-3">
                  <JobApplyModal jobIdOrSlug={params.slug} />
                </div>
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

        {/* Fixed info section */}
        <section className="mb-10 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Thời gian & Địa điểm làm việc</h2>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 text-emerald-600" />
              <div><span className="font-medium">Thời gian:</span> Thứ 2 – sáng Thứ 7 | 8h30–17h00</div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-emerald-600" />
              <div><span className="font-medium">Địa điểm:</span> Số 27, liền kề 7, KĐT Văn Khê, Hà Đông, Hà Nội</div>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-emerald-800">
              📍 Văn phòng Nhà Cộng là nơi bạn vừa chill vừa sáng tạo, mang vibe thoải mái nhưng luôn đòi hỏi chất lượng nội dung đỉnh cao!
            </p>
          </div>
          <hr className="my-5 border-slate-200" />
          <h3 className="text-md font-semibold text-slate-800 mb-3">Cách ứng tuyển & Thông tin liên hệ</h3>
          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-600" /> <span><span className="font-medium">Hotline:</span> 0968.345.486</span></div>
            <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-600" /> <span><span className="font-medium">Website:</span> nhacong.com.vn</span></div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-600" /> <span><span className="font-medium">Email:</span> hotro@nhacong.com.vn</span></div>
          </div>
        </section>

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
              image: (job as any).bannerImageUrl || job.coverImageUrl || undefined,
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
