"use client";
import React, { useMemo, useState } from 'react';
import { jobService } from '@/services/jobService';
import { useRouter } from 'next/navigation';
import {
  Save, ChevronRight, Link as LinkIcon, CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';
import SeoScoreCard from '@/components/SeoScoreCard';
import { useSeoScore } from '@/hooks/useSeoScore';
import { toSlug } from '@/utils/formatSlug';
import CustomSunEditor from '@/app/admin/components/customSunEditor';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
      <ChevronRight className="w-4 h-4 text-slate-400" />
      <h3 className="font-semibold text-slate-700">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export default function AdminJobCreatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    requirements: '',
    benefits: '',
    location: '',
    employmentType: '',
    level: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'VND',
    status: 'draft' as const,
  });
  const [focusKeyword, setFocusKeyword] = useState('');
  const seoContentHtml = useMemo(() => form.description || '', [form.description]);
  const seoRes = useSeoScore({
    title: form.title,
    slug: form.slug || toSlug(form.title || ''),
    excerpt: '',
    contentHtml: seoContentHtml, // chấm điểm dựa trên mô tả công việc
    cover: undefined,
    tags: [form.location, form.employmentType, form.level].filter(Boolean) as string[],
    focusKeyword
  });

  // Auto slug when typing title (if user hasn't manually edited slug yet)
  const slugEditedRef = React.useRef(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const onChangeTitle = (v: string) => {
    set('title', v);
    if (!slugEditedRef.current) set('slug', toSlug(v));
  };

  const onChangeSlug = (v: string) => {
    slugEditedRef.current = true;
    set('slug', v);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        pointSeo: seoRes.score,
        focusKeyword,
      } as any;
      const created = await jobService.create(payload);
      toast.success('Tạo tin tuyển dụng thành công!');
      router.push('/admin/jobs');
    } catch (e) {
      toast.error('Không thể tạo tin, vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">Tạo tin tuyển dụng</p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">
                {form.title?.trim() || 'Tin tuyển dụng chưa có tiêu đề'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              form="job-form"
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? (
                <span>Đang lưu…</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Đăng tin</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/jobs')}
              className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Tiêu đề & Permalink">
            <div className="space-y-3">
              <input
                className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Nhập tiêu đề tin…"
                value={form.title}
                onChange={(e)=>onChangeTitle(e.target.value)}
              />
              <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Permalink:</span>
                <span className="truncate">
                  /tuyen-dung/<span className="font-mono text-slate-800">{form.slug || toSlug(form.title || '')}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-mono"
                  placeholder="slug-tu-dong (tuỳ chọn)"
                  value={form.slug}
                  onChange={(e)=>onChangeSlug(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => set('slug', toSlug(form.title || ''))}
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm"
                >
                  Tạo
                </button>
              </div>
            </div>
          </Section>

          <Section title="Thông tin công việc">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Địa điểm</label>
                <input
                  className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  value={form.location}
                  onChange={(e)=>set('location', e.target.value)}
                  placeholder="Hà Nội, Remote…"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Hình thức</label>
                <input
                  className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  value={form.employmentType}
                  onChange={(e)=>set('employmentType', e.target.value)}
                  placeholder="Full-time, Part-time…"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Cấp bậc</label>
                <input
                  className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  value={form.level}
                  onChange={(e)=>set('level', e.target.value)}
                  placeholder="Junior, Senior, Lead…"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Lương tối thiểu</label>
                  <input
                    type="number"
                    className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    value={form.salaryMin}
                    onChange={(e)=>set('salaryMin', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Lương tối đa</label>
                  <input
                    type="number"
                    className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    value={form.salaryMax}
                    onChange={(e)=>set('salaryMax', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Tiền tệ</label>
                  <input
                    className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    value={form.currency}
                    onChange={(e)=>set('currency', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Mô tả công việc">
            <div className="rounded-lg border-2 border-dashed border-slate-300 p-2">
              <CustomSunEditor
                value={form.description || ''}
                onChange={(html) => set('description', html)}
              />
            </div>
          </Section>

          <Section title="Yêu cầu">
            <textarea
              rows={5}
              className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
              value={form.requirements}
              onChange={(e)=>set('requirements', e.target.value)}
              placeholder="Liệt kê kỹ năng bắt buộc, kinh nghiệm tối thiểu, công cụ…"
            />
          </Section>

          <Section title="Quyền lợi">
            <textarea
              rows={5}
              className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
              value={form.benefits}
              onChange={(e)=>set('benefits', e.target.value)}
              placeholder="Lương thưởng, bảo hiểm, du lịch, thiết bị, đào tạo…"
            />
          </Section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Section title="Xuất bản">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Trạng thái</label>
                <select
                  className="w-full rounded border border-dashed border-slate-300 bg-white focus:border-emerald-500 focus:ring-emerald-500"
                  value={form.status}
                  onChange={(e)=>set('status', e.target.value)}
                >
                  <option value="draft">Nháp</option>
                  <option value="published">Công khai</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="Điểm SEO">
            <SeoScoreCard
              title={form.title}
              slug={form.slug || toSlug(form.title || '')}
              excerpt=""
              contentHtml={seoContentHtml}
              cover={undefined}
              tags={[form.location, form.employmentType, form.level].filter(Boolean) as string[]}
              focusKeyword={focusKeyword}
              onChangeFocusKeyword={setFocusKeyword}
            />
            <div className="text-xs text-slate-500 mt-2">
              Điểm sẽ gửi lên API: <span className="font-semibold">{seoRes.score}</span>
            </div>
          </Section>
        </div>
      </div>

      {/* Hidden form to trigger header submit */}
      <form id="job-form" onSubmit={onSubmit} className="hidden" />
    </div>
  );
}
