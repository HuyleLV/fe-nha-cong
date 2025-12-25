"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Save, ChevronRight, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

import UploadPicker from '@/components/UploadPicker';
import SeoScoreCard from '@/components/SeoScoreCard';
import CustomSunEditor from '@/app/admin/components/customSunEditor';
import { useSeoScore } from '@/hooks/useSeoScore';
import { toSlug } from '@/utils/formatSlug';
import Spinner from '@/components/spinner';
import { jobService } from '@/services/jobService';
import type { Job } from '@/type/job';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
      <ChevronRight className="w-4 h-4 text-slate-400" />
      <h3 className="font-semibold text-slate-700">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export default function JobFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = useMemo(() => id !== 'create', [id]);
  const router = useRouter();

  const [loadingDetail, setLoadingDetail] = useState<boolean>(isEdit);
  const [focusKeyword, setFocusKeyword] = useState('');

  type JobForm = {
    title: string;
    slug: string;
    description: string;
    requirements: string;
    benefits: string;
    location: string;
    employmentType: string;
    level: string;
    salaryMin?: number;
    salaryMax?: number;
    currency: string;
    coverImageUrl: string;
    bannerImageUrl: string;
    status: 'draft' | 'published' | 'archived';
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<JobForm>({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      requirements: '',
      benefits: '',
      location: '',
      employmentType: '',
      level: '',
      salaryMin: undefined,
      salaryMax: undefined,
      currency: 'VND',
      coverImageUrl: '',
      bannerImageUrl: '',
      status: 'draft',
    },
  });

  // Watch fields
  const title = watch('title');
  const slug = watch('slug');
  const cover = watch('coverImageUrl') ?? '';
  const banner = watch('bannerImageUrl') ?? '';
  const descriptionHtml = watch('description') || '';
  const location = watch('location') || '';
  const employmentType = watch('employmentType') || '';
  const level = watch('level') || '';

  // Auto slug
  useEffect(() => {
    const current = (slug || '').trim();
    if (!current && title?.trim()) {
      setValue('slug', toSlug(title), { shouldDirty: true });
    }
  }, [title]);

  // Load detail if edit
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const j: Job = await jobService.get(id);
        reset({
          title: j.title ?? '',
          slug: j.slug ?? '',
          description: j.description ?? '',
          requirements: j.requirements ?? '',
          benefits: j.benefits ?? '',
          location: j.location ?? '',
          employmentType: j.employmentType ?? '',
          level: j.level ?? '',
          salaryMin: j.salaryMin ?? undefined,
          salaryMax: j.salaryMax ?? undefined,
          currency: j.currency ?? 'VND',
          coverImageUrl: j.coverImageUrl ?? '',
          bannerImageUrl: (j as any).bannerImageUrl ?? '',
          status: (j.status as any) ?? 'draft',
        });
        // Suggest focus keyword from title if empty
        setFocusKeyword(j.title?.split(' ').slice(0, 3).join(' ') || '');
      } catch {
        toast.error('Không tải được tin tuyển dụng');
        router.replace('/admin/jobs');
      } finally {
        setLoadingDetail(false);
      }
    })();
  }, [id, isEdit, reset, router]);

  // SEO score
  const seoRes = useSeoScore({
    title: title || '',
    slug: slug || toSlug(title || ''),
    excerpt: '',
    contentHtml: descriptionHtml || '',
    cover: cover || '',
    tags: [location, employmentType, level].filter(Boolean) as string[],
    focusKeyword: focusKeyword || '',
  });

  const onSubmit = async (values: JobForm) => {
    const cleanedSlug = (values.slug?.trim() || toSlug(values.title)).trim();
    const payload: any = {
      title: values.title.trim(),
      slug: cleanedSlug,
      description: values.description || '',
      requirements: values.requirements || '',
      benefits: values.benefits || '',
      location: values.location || '',
      employmentType: values.employmentType || '',
      level: values.level || '',
      salaryMin: values.salaryMin ?? undefined,
      salaryMax: values.salaryMax ?? undefined,
      currency: values.currency || 'VND',
      coverImageUrl: values.coverImageUrl || '',
      bannerImageUrl: values.bannerImageUrl || '',
      status: values.status,
      pointSeo: seoRes.score,
      focusKeyword: focusKeyword || '',
    };

    try {
      if (isEdit) {
        await jobService.update(id, payload);
        toast.success('Cập nhật tin tuyển dụng thành công!');
      } else {
        await jobService.create(payload);
        toast.success('Tạo tin tuyển dụng thành công!');
      }
      router.push('/admin/jobs');
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  if (isEdit && loadingDetail) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">
                {isEdit ? 'Chỉnh sửa tin tuyển dụng' : 'Tạo tin tuyển dụng'}
              </p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">
                {title?.trim() || 'Tin tuyển dụng chưa có tiêu đề'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {Object.keys(dirtyFields || {}).length > 0 && (
              <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-500">
                Thay đổi chưa lưu
              </span>
            )}
            <button
              form="job-form"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Đang lưu…</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isEdit ? 'Cập nhật' : 'Đăng tin'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/jobs')}
              className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
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
                {...register('title', { required: 'Vui lòng nhập tiêu đề' })}
              />
              {errors.title && <p className="text-red-600 text-sm">{String(errors.title.message)}</p>}

              <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Permalink:</span>
                <span className="truncate">
                  /tuyen-dung/<span className="font-mono text-slate-800">{slug || toSlug(title || '')}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-mono"
                  placeholder="slug-tuy-chinh (tuỳ chọn)"
                  {...register('slug')}
                />
                <button
                  type="button"
                  onClick={() => setValue('slug', toSlug(title || ''), { shouldDirty: true })}
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm"
                >
                  Tạo
                </button>
              </div>
            </div>
          </Section>
          
          {/* Ảnh bìa riêng cho trang chi tiết */}
          <Section title="Ảnh bìa">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Ảnh bìa</label>
              <UploadPicker
                value={banner || ''}
                onChange={(v) => setValue('bannerImageUrl', Array.isArray(v) ? (v[0] || '') : (v || ''), { shouldDirty: true })}
                aspectClass="aspect-[16/9]"
              />
              <p className="mt-2 text-xs text-slate-500">Gợi ý: Tỉ lệ 16:9, dung lượng &lt; 2MB. Ảnh này sẽ hiển thị ở hero trang chi tiết.</p>
            </div>
          </Section>

          <Section title="Thông tin công việc">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-600 mb-1">Ảnh đại diện</label>
                <UploadPicker
                  value={cover || ''}
                  onChange={(v) => setValue('coverImageUrl', Array.isArray(v) ? (v[0] || '') : (v || ''), { shouldDirty: true })}
                  aspectClass="aspect-[3/1]"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Địa điểm</label>
                <input
                  className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  {...register('location')}
                  placeholder="Hà Nội, Remote…"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Hình thức</label>
                <input
                  className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  {...register('employmentType')}
                  placeholder="Full-time, Part-time…"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Cấp bậc</label>
                <input
                  className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  {...register('level')}
                  placeholder="Junior, Senior, Lead…"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Lương tối thiểu</label>
                  <input type="number" className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500" {...register('salaryMin', { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Lương tối đa</label>
                  <input type="number" className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500" {...register('salaryMax', { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Tiền tệ</label>
                  <input className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500" {...register('currency')} />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Mô tả công việc">
            <div className="rounded-lg border-2 border-dashed border-slate-300 p-2">
              <Controller
                name="description"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomSunEditor value={value || ''} onChange={onChange} />
                )}
              />
            </div>
          </Section>

          <Section title="Quyền lợi">
            <div className="rounded-lg border-2 border-dashed border-slate-300 p-2">
              <Controller
                name="benefits"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomSunEditor value={value || ''} onChange={onChange} />
                )}
              />
            </div>
          </Section>

          <Section title="Yêu cầu">
            <div className="rounded-lg border-2 border-dashed border-slate-300 p-2">
              <Controller
                name="requirements"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomSunEditor value={value || ''} onChange={onChange} />
                )}
              />
            </div>
          </Section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Section title="Xuất bản">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Trạng thái</label>
                  <select
                    className="w-full rounded border border-dashed border-slate-300 bg-white focus:border-emerald-500 focus:ring-emerald-500"
                    {...register('status')}
                  >
                    <option value="draft">Nháp</option>
                    <option value="published">Công khai</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Điểm SEO">
            <SeoScoreCard
              title={title || ''}
              slug={slug || toSlug(title || '')}
              excerpt={''}
              contentHtml={descriptionHtml || ''}
              cover={cover || ''}
              tags={[location, employmentType, level].filter(Boolean) as string[]}
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
      <form id="job-form" onSubmit={handleSubmit(onSubmit)} className="hidden" />
    </div>
  );
}
