'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Save, ChevronRight, Link as LinkIcon, Tag as TagIcon,
  Info, X, Pin, CheckCircle2
} from 'lucide-react';

import Spinner from '@/components/spinner';
import { blogService } from '@/services/blogService';
import { toSlug } from '@/utils/formatSlug';
import type { Blog, BlogForm } from '@/type/blog';
import { BlogStatus } from '@/type/blog';

import CustomSunEditor from '@/app/admin/components/customSunEditor';
import UploadPicker from '@/components/UploadPicker';
import SeoScoreCard from '@/components/SeoScoreCard';
import { useSeoScore } from '@/hooks/useSeoScore';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
      <ChevronRight className="w-4 h-4 text-slate-400" />
      <h3 className="font-semibold text-slate-700">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// Đếm từ trong HTML (bỏ tag rồi đếm)
function wordCountFromHtml(html: string) {
  const text = html?.replace(/<[^>]*>/g, ' ')?.replace(/\s+/g, ' ')?.trim() ?? '';
  return (text.match(/\b[\p{L}\p{N}'’-]+\b/gu) || []).length;
}

// Mở rộng payload tại chỗ để gửi thêm pointSeo/focusKeyword mà không ép sửa global type
type BlogFormWithSeo = BlogForm & {
  pointSeo?: number;
  focusKeyword?: string;
};

export default function BlogFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = useMemo(() => id !== 'create', [id]);
  const router = useRouter();

  const [loadingDetail, setLoadingDetail] = useState<boolean>(isEdit);
  const [tagInput, setTagInput] = useState('');
  const [focusKeyword, setFocusKeyword] = useState(''); // ô nhập từ khóa trọng tâm

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<BlogForm>({
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImageUrl: '',
      status: BlogStatus.Draft,
      isPinned: false,
      tags: [],
    },
  });

  const editableInput =
    'w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500';

  // RHF: đăng ký field tags (ẩn)
  useEffect(() => {
    register('tags');
  }, [register]);

  // Watch fields
  const title = watch('title');
  const slug = watch('slug');
  const excerpt = watch('excerpt') ?? '';
  const cover = watch('coverImageUrl') ?? '';
  const tags = (watch('tags') || []) as string[];
  const contentHtml = watch('content') || '';

  // Auto slug từ title (chỉ khi chưa nhập slug thủ công)
  useEffect(() => {
    const currentSlug = (slug || '').trim();
    if (!currentSlug && title?.trim()) {
      setValue('slug', toSlug(title), { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  // Load chi tiết khi edit
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const b: Blog = await blogService.getById(Number(id));
        reset({
          title: b.title ?? '',
          slug: b.slug ?? '',
          excerpt: b.excerpt ?? '',
          content: b.content ?? '',
          coverImageUrl: b.coverImageUrl ?? '',
          status: b.status,
          isPinned: !!b.isPinned,
          tags: b.tags ?? [],
        });
        // Ưu tiên giá trị từ API; nếu không có thì gợi ý theo title
        const suggested = b.title ? b.title.split(' ').slice(0, 3).join(' ') : '';
        setFocusKeyword(b.focusKeyword ?? suggested);
      } catch {
        toast.error('Không tải được bài viết');
        router.replace('/admin/blog');
      } finally {
        setLoadingDetail(false);
      }
    })();
  }, [id, isEdit, reset, router]);

  // Khi tạo mới: gợi ý focusKeyword theo title nếu đang rỗng
  useEffect(() => {
    if (!isEdit && !focusKeyword && title?.trim()) {
      setFocusKeyword(title.split(' ').slice(0, 3).join(' '));
    }
  }, [isEdit, title, focusKeyword]);

  // Tags
  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) {
      setValue('tags', [...tags, t], { shouldDirty: true });
    }
    setTagInput('');
  };
  const removeTag = (t: string) => {
    setValue('tags', tags.filter((x) => x !== t), { shouldDirty: true });
  };
  const onTagKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  // ====== TÍNH SEO SCORE ======
  const seoRes = useSeoScore({
    title: title || '',
    slug: slug || toSlug(title || ''),
    excerpt: excerpt || '',
    contentHtml: contentHtml || '',
    cover: cover || '',
    tags,
    focusKeyword: focusKeyword || '',
  });
  const pointSeo = seoRes.score;

  // Submit
  const onSubmit = async (values: BlogForm) => {
    const cleanedSlug = (values.slug?.trim() || toSlug(values.title)).trim();

    const payload: BlogFormWithSeo = {
      title: values.title.trim(),
      slug: cleanedSlug,
      status: values.status,
      isPinned: !!values.isPinned,
      tags: (values.tags || []).map((s) => s.trim()).filter(Boolean),
      pointSeo,
      focusKeyword: focusKeyword || '',
    };

    const ex = values.excerpt?.trim();
    const ct = values.content?.toString();
    const cv = values.coverImageUrl?.trim();
    if (ex) payload.excerpt = ex;
    if (ct) payload.content = ct;
    if (cv) payload.coverImageUrl = cv;

    try {
      if (isEdit) {
        await blogService.update(Number(id), payload as any);
        toast.success('Cập nhật bài viết thành công!');
      } else {
        await blogService.create(payload as any);
        toast.success('Tạo bài viết thành công!');
      }
      router.push('/admin/blog');
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
                {isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
              </p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">
                {title?.trim() || 'Bài viết chưa có tiêu đề'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {Object.keys(dirtyFields || {}).length > 0 && (
              <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-500">
                <Info className="w-4 h-4" /> Thay đổi chưa lưu
              </span>
            )}
            <button
              form="blog-form"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Spinner /> <span>Đang lưu…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isEdit ? 'Cập nhật' : 'Đăng bài'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/blog')}
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
                className={editableInput}
                placeholder="Nhập tiêu đề bài viết…"
                {...register('title', { required: 'Vui lòng nhập tiêu đề' })}
              />
              {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}

              <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Permalink:</span>
                <span className="truncate">
                  /blog/<span className="font-mono text-slate-800">{slug || toSlug(title || '')}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  className={`${editableInput} font-mono`}
                  placeholder="slug-tuy-chinh (tuỳ chọn)"
                  {...register('slug')}
                />
                <button
                  type="button"
                  onClick={() => setValue('slug', toSlug(title || ''), { shouldDirty: true })}
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm cursor-pointer"
                >
                  Tạo
                </button>
              </div>
            </div>
          </Section>

          <Section title="Mô tả ngắn">
            <div className="space-y-2">
              <textarea
                rows={3}
                className={editableInput}
                placeholder="Tóm tắt nội dung bài viết…"
                {...register('excerpt')}
              />
              <div className="text-xs text-slate-500 flex justify-between">
                <span>{excerpt.length} ký tự</span>
                <span>Mẹo: ~160 ký tự tối ưu SEO</span>
              </div>
            </div>
          </Section>

          <Section title="Thẻ (Tags)">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-sm"
                  >
                    <TagIcon className="w-4 h-4" />
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="rounded-full hover:bg-emerald-100 p-0.5"
                      aria-label={`Xoá tag ${t}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  className={editableInput}
                  placeholder="Nhập tag rồi nhấn Enter hoặc dấu phẩy"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={onTagKeyDown}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  Thêm
                </button>
              </div>

              <input type="hidden" {...register('tags')} />
            </div>
          </Section>

          <Section title="Nội dung">
            <div className="rounded-lg border-2 border-dashed border-slate-300 p-2">
              <Controller
                name="content"
                control={control}
                rules={{
                  validate: (v) =>
                    (v && v.replace(/<[^>]*>/g, '').trim().length > 0) || 'Vui lòng nhập nội dung',
                }}
                render={({ field: { value, onChange } }) => (
                  <CustomSunEditor value={value || ''} onChange={onChange} />
                )}
              />
            </div>
            {errors.content && (
              <p className="text-red-600 text-sm mt-2">{String(errors.content.message)}</p>
            )}
            <div className="text-xs text-slate-500 mt-2">{wordCountFromHtml(contentHtml)} từ</div>
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
                    {...register('status', { valueAsNumber: true })}
                  >
                    <option value={BlogStatus.Draft}>Draft</option>
                    <option value={BlogStatus.Published}>Published</option>
                    <option value={BlogStatus.Archived}>Archived</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 mt-6">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('isPinned')} />
                  <span className="text-sm flex items-center gap-1">
                    <Pin className="w-4 h-4" /> Ghim bài viết
                  </span>
                </label>
              </div>
            </div>
          </Section>

          <Section title="Ảnh đại diện (Cover)">
            <div className="p-3">
              <UploadPicker
                value={cover || null}
                onChange={(val) => setValue('coverImageUrl', val || '', { shouldDirty: true })}
              />
            </div>
          </Section>

          <Section title="Điểm SEO">
            <SeoScoreCard
              title={title || ''}
              slug={slug || toSlug(title || '')}
              excerpt={excerpt || ''}
              contentHtml={contentHtml || ''}
              cover={cover || ''}
              tags={tags}
              focusKeyword={focusKeyword}
              onChangeFocusKeyword={setFocusKeyword}
            />
            <div className="text-xs text-slate-500 mt-2">
              Điểm sẽ gửi lên API: <span className="font-semibold">{pointSeo}</span>
            </div>
          </Section>
        </div>
      </div>

      {/* Form submit ẩn để nút header submit được */}
      <form id="blog-form" onSubmit={handleSubmit(onSubmit)} className="hidden" />
    </div>
  );
}
