'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Save, ChevronRight, Link as LinkIcon, CheckCircle2, Info, Image as ImageIcon,
} from 'lucide-react';

import Spinner from '@/components/spinner';
import { toSlug } from '@/utils/formatSlug';
import UploadPicker from '@/components/UploadPicker';

import { locationService } from '@/services/locationService';
import { Location, LocationForm, LocationLevel } from '@/type/location';
import ParentPicker from '../../components/parentPicker';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
      <ChevronRight className="w-4 h-4 text-slate-400" />
      <h3 className="font-semibold text-slate-700">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export default function LocationFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = useMemo(() => id !== 'create', [id]);
  const router = useRouter();

  const [loadingDetail, setLoadingDetail] = useState<boolean>(isEdit);
  const [selectedParent, setSelectedParent] = useState<Location | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<LocationForm>({
    defaultValues: {
      name: '',
      slug: '',
      level: 'Province' as LocationLevel, // ✅ Sửa: đúng type
      parentId: null,
      coverImageUrl: '',
    },
  });

  const editableInput =
    'w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500';

  const name = watch('name') ?? '';
  const slug = watch('slug') ?? '';
  const level = watch('level');
  const cover = watch('coverImageUrl') ?? '';
  const hasDirty = Object.keys(dirtyFields || {}).length > 0; // ✅ Sửa: check đúng

  // Tự tạo slug theo name nếu slug đang trống
  useEffect(() => {
    const currentSlug = (slug || '').trim();
    if (!currentSlug && name?.trim()) {
      setValue('slug', toSlug(name), { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  // Load chi tiết khi edit
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const loc: Location = await locationService.getById(Number(id));
        reset({
          name: loc.name ?? '',
          slug: loc.slug ?? '',
          level: loc.level,
          parentId: loc.parent?.id ?? null,
          coverImageUrl: loc.coverImageUrl ?? '',
        });
        setSelectedParent(loc.parent ?? null);
      } catch {
        toast.error('Không tải được khu vực');
        router.replace('/admin/location');
      } finally {
        setLoadingDetail(false);
      }
    })();
  }, [id, isEdit, reset, router]);

  // Ràng buộc parent theo level (Province/City: null; District: required & parent phải là Province/City)
  useEffect(() => {
    if (!level) return;

    if (level === 'Province') {
      // không có parent
      setSelectedParent(null);
      setValue('parentId', null, { shouldDirty: true });
      clearErrors('parentId');
    } else if (level === 'District') {
      // nếu đang có parent nhưng không hợp lệ (phòng trường hợp ParentPicker cho chọn sâu hơn)
      if (selectedParent && !['Province'].includes(selectedParent.level)) {
        setSelectedParent(null);
        setValue('parentId', null, { shouldDirty: true });
      }
      // không set error ở đây; để lúc submit validate cứng thêm lần nữa
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // Submit
  const onSubmit = async (values: LocationForm) => {
    const cleanedSlug = (values.slug?.trim() || toSlug(values.name)).trim();

    // ✅ Validate FE: District phải có parent; Province/City không có parent
    if (values.level === 'District' && !values.parentId) {
      setError('parentId', { message: 'Quận cần chọn Tỉnh/Thành phố cha' });
      toast.error('Vui lòng chọn Tỉnh/Thành phố cha cho Quận');
      return;
    }
    if ((values.level === 'Province') && values.parentId) {
      setError('parentId', { message: 'Tỉnh/Thành phố không được có cha' });
      toast.error('Tỉnh/Thành phố không được có cha');
      return;
    }

    const payload: LocationForm = {
      name: values.name.trim(),
      slug: cleanedSlug,
      level: values.level,
      parentId: values.parentId ?? null,
      coverImageUrl: values.coverImageUrl?.trim() || undefined,
    };

    try {
      if (isEdit) {
        await locationService.update(Number(id), payload);
        toast.success('Cập nhật khu vực thành công!');
      } else {
        await locationService.create(payload);
        toast.success('Tạo khu vực thành công!');
      }
      router.push('/admin/location');
    } catch (err: any) {
      // Server đã có validate hierarchy & unique(scope); hiển thị message server
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
                {isEdit ? 'Chỉnh sửa khu vực' : 'Tạo khu vực mới'}
              </p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">
                {name?.trim() || 'Khu vực chưa có tên'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasDirty && ( // ✅ Sửa: chỉ hiện khi thật sự dirty
              <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-500">
                <Info className="w-4 h-4" /> Thay đổi chưa lưu
              </span>
            )}
            <button
              form="location-form"
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
                  <span>{isEdit ? 'Cập nhật' : 'Tạo mới'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/location')}
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
          <Section title="Tên & Permalink">
            <div className="space-y-3">
              <input
                className={editableInput}
                placeholder="Nhập tên khu vực… (VD: Việt Nam, Hà Nội, Quận 1)"
                {...register('name', { required: 'Vui lòng nhập tên khu vực' })}
              />
              {errors.name && <p className="text-red-600 text-sm">{errors.name.message as string}</p>}

              <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Permalink:</span>
                <span className="truncate">
                  /location/<span className="font-mono text-slate-800">{slug || toSlug(name || '')}</span>
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
                  onClick={() => setValue('slug', toSlug(name || ''), { shouldDirty: true })}
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm cursor-pointer"
                >
                  Tạo
                </button>
              </div>
            </div>
          </Section>

          <Section title="Ảnh cover (tùy chọn)">
            <div className="p-2">
              <div className="flex items-center gap-2">
                <UploadPicker
                  value={cover || null}
                  onChange={(val) => setValue('coverImageUrl', val || '', { shouldDirty: true })}
                />
                {!cover && (
                  <div className="shrink-0 grid place-items-center size-10 rounded-lg border bg-slate-50">
                    <ImageIcon className="size-5 text-slate-500" />
                  </div>
                )}
              </div>
            </div>
          </Section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Section title="Thuộc tính khu vực">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Cấp (level)</label>
                <select
                  className="w-full rounded border border-dashed border-slate-300 bg-white focus:border-emerald-500 focus:ring-emerald-500"
                  {...register('level', { required: true })}
                >
                  <option value="Province">Tỉnh</option>
                  <option value="City">Thành phố</option>
                  <option value="District">Quận</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="parentId"
                  rules={{
                    validate: (val) => {
                      if (level === 'District' && !val) return 'Quận cần chọn Tỉnh/Thành phố cha';
                      if ((level === 'Province') && val) return 'Tỉnh/Thành phố không được có cha';
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <div>
                      <ParentPicker
                        childLevel={level}
                        disabled={level === 'Province'} // ✅ khóa khi không cần
                        value={selectedParent}
                        onChange={(loc) => {
                          setSelectedParent(loc);
                          field.onChange(loc?.id ?? null);
                          clearErrors('parentId');
                        }}
                      />
                      {errors.parentId && (
                        <p className="text-red-600 text-sm mt-1">{String(errors.parentId.message || '')}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {level === 'District'
                          ? 'Chọn Tỉnh/Thành phố cha cho Quận.'
                          : 'Tỉnh/Thành phố không có cấp cha.'}
                      </p>
                    </div>
                  )}
                />
              </div>
            </div>
          </Section>

          <Section title="Kiểm tra nhanh">
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 ${name?.trim() ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Đã có tên khu vực.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 ${(slug || toSlug(name || '')).length ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Slug hợp lệ.</span>
              </li>
            </ul>
          </Section>
        </div>
      </div>

      <form id="location-form" onSubmit={handleSubmit(onSubmit)} className="hidden" />
    </div>
  );
}