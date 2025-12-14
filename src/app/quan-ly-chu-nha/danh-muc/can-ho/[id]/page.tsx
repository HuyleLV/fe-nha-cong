"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { Save, ChevronRight, Link as LinkIcon, CheckCircle2, Info } from "lucide-react";

import Spinner from "@/components/spinner";
import UploadPicker from "@/components/UploadPicker";
import VideoUploadPicker from "@/components/VideoUploadPicker";
import LocationLookup from "@/app/admin/components/locationLookup";
import { toSlug } from "@/utils/formatSlug";
import { apartmentService } from "@/services/apartmentService";
import { Apartment, ApartmentForm, ApartmentStatus } from "@/type/apartment";
import { Location } from "@/type/location";
import CustomSunEditor from "@/app/admin/components/customSunEditor";
import SeoScoreCard from "@/components/SeoScoreCard";
import { buildingService } from "@/services/buildingService";
import type { Building } from "@/type/building";
import { userService } from "@/services/userService";

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

export default function HostApartmentFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = useMemo(() => id !== "create", [id]);
  const router = useRouter();
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

  const [loadingDetail, setLoadingDetail] = useState<boolean>(isEdit);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ApartmentForm & { discountInput?: string }>({
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      description: "",
      videoUrl: "",
      locationId: undefined as unknown as number,
      buildingId: null,
      streetAddress: "",
      lat: "",
      lng: "",
      bedrooms: 0,
      bathrooms: 0,
      livingRooms: 0,
    roomCode: "",
  guests: 0,
  floorNumber: undefined as unknown as number, // chỉ áp dụng nếu thuộc toà nhà
      areaM2: "",
      rentPrice: "0",
      currency: "VND",
      status: "draft" as ApartmentStatus,
  roomStatus: 'o_ngay',
  depositAmount: "",
  discountPercent: 0,
  discountAmount: "",
  discountInput: "", // ô nhập hợp nhất (ví dụ: 15% hoặc 500000)
  commissionPercent: 0,
      coverImageUrl: "",
      images: [],

      electricityPricePerKwh: null,
      waterPricePerM3: null,
      internetPricePerRoom: null,
      commonServiceFeePerPerson: null,
      serviceFeeNote: "",
      furnitureNote: "",
      amenitiesNote: "",

      hasAirConditioner: false,
      hasWaterHeater: false,
      hasKitchenCabinet: false,
      hasWashingMachine: false,
      hasWardrobe: false,
      hasBed: false,
      hasMattress: false,
      hasBedding: false,
      hasDressingTable: false,
      hasSofa: false,

      hasSharedBathroom: false,
      hasWashingMachineShared: false,
      hasWashingMachinePrivate: false,
      hasDesk: false,
      hasKitchenTable: false,
      hasRangeHood: false,
      hasFridge: false,

      hasPrivateBathroom: false,
      hasMezzanine: false,
      noOwnerLiving: false,
      flexibleHours: false,
      hasElevator: false,
      allowPet: false,
      allowElectricVehicle: false,

      focusKeyword: "", // ✅ chỉ để chấm điểm SEO, không gửi lên API
      isVerified: false,
    },
  });

  // Map technical field names to friendly Vietnamese labels for toast messages
  const fieldLabelMap: Record<string, string> = {
    title: 'Tiêu đề',
    locationId: 'Khu vực',
    rentPrice: 'Giá thuê',
    description: 'Mô tả chi tiết',
    images: 'Ảnh',
    coverImageUrl: 'Ảnh bìa',
    status: 'Trạng thái',
    areaM2: 'Diện tích',
    bedrooms: 'Phòng ngủ',
    bathrooms: 'Vệ sinh',
    roomCode: 'Mã phòng',
    floorNumber: 'Tầng',
  };

  // Called by header Save button. Runs validation, shows toast errors if invalid,
  // or proceeds to submit when valid.
  async function handleSave() {
    try {
      const valid = await trigger();
      if (valid) {
        // perform normal submit
        await handleSubmit(onSubmit)();
        return;
      }

      // collect error messages
      const msgs: string[] = [];
      const collect = (obj: any) => {
        if (!obj) return;
        for (const k of Object.keys(obj)) {
          const v = obj[k];
          if (!v) continue;
          if (typeof v.message === 'string' && v.message) {
            msgs.push(v.message);
          } else if (v.types && typeof v.types === 'object') {
            msgs.push(...Object.values(v.types).map((x: any) => String(x)).filter(Boolean));
          } else if (v.type === 'required') {
            msgs.push(fieldLabelMap[k] ?? `Trường ${k} bắt buộc`);
          } else if (typeof v === 'object') {
            // nested errors (e.g., array/object)
            collect(v);
          }
        }
      };

      collect(errors as any);
      const unique = Array.from(new Set(msgs));
      if (!unique.length) unique.push('Vui lòng kiểm tra lại thông tin nhập');
      unique.forEach((m) => toast.error(m));
    } catch (e) {
      toast.error('Có lỗi khi kiểm tra dữ liệu. Vui lòng thử lại.');
    }
  }

  const title = watch("title");
  const slug = watch("slug");
  const cover = watch("coverImageUrl") ?? "";
  const images = watch("images") || [] as string[];
  const descriptionHtml = watch("description") || "";
  const videoUrl = watch("videoUrl") || "";
  const focusKeyword = watch("focusKeyword") || ""; // ✅ theo dõi keyword
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  // auto slug
  useEffect(() => {
    if (!slug?.trim() && title?.trim()) setValue("slug", toSlug(title), { shouldDirty: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  // load detail
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoadingDetail(true);
      try {
        const ap: Apartment = await apartmentService.getById(Number(id));
        const me = await userService.getMe();
        // if owner id exists, enforce equality
        if (ap.createdById && me && String(ap.createdById) !== String(me.id)) {
          toast.error("Bạn không có quyền xem/chỉnh sửa căn hộ này");
          router.replace("/quan-ly-chu-nha/danh-muc/can-ho");
          return;
        }
        // Detect saved video from images array (first media if video-like)
        const detectVideo = (arr?: string[] | null): string => {
          if (!Array.isArray(arr) || !arr.length) return "";
          const isVideo = (u?: string | null) => {
            if (!u) return false;
            const s = String(u).toLowerCase();
            return s.includes('/static/videos/') || s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov') || s.includes('youtube.com') || s.includes('youtu.be') || s.includes('vimeo.com');
          };
          const first = arr.find(isVideo);
          return first || "";
        };
        const savedVideo = detectVideo((ap as any).images as string[]);
        reset({
          title: ap.title,
          slug: ap.slug,
          excerpt: ap.excerpt || "",
          description: ap.description || "",
          videoUrl: savedVideo,
          streetAddress: ap.streetAddress || "",
          lat: ap.lat || "",
          lng: ap.lng || "",
          bedrooms: ap.bedrooms,
          	livingRooms: ap.livingRooms ?? 0,
            roomCode: (ap as any).roomCode ?? "",
            guests: (ap as any).guests ?? 0,
          bathrooms: ap.bathrooms,
          floorNumber: (ap as any).floorNumber ?? (undefined as unknown as number),
          areaM2: ap.areaM2 || "",
          rentPrice: ap.rentPrice,
          currency: ap.currency,
          status: ap.status,
          roomStatus: (ap as any).roomStatus ?? (ap as any).room_status ?? 'o_ngay',
          discountPercent: (ap as any).discountPercent ?? 0,
          discountAmount: (ap as any).discountAmount ?? "",
          discountInput: (() => {
            const pct = (ap as any).discountPercent;
            const amtStr = (ap as any).discountAmount;
            const price = parseFloat(String(ap.rentPrice).replace(/,/g,''));
            const pctVal = typeof pct === 'number' && pct > 0 ? Math.round(price * pct / 100) : 0;
            const amtVal = amtStr ? parseFloat(String(amtStr).replace(/,/g,'')) : 0;
            if (pctVal === 0 && amtVal === 0) return "";
            if (pctVal >= amtVal && pctVal > 0 && pct) return `${pct}%`;
            if (amtVal > 0) return String(Math.round(amtVal));
            return "";
          })(),
          coverImageUrl: ap.coverImageUrl || "",
          depositAmount: (ap as any).depositAmount ?? "",
          images: ap.images || [],
          isVerified: ap.isVerified ?? false,
          commissionPercent: (ap as any).commissionPercent ?? 0,
          locationId: (ap.location?.id as unknown as number) ?? (undefined as unknown as number),
          buildingId: ap.buildingId ?? null,

          electricityPricePerKwh: ap.electricityPricePerKwh ?? null,
          waterPricePerM3: ap.waterPricePerM3 ?? null,
          internetPricePerRoom: ap.internetPricePerRoom ?? null,
          commonServiceFeePerPerson: ap.commonServiceFeePerPerson ?? null,
          serviceFeeNote: (ap as any).serviceFeeNote ?? "",
          furnitureNote: (ap as any).furnitureNote ?? "",
          amenitiesNote: (ap as any).amenitiesNote ?? "",

          hasAirConditioner: ap.hasAirConditioner ?? false,
          hasWaterHeater: ap.hasWaterHeater ?? false,
          hasKitchenCabinet: ap.hasKitchenCabinet ?? false,
          hasWashingMachine: ap.hasWashingMachine ?? false,
          hasWardrobe: ap.hasWardrobe ?? false,
          hasBed: (ap as any).hasBed ?? false,
          hasMattress: (ap as any).hasMattress ?? false,
          hasBedding: (ap as any).hasBedding ?? false,
          hasDressingTable: (ap as any).hasDressingTable ?? false,
          hasSofa: (ap as any).hasSofa ?? false,

          	hasSharedBathroom: ap.hasSharedBathroom ?? false,
          	hasWashingMachineShared: ap.hasWashingMachineShared ?? false,
          	hasWashingMachinePrivate: ap.hasWashingMachinePrivate ?? false,
          	hasDesk: ap.hasDesk ?? false,
          	hasKitchenTable: ap.hasKitchenTable ?? false,
          	hasRangeHood: ap.hasRangeHood ?? false,
          	hasFridge: ap.hasFridge ?? false,

          hasPrivateBathroom: ap.hasPrivateBathroom ?? false,
          hasMezzanine: ap.hasMezzanine ?? false,
          noOwnerLiving: ap.noOwnerLiving ?? false,
          flexibleHours: ap.flexibleHours ?? false,
          hasElevator: (ap as any).hasElevator ?? false,
          allowPet: ap.allowPet ?? false,
          allowElectricVehicle: ap.allowElectricVehicle ?? false,

          focusKeyword: "", // ✅ không load từ API
        });
        setSelectedLocation(ap.location || null);
      } catch {
        toast.error("Không tải được căn hộ");
        router.replace("/quan-ly-chu-nha/danh-muc/can-ho");
      } finally {
        setLoadingDetail(false);
      }
    })();
  }, [id, isEdit, reset, router]);

  // Load building options for selection
  useEffect(() => {
    (async () => {
      try {
        const res = await buildingService.getAll({ page: 1, limit: 200 });
        setBuildings(res.items || []);
      } catch {
        setBuildings([]);
      }
    })();
  }, []);

  // Load current user role (used to hide admin-only UI on host pages)
  useEffect(() => {
    (async () => {
      try {
        const me = await userService.getMe();
        setUserRole(me?.role || null);
      } catch {
        setUserRole(null);
      }
    })();
  }, []);

  // Prefill buildingId from query if provided
  useEffect(() => {
    if (!isEdit && search?.get('buildingId')) {
      const bid = Number(search.get('buildingId'));
      if (!Number.isNaN(bid)) {
        setValue('buildingId' as any, bid as any, { shouldDirty: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

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

  const onSubmit = async (values: ApartmentForm & { discountInput?: string }) => {
    // Build gallery images and ensure video (if provided) goes first
    const rawImages = Array.isArray(values.images)
      ? Array.from(new Set(values.images.filter(Boolean))).map((s) => s!.toString().trim())
      : [] as string[];
    const vUrl = (values.videoUrl || "").trim();
    const imagesOrdered = vUrl
      ? [vUrl, ...rawImages.filter((u) => u !== vUrl)]
      : rawImages;

    const payload: ApartmentForm = {
      ...values,
      title: values.title.trim(),
      slug: (values.slug?.trim() || toSlug(values.title)).trim(),
      locationId: Number(values.locationId || selectedLocation?.id),
      rentPrice: (values.rentPrice ?? "0").toString(),
      currency: values.currency || "VND",
      depositAmount: values.depositAmount ? String(values.depositAmount) : undefined,
  // discount sẽ được phân tích từ discountInput bên dưới
      coverImageUrl: values.coverImageUrl?.trim() || undefined,
      images: imagesOrdered.length ? imagesOrdered : undefined,
      description: values.description || "",

      electricityPricePerKwh: toIntOrNull(values.electricityPricePerKwh),
      waterPricePerM3: toIntOrNull(values.waterPricePerM3),
      internetPricePerRoom: toIntOrNull(values.internetPricePerRoom),
      commonServiceFeePerPerson: toIntOrNull(values.commonServiceFeePerPerson),
  serviceFeeNote: values.serviceFeeNote?.trim() || undefined,
      furnitureNote: values.furnitureNote?.trim() || undefined,
      amenitiesNote: values.amenitiesNote?.trim() || undefined,
    };

    // Clean up fields that should not be sent as null to satisfy BE DTO (@IsOptional + @IsInt)
    // - If buildingId is null/NaN, drop it so BE treats as undefined
    if ((payload as any).buildingId == null || Number.isNaN((payload as any).buildingId)) {
      delete (payload as any).buildingId;
    }
    // Remove floorNumber if invalid or not provided (<=0 or NaN)
    if ((payload as any).floorNumber == null || Number.isNaN((payload as any).floorNumber) || (payload as any).floorNumber <= 0) {
      delete (payload as any).floorNumber;
    }
    // - For fee fields, remove if null so validation skips them
    const feeKeys: Array<keyof ApartmentForm> = [
      'electricityPricePerKwh',
      'waterPricePerM3',
      'internetPricePerRoom',
      'commonServiceFeePerPerson',
    ];
    for (const k of feeKeys) {
      if ((payload as any)[k] == null) delete (payload as any)[k];
    }
    // Normalize discount: if NaN, remove; allow 0 to clear
    // Phân tích ô discountInput: host chỉ cần nhập số tiền, admin vẫn có thể nhập % hoặc số tiền
    const rawDiscount: string = (values as any).discountInput?.trim() || "";
    delete (payload as any).discountPercent;
    delete (payload as any).discountAmount;
    if (rawDiscount) {
      const price = parseFloat(String(values.rentPrice || payload.rentPrice || "0").replace(/,/g, '.')) || 0;
      if (userRole === 'host') {
        // For hosts: prefer numeric amount. If percent provided, convert it to amount using rentPrice.
        if (/^\d+(?:[.,]\d+)?$/.test(rawDiscount)) {
          const amt = parseFloat(rawDiscount.replace(/,/g, '.'));
          if (Number.isFinite(amt) && amt >= 0) (payload as any).discountAmount = amt.toFixed(2);
        } else if (/^\d+(?:\.\d+)?%$/.test(rawDiscount)) {
          const pct = parseFloat(rawDiscount.replace('%', ''));
          if (Number.isFinite(pct) && pct >= 0 && price > 0) {
            const amt = Math.round(price * pct / 100);
            (payload as any).discountAmount = String(amt);
          }
        }
      } else {
        // For admins/others: allow percent or absolute amount
        if (/^\d+(?:\.\d+)?%$/.test(rawDiscount)) {
          const num = parseFloat(rawDiscount.replace('%',''));
          if (Number.isFinite(num) && num >= 0) {
            (payload as any).discountPercent = Math.min(100, Math.round(num));
          }
        } else if (/^\d+(?:[.,]\d+)?$/.test(rawDiscount)) {
          const amt = parseFloat(rawDiscount.replace(/,/g,'.'));
          if (Number.isFinite(amt) && amt >= 0) {
            (payload as any).discountAmount = amt.toFixed(2); // chuẩn hoá
          }
        }
      }
    }
    // Không gửi discountInput lên API
    delete (payload as any).discountInput;

    // Normalize commissionPercent: clamp to 0-100 if present
    if ((values as any).commissionPercent != null && (values as any).commissionPercent !== "") {
      const cp = Number((values as any).commissionPercent);
      if (Number.isFinite(cp)) {
        (payload as any).commissionPercent = Math.min(100, Math.max(0, Math.round(cp)));
      }
    }
    if ((payload as any).commissionPercent == null) delete (payload as any).commissionPercent;

  // Remove local-only fields
  delete (payload as any).focusKeyword; // ✅ loại bỏ keyword khi gửi
  delete (payload as any).videoUrl; // ✅ chỉ dùng để sắp xếp, không gửi riêng

    try {
      if (isEdit) {
        // First update core fields/images
        const updated = await apartmentService.update(Number(id), payload);
        // Then update video through dedicated endpoint to ensure ordering first
        const v = (values.videoUrl || "").trim();
        await apartmentService.updateVideo(Number(id), v || null);
        toast.success("Cập nhật căn hộ thành công!");
      } else {
        // Create then optionally set video after we have an id
        const created = await apartmentService.create(payload);
        const v = (values.videoUrl || "").trim();
        if (v) await apartmentService.updateVideo(created.id, v);
        toast.success("Tạo căn hộ thành công!");
      }
      router.push("/quan-ly-chu-nha/danh-muc/can-ho");
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
              type="button"
              onClick={async () => await handleSave()}
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
              onClick={() => router.push("/quan-ly-chu-nha/danh-muc/can-ho")}
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
              <input className={inputCls} placeholder="Nhập tiêu đề căn hộ…" {...register("title", { required: "Vui lòng nhập tiêu đề căn hộ" })} />
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
            <div className="mt-3">
              <label className="block text-sm text-slate-600 mb-1">Ghi chú phí dịch vụ (hiển thị cho khách)</label>
              <textarea rows={3} className={textAreaCls} placeholder="Ví dụ: Điện nước tính theo hoá đơn nhà nước, free dọn vệ sinh hành lang..." {...register("serviceFeeNote")} />
              <p className="text-xs text-slate-500 mt-1">Để trống nếu không có ghi chú.</p>
            </div>
            <p className="text-xs text-slate-500 mt-2">Để trống các ô phí nếu không áp dụng.</p>
          </Section>

          {/* Furniture */}
          <Section title="Nội thất">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasAirConditioner")} /> Điều hoà</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasWaterHeater")} /> Nóng lạnh</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasKitchenCabinet")} /> Kệ bếp</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasWardrobe")} /> Tủ quần áo</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasFridge")} /> Tủ lạnh</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasRangeHood")} /> Hút mùi</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasKitchenTable")} /> Bàn bếp</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasDesk")} /> Bàn làm việc</label>
              {/* New furniture items */}
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasBed")} /> Giường</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasMattress")} /> Đệm</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasBedding")} /> Ga gối</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasDressingTable")} /> Bàn trang điểm</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasSofa")} /> Sofa</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasWashingMachineShared")} /> Máy giặt (chung)</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasWashingMachinePrivate")} /> Máy giặt (riêng)</label>
            </div>
            <div className="mt-3">
              <label className="block text-sm text-slate-600 mb-1">Ghi chú nội thất (hiển thị cho khách)</label>
              <textarea rows={3} className={textAreaCls} placeholder="Ví dụ: Nội thất có thể thay đổi theo phòng, vui lòng xem ảnh chi tiết hoặc liên hệ." {...register("furnitureNote")} />
              <p className="text-xs text-slate-500 mt-1">Để trống nếu không có ghi chú.</p>
            </div>
          </Section>

          {/* Amenities */}
          <Section title="Tiện nghi">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasPrivateBathroom")} /> Vệ sinh khép kín</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasSharedBathroom")} /> Vệ sinh chung</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasMezzanine")} /> Gác xép</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("noOwnerLiving")} /> Không chung chủ</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("flexibleHours")} /> Giờ linh hoạt</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("hasElevator")} /> Thang máy</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("allowPet")} /> Cho nuôi pet</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" {...register("allowElectricVehicle")} /> Xe điện (sạc/gửi)</label>
            </div>
            <div className="mt-3">
              <label className="block text-sm text-slate-600 mb-1">Ghi chú tiện nghi (hiển thị cho khách)</label>
              <textarea rows={3} className={textAreaCls} placeholder="Ví dụ: Một số tiện nghi thuộc khu vực chung của toà nhà, giờ giấc sử dụng theo nội quy." {...register("amenitiesNote")} />
              <p className="text-xs text-slate-500 mt-1">Để trống nếu không có ghi chú.</p>
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

              {/* Building selection (optional) */}
              <div>
                <label className="block text-sm text-slate-600 mb-1">Tòa nhà (tuỳ chọn)</label>
                <select
                  className={inputCls}
                  value={(watch("buildingId") ?? "").toString()}
                  onChange={(e) => setValue("buildingId" as any, e.target.value ? Number(e.target.value) : null, { shouldDirty: true })}
                >
                  <option value="">Không thuộc tòa</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Trạng thái</label>
                  <select className={inputCls} {...register("status", { required: "Vui lòng chọn trạng thái" })}>
                    <option value="draft">Nháp</option>
                    <option value="published">Công khai</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                  {errors.status && (
                    <p className="text-red-600 text-sm mt-1">{String(errors.status.message)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Trạng thái phòng</label>
                  <select className={inputCls} {...register("roomStatus") }>
                    <option value="o_ngay">Ở ngay</option>
                    <option value="sap_trong">Sắp trống</option>
                    <option value="het_phong">Hết phòng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Đơn vị tiền tệ</label>
                  <input className={inputCls} placeholder="VND" {...register("currency")} />
                </div>
              </div>

              <div className="mt-3">
                {userRole === 'admin' ? (
                  <div className="mt-3">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" {...register("isVerified")} />
                      <span className="text-sm text-slate-700">Đã xác minh (hiển thị dấu tích xanh)</span>
                    </label>
                  </div>
                ) : null}

              

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Phòng ngủ</label>
                  <input type="number" min={0} className={inputCls} {...register("bedrooms", { valueAsNumber: true, min: { value: 0, message: "Số phòng ngủ không hợp lệ" } })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Vệ sinh</label>
                  <input type="number" min={0} className={inputCls} {...register("bathrooms", { valueAsNumber: true, min: { value: 0, message: "Số phòng vệ sinh không hợp lệ" } })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Phòng khách</label>
                  <input type="number" min={0} className={inputCls} {...register("livingRooms", { valueAsNumber: true, min: { value: 0, message: "Số phòng khách không hợp lệ" } })} />
                </div>
			<div>
			  <label className="block text-sm text-slate-600 mb-1">Mã phòng (tuỳ chọn)</label>
			  <input type="text" className={inputCls} placeholder="VD: P302" {...register("roomCode", { maxLength: { value: 50, message: "Mã phòng quá dài" } })} />
			</div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Số người ở tối đa</label>
                    <input type="number" min={0} className={inputCls} {...register("guests", { valueAsNumber: true, min: { value: 0, message: "Số người ở tối đa không hợp lệ" } })} />
                  </div>
                    {/* Floor number only when buildingId is selected */}
                    {watch("buildingId") ? (
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Tầng (≥1)</label>
                        <input
                          type="number"
                          min={1}
                          className={inputCls}
                          placeholder="Ví dụ: 3"
                          {...register("floorNumber", {
                            valueAsNumber: true,
                            min: { value: 1, message: "Tầng phải >= 1" },
                          })}
                        />
                        {errors.floorNumber && (
                          <p className="text-red-600 text-sm mt-1">{String(errors.floorNumber.message)}</p>
                        )}
                      </div>
                    ) : null}
              </div>

              <div className="my-2">
                <label className="block text-sm text-slate-600 mb-1">Giá thuê</label>
                <input inputMode="numeric" className={inputCls} placeholder="Ví dụ: 6500000" {...register("rentPrice", { required: "Vui lòng nhập giá thuê", validate: (v) => (v && String(v).trim().length > 0) || "Giá thuê không được để trống" })} />
                {errors.rentPrice && <p className="text-red-600 text-sm">{String(errors.rentPrice.message)}</p>}
              </div>
              <div className="my-2">
                <label className="block text-sm text-slate-600 mb-1">Tiền đặt cọc (VND)</label>
                <input inputMode="numeric" className={inputCls} placeholder="Ví dụ: 1300000" {...register("depositAmount")} />
                <p className="text-xs text-slate-500 mt-1">Để trống nếu không có đặt cọc.</p>
              </div>
              <div className="md:col-span-2 my-2">
                <label className="block text-sm text-slate-600 mb-1">{userRole === 'host' ? 'Ưu đãi (số tiền, VND)' : 'Ưu đãi (% hoặc số tiền)'}</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder={userRole === 'host' ? 'Ví dụ: 500000' : 'Ví dụ: 15% hoặc 500000'}
                  {...register("discountInput" as any)}
                />
                <p className="text-xs text-slate-500 mt-1">{userRole === 'host' ? 'Nhập số tiền giảm (VD: 500000).' : 'Nhập %. Để trống nếu không có ưu đãi.'}</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-600 mb-1">Hoa hồng CTV (%)</label>
                <input type="number" min={0} max={100} className={inputCls} placeholder="Ví dụ: 5" {...register("commissionPercent", { valueAsNumber: true })} />
                <p className="text-xs text-slate-500 mt-1">Nhập phần trăm hoa hồng dành cho CTV (0-100). Để trống nếu không áp dụng.</p>
              </div>
            </div>
            </div>
          </Section>

          <Section title="Ảnh cover (tuỳ chọn)">
            <UploadPicker value={cover || null} onChange={(val) => setValue("coverImageUrl", val || "", { shouldDirty: true })} />
          </Section>

          <Section title="Bộ ảnh (gallery)">
            <div className="space-y-3">
              {/* Video URL (optional) */}
              <div className="space-y-2">
                <label className="block text-sm text-slate-600">Video (tuỳ chọn)</label>
                <VideoUploadPicker
                  value={videoUrl || null}
                  onChange={(val) => setValue("videoUrl", val || "", { shouldDirty: true })}
                />
                <input
                  className={inputCls}
                  placeholder="Hoặc dán link YouTube/Vimeo hoặc URL .mp4/.webm"
                  {...register("videoUrl")}
                />
                {videoUrl && (
                  <p className="text-xs text-emerald-700">Video sẽ được ưu tiên hiển thị đầu tiên trong gallery.</p>
                )}
              </div>

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
