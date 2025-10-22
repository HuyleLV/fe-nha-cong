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
import SeoScoreCard from "@/components/SeoScoreCard";

/* ---------- helpers ---------- */
const inputCls =
  "h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white";
const textAreaCls =
  "w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 p-3 bg-white";

function wordCountFromHtml(html?: string) {
  if (!html) return 0;
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/?[^>]+(>|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(" ").length : 0;
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
      description: "",
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
  images: [],

      electricityPricePerKwh: null,
      waterPricePerM3: null,
      internetPricePerRoom: null,
      commonServiceFeePerPerson: null,

      hasAirConditioner: false,
      hasWaterHeater: false,
      hasKitchenCabinet: false,
      hasWashingMachine: false,
      hasWardrobe: false,

      hasPrivateBathroom: false,
      hasMezzanine: false,
      noOwnerLiving: false,
      flexibleHours: false,

      focusKeyword: "", // ✅ chỉ để chấm điểm SEO, không gửi lên API
    },
  });

  const title = watch("title");
  const slug = watch("slug");
  const cover = watch("coverImageUrl") ?? "";
  const images = watch("images") || [] as string[];
  const descriptionHtml = watch("description") || "";
  const focusKeyword = watch("focusKeyword") || ""; // ✅ theo dõi keyword

  // auto slug
  useEffect(() => {
    if (!slug?.trim() && title?.trim()) setValue("slug", toSlug(title), { shouldDirty: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  // load detail
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
          images: ap.images || [],
          locationId: (ap.location?.id as unknown as number) ?? (undefined as unknown as number),

          electricityPricePerKwh: ap.electricityPricePerKwh ?? null,
          waterPricePerM3: ap.waterPricePerM3 ?? null,
          internetPricePerRoom: ap.internetPricePerRoom ?? null,
          commonServiceFeePerPerson: ap.commonServiceFeePerPerson ?? null,

          hasAirConditioner: ap.hasAirConditioner ?? false,
          hasWaterHeater: ap.hasWaterHeater ?? false,
          hasKitchenCabinet: ap.hasKitchenCabinet ?? false,
          hasWashingMachine: ap.hasWashingMachine ?? false,
          hasWardrobe: ap.hasWardrobe ?? false,

          hasPrivateBathroom: ap.hasPrivateBathroom ?? false,
          hasMezzanine: ap.hasMezzanine ?? false,
          noOwnerLiving: ap.noOwnerLiving ?? false,
          flexibleHours: ap.flexibleHours ?? false,

          focusKeyword: "", // ✅ không load từ API
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

  // Đảm bảo locationId trong form luôn sync với selectedLocation để qua validation
  useEffect(() => {
    if (selectedLocation?.id) {
      setValue("locationId", selectedLocation.id as unknown as number, { shouldDirty: false });
    } else {
      setValue("locationId", undefined as unknown as number, { shouldDirty: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation?.id]);

  // normalize int or null for fee fields
  const toIntOrNull = (v: unknown) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : null;
  };

  const onSubmit = async (values: ApartmentForm) => {
    const payload: ApartmentForm = {
      ...values,
      title: values.title.trim(),
      slug: (values.slug?.trim() || toSlug(values.title)).trim(),
      locationId: Number(values.locationId || selectedLocation?.id),
      rentPrice: (values.rentPrice ?? "0").toString(),
      currency: values.currency || "VND",
      coverImageUrl: values.coverImageUrl?.trim() || undefined,
      images: Array.isArray(values.images)
        ? Array.from(new Set(values.images.filter(Boolean))).map((s) => s!.toString().trim())
        : undefined,
      description: values.description || "",

      electricityPricePerKwh: toIntOrNull(values.electricityPricePerKwh),
      waterPricePerM3: toIntOrNull(values.waterPricePerM3),
      internetPricePerRoom: toIntOrNull(values.internetPricePerRoom),
      commonServiceFeePerPerson: toIntOrNull(values.commonServiceFeePerPerson),
    };

    delete (payload as any).focusKeyword; // ✅ loại bỏ keyword khi gửi

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
          {/* Title & slug */}
          <Section title="Tiêu đề & Permalink">
            <div className="space-y-3">
              <input className={inputCls} placeholder="Nhập tiêu đề căn hộ…" {...register("title", { required: "Vui lòng nhập tiêu đề" })} />
              {errors.title && <p className="text-red-600 text-sm">{String(errors.title.message)}</p>}

              <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Permalink:</span>
                <span className="truncate">
                  /apartments/<span className="font-mono text-slate-800">{slug || toSlug(title || "")}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input className={`${inputCls} font-mono`} placeholder="slug-tuy-chinh (tuỳ chọn)" {...register("slug")} />
                <button
                  type="button"
                  onClick={() => setValue("slug", toSlug(title || ""), { shouldDirty: true })}
                  className="h-10 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm cursor-pointer"
                >
                  Tạo
                </button>
              </div>
            </div>
          </Section>

          {/* Excerpt */}
          <Section title="Mô tả ngắn">
            <textarea rows={3} className={textAreaCls} placeholder="Mô tả ngắn (excerpt)…" {...register("excerpt")} />
          </Section>

          {/* Address */}
          <Section title="Địa chỉ & Toạ độ (tuỳ chọn)">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className={`${inputCls} md:col-span-3`} placeholder="Số nhà, đường, ..." {...register("streetAddress")} />
              <input className={inputCls} placeholder="Vĩ độ (lat)" {...register("lat")} />
              <input className={inputCls} placeholder="Kinh độ (lng)" {...register("lng")} />
              <input className={inputCls} placeholder="Diện tích m²" {...register("areaM2")} />
            </div>
          </Section>

          {/* Fees */}
          <Section title="Phí dịch vụ (đồng)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Điện (đ/Kwh)</label>
                <input type="number" min={0} placeholder="4000" className={inputCls} {...register("electricityPricePerKwh", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Nước (đ/m³)</label>
                <input type="number" min={0} placeholder="35000" className={inputCls} {...register("waterPricePerM3", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Mạng (đ/Phòng)</label>
                <input type="number" min={0} placeholder="100000" className={inputCls} {...register("internetPricePerRoom", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Dịch vụ chung (đ/Người)</label>
                <input type="number" min={0} placeholder="130000" className={inputCls} {...register("commonServiceFeePerPerson", { valueAsNumber: true })} />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Để trống nếu không áp dụng.</p>
          </Section>

          {/* Furniture */}
          <Section title="Nội thất">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasAirConditioner")} /> Điều hoà</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasWaterHeater")} /> Nóng lạnh</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasKitchenCabinet")} /> Kệ bếp</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasWashingMachine")} /> Máy giặt</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasWardrobe")} /> Tủ quần áo</label>
            </div>
          </Section>

          {/* Amenities */}
          <Section title="Tiện nghi">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasPrivateBathroom")} /> Vệ sinh khép kín</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasMezzanine")} /> Gác xép</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("noOwnerLiving")} /> Không chung chủ</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("flexibleHours")} /> Giờ linh hoạt</label>
            </div>
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
              {errors.locationId && <p className="text-red-600 text-sm">{String(errors.locationId.message)}</p>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Trạng thái</label>
                  <select className={inputCls} {...register("status", { required: true })}>
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                    <option value="archived">archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Đơn vị tiền tệ</label>
                  <input className={inputCls} placeholder="VND" {...register("currency")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Phòng ngủ</label>
                  <input type="number" min={0} className={inputCls} {...register("bedrooms", { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Phòng tắm</label>
                  <input type="number" min={0} className={inputCls} {...register("bathrooms", { valueAsNumber: true })} />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Giá thuê</label>
                <input inputMode="numeric" className={inputCls} placeholder="Ví dụ: 6500000" {...register("rentPrice", { required: "Vui lòng nhập giá thuê" })} />
                {errors.rentPrice && <p className="text-red-600 text-sm">{String(errors.rentPrice.message)}</p>}
              </div>
            </div>
          </Section>

          <Section title="Ảnh cover (tuỳ chọn)">
            <UploadPicker value={cover || null} onChange={(val) => setValue("coverImageUrl", val || "", { shouldDirty: true })} />
          </Section>

          <Section title="Bộ ảnh (gallery)">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(images as string[]).map((img, idx) => (
                  <div key={idx} className="space-y-2">
                    <UploadPicker
                      value={img || null}
                      onChange={(val) => {
                        const next = [...(images as string[])];
                        next[idx] = val || "";
                        setValue("images", next, { shouldDirty: true });
                      }}
                      aspectClass="aspect-[4/3]"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded border border-slate-200 text-sm hover:bg-slate-50 cursor-pointer"
                        onClick={() => {
                          const next = (images as string[]).filter((_, i) => i !== idx);
                          setValue("images", next, { shouldDirty: true });
                        }}
                      >
                        Xoá ảnh
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setValue("images", [...(images as string[]), ""], { shouldDirty: true })}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Thêm ảnh
                </button>
              </div>
              <p className="text-xs text-slate-500">Gợi ý: Không cần thêm ảnh cover vào gallery; hệ thống sẽ tự tách cover khỏi images.</p>
            </div>
          </Section>

          <Section title="Kiểm tra nhanh">
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 ${title?.trim() ? "text-emerald-600" : "text-slate-300"}`} />
                <span>Đã có tiêu đề.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 ${(slug || toSlug(title || "")).length ? "text-emerald-600" : "text-slate-300"}`} />
                <span>Slug hợp lệ.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 ${selectedLocation ? "text-emerald-600" : "text-slate-300"}`} />
                <span>Đã chọn khu vực.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 ${wordCountFromHtml(descriptionHtml) >= 300 ? "text-emerald-600" : "text-slate-300"}`} />
                <span>Tối thiểu 300 từ mô tả chi tiết.</span>
              </li>
            </ul>
          </Section>
        </div>
      </div>

      {/* ===== MÔ TẢ CHI TIẾT: luôn ở dưới cùng, full-width ===== */}
      <div className="p-4">
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
            <p className="text-red-600 text-sm mt-2">
              {String(errors.description.message || errors.description)}
            </p>
          )}
          <div className="text-xs text-slate-500 mt-2">{wordCountFromHtml(descriptionHtml)} từ</div>

          {/* ===== SEO SCORING ===== */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Focus keyword input */}
            <div className="lg:col-span-1 space-y-2">
              <label className="text-sm text-slate-600">Từ khoá chính (Focus Keyword)</label>
              <input
                className={inputCls}
                placeholder="vd: phòng trọ hà đông, căn hộ mini hà nội…"
                value={focusKeyword}
                onChange={(e) => setValue("focusKeyword", e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Dùng 1 cụm từ để SeoScoreCard chấm điểm nội dung.
              </p>
            </div>

            {/* SeoScoreCard */}
            <div className="lg:col-span-2">
              <SeoScoreCard
                title={title || ""}
                slug={slug || toSlug(title || "")}
                excerpt={watch("excerpt") || ""}
                contentHtml={descriptionHtml || ""}
                cover={cover || ""}
                tags={[]} // hiện tại căn hộ không có tag, nên truyền mảng rỗng
                focusKeyword={focusKeyword}
                onChangeFocusKeyword={(kw) => setValue("focusKeyword", kw)}
              />
            </div>
          </div>

        </Section>
      </div>

      <form id="apartment-form" onSubmit={handleSubmit(onSubmit)} className="hidden" />
    </div>
  );
}