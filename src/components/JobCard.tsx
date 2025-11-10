import Link from 'next/link';
import { Job } from '@/type/job';
import { MapPin, Clock, Target, ArrowRight, CalendarDays, ImageOff } from 'lucide-react';
import MyImage from '@/components/myImage';

export default function JobCard({ job }: { job: Job }) {
  const salary = job.salaryMin || job.salaryMax
    ? `${job.salaryMin ? job.salaryMin.toLocaleString() : ''}${job.salaryMax ? ' - ' + job.salaryMax.toLocaleString() : ''} ${job.currency || 'VND'}`
    : 'Thoả thuận';

  return (
    <Link
      href={`/tuyen-dung/${job.slug || job.id}`}
      className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-xl hover:border-emerald-300 transition duration-300"
    >
      {/* Cover image */}
      {job.coverImageUrl ? (
        <div className="relative w-full aspect-[16/9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={(process.env.NEXT_PUBLIC_API_URL || "") + job.coverImageUrl}
            alt={job.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      ) : (
        <div className="w-full aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400">
          <ImageOff className="w-8 h-8" />
        </div>
      )}

      {/* Accent bar */}
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-700 transition line-clamp-2">
            {job.title}
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {job.location && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                <MapPin className="w-3.5 h-3.5" /> {job.location}
              </span>
            )}
            {job.employmentType && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                <Clock className="w-3.5 h-3.5" /> {job.employmentType}
              </span>
            )}
            {job.level && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                <Target className="w-3.5 h-3.5" /> {job.level}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              {salary}
            </span>
            {job.publishedAt && (
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-500">
                <CalendarDays className="w-3.5 h-3.5" /> {new Date(job.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full group-hover:bg-emerald-100 group-hover:translate-x-1 transition">
            Chi tiết <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Hover ripple */}
      <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-emerald-200 opacity-0 group-hover:opacity-20 blur-2xl transition" />
    </Link>
  );
}
