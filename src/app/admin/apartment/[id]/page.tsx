"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { Save, ChevronRight, Link as LinkIcon, CheckCircle2, Info } from "lucide-react";

import Spinner from "@/components/spinner";
import UploadPicker from "@/components/UploadPicker";
import LocationLookup from "../../components/locationLookup";
import { toSlug } from "@/utils/formatSlug";

import { apartmentService } from "@/services/apartmentService";
import { Apartment, ApartmentForm, ApartmentStatus } from "@/type/apartment";
import { Location } from "@/type/location";
import CustomSunEditor from "../../components/customSunEditor";

/* ---------- helpers ---------- */
function wordCountFromHtml(html?: string) {
  if (!html) return 0;
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/?[^>]+(>|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return 0;
  return text.split(" ").length;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
      <ChevronRight className="w-4 h-4 text-slate-400" />
      <h3 className="font-semibold text-slate-700">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export default function ApartmentFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = useMemo(() => id !== "create", [id]);
  const router = useRouter();

  const [loadingDetail, setLoadingDetail] = useState<boolean>(isEdit);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ApartmentForm>({
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      description: "", // sẽ được điều khiển bởi SunEditor
      locationId: undefined as unknown as number,
      streetAddress: "",
      lat: "",
      lng: "",
      bedrooms: 0,
      bathrooms: 0,
      areaM2: "",
      rentPrice: "0",
      currency: "VND",
      status: "draft" as ApartmentStatus,
      coverImageUrl: "",
    },
  });

  const title = watch("title");
  const slug = watch("slug");
  const cover = watch("coverImageUrl") ?? "";
  const descriptionHtml = watch("description") || "";

  // Tự tạo slug theo tiêu đề nếu slug đang trống
  useEffect(() => {
    const cur = (slug || "").trim();
    if (!cur && title?.trim()) setValue("slug", toSlug(title), { shouldDirty: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  // Load detail khi edit
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const ap: Apartment = await apartmentService.getById(Number(id));
        reset({
          title: ap.title,
          slug: ap.slug,
          excerpt: ap.excerpt || "",
          description: ap.description || "",
          streetAddress: ap.streetAddress || "",
          lat: ap.lat || "",
          lng: ap.lng || "",
          bedrooms: ap.bedrooms,
          bathrooms: ap.bathrooms,
          areaM2: ap.areaM2 || "",
          rentPrice: ap.rentPrice,
          currency: ap.currency,
          status: ap.status,
          coverImageUrl: ap.coverImageUrl || "",
          locationId: (ap.location?.id as unknown as number) ?? (undefined as unknown as number),
        });
        setSelectedLocation(ap.location || null);
      } catch {
        toast.error("Không tải được căn hộ");
        router.replace("/admin/apartment");
      } finally {
        setLoadingDetail(false);
      }
    })();
  }, [id, isEdit, reset, router]);

  const onSubmit = async (values: ApartmentForm) => {
    const payload: ApartmentForm = {
      ...values,
      title: values.title.trim(),
      slug: (values.slug?.trim() || toSlug(values.title)).trim(),
      locationId: Number(values.locationId || selectedLocation?.id),
      rentPrice: (values.rentPrice ?? "0").toString(),
      currency: values.currency || "VND",
      coverImageUrl: values.coverImageUrl?.trim() || undefined,
      description: values.description || "", // từ SunEditor
    };

    try {
      if (isEdit) {
        await apartmentService.update(Number(id), payload);
        toast.success("Cập nhật căn hộ thành công!");
      } else {
        await apartmentService.create(payload);
        toast.success("Tạo căn hộ thành công!");
      }
      router.push("/admin/apartment");
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  if (isEdit && loadingDetail) {
    return (
      <div className="min-h-[400px] grid place-items-center">
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
              <p className="text-sm text-slate-500">{isEdit ? "Chỉnh sửa căn hộ" : "Tạo căn hộ mới"}</p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">
                {title?.trim() || "Căn hộ chưa có tiêu đề"}
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
              form="apartment-form"
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
                  <span>{isEdit ? "Cập nhật" : "Tạo mới"}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/apartment")}
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
                placeholder="Nhập tiêu đề căn hộ…"
                {...register("title", { required: "Vui lòng nhập tiêu đề" })}
              />
              {errors.title && <p className="text-red-600 text-sm">{String(errors.title.message)}</p>}

              <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Permalink:</span>
                <span className="truncate">
                  /apartments/<span className="font-mono text-slate-800">{slug || toSlug(title || "")}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-mono"
                  placeholder="slug-tuy-chinh (tuỳ chọn)"
                  {...register("slug")}
                />
                <button
                  type="button"
                  onClick={() => setValue("slug", toSlug(title || ""), { shouldDirty: true })}
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm cursor-pointer"
                >
                  Tạo
                </button>
              </div>
            </div>
          </Section>

          <Section title="Mô tả ngắn">
            <textarea
              rows={3}
              className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="Mô tả ngắn (excerpt)…"
              {...register("excerpt")}
            />
          </Section>

          <Section title="Địa chỉ & Toạ độ (tuỳ chọn)">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 md:col-span-3"
                placeholder="Số nhà, đường, ..."
                {...register("streetAddress")}
              />
              <input
                className="rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Vĩ độ (lat)"
                {...register("lat")}
              />
              <input
                className="rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Kinh độ (lng)"
                {...register("lng")}
              />
              <input
                className="rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Diện tích m²"
                {...register("areaM2")}
              />
            </div>
          </Section>

          {/* 🔁 Thay textarea bằng SunEditor cho mô tả chi tiết */}
          <Section title="Mô tả chi tiết">
            <div className="rounded-lg border-2 border-dashed border-slate-300 p-2">
              <Controller
                name="description"
                control={control}
                rules={{
                  validate: (v) =>
                    (v && v.replace(/<[^>]*>/g, "").trim().length > 0) || "Vui lòng nhập nội dung",
                }}
                render={({ field: { value, onChange } }) => (
                  <CustomSunEditor value={value || ""} onChange={onChange} />
                )}
              />
            </div>
            {errors.description && (
              <p className="text-red-600 text-sm mt-2">{String(errors.description.message || errors.description)}</p>
            )}
            <div className="text-xs text-slate-500 mt-2">{wordCountFromHtml(descriptionHtml)} từ</div>
          </Section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Section title="Khu vực & Trạng thái">
            <div className="space-y-4">
              <Controller
                control={control}
                name="locationId"
                rules={{ required: "Vui lòng chọn khu vực" }}
                render={({ field }) => (
                  <LocationLookup
                    value={selectedLocation}
                    onChange={(loc) => {
                      setSelectedLocation(loc);
                      field.onChange(loc?.id);
                    }}
                  />
                )}
              />
              {errors.locationId && (
                <p className="text-red-600 text-sm">{String(errors.locationId.message)}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Trạng thái</label>
                  <select
                    className="w-full rounded border border-dashed border-slate-300 bg-white focus:border-emerald-500 focus:ring-emerald-500"
                    {...register("status", { required: true })}
                  >
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                    <option value="archived">archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Đơn vị tiền tệ</label>
                  <input
                    className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="VND"
                    {...register("currency")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Phòng ngủ</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    {...register("bedrooms", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Phòng tắm</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    {...register("bathrooms", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Giá thuê</label>
                <input
                  inputMode="numeric"
                  className="w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Ví dụ: 6500000"
                  {...register("rentPrice", { required: "Vui lòng nhập giá thuê" })}
                />
                {errors.rentPrice && (
                  <p className="text-red-600 text-sm">{String(errors.rentPrice.message)}</p>
                )}
              </div>
            </div>
          </Section>

          <Section title="Ảnh cover (tuỳ chọn)">
            <UploadPicker
              value={cover || null}
              onChange={(val) => setValue("coverImageUrl", val || "", { shouldDirty: true })}
            />
          </Section>

          <Section title="Kiểm tra nhanh">
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className={`w-4 h-4 mt-0.5 ${title?.trim() ? "text-emerald-600" : "text-slate-300"}`}
                />
                <span>Đã có tiêu đề.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className={`w-4 h-4 mt-0.5 ${
                    (slug || toSlug(title || "")).length ? "text-emerald-600" : "text-slate-300"
                  }`}
                />
                <span>Slug hợp lệ.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className={`w-4 h-4 mt-0.5 ${selectedLocation ? "text-emerald-600" : "text-slate-300"}`}
                />
                <span>Đã chọn khu vực.</span>
              </li>
            </ul>
          </Section>
        </div>
      </div>

      <form id="apartment-form" onSubmit={handleSubmit(onSubmit)} className="hidden" />
    </div>
  );
}
