// app/rooms/[slug]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, Heart, Share2, MapPin, Home, ShowerHead, BedDouble, Ruler, Lock,
  Zap, Wifi, Car, ShieldCheck, Phone, CalendarDays, Copy, X, Sparkles, User,
  Clock, CheckCircle2, Calendar, Lightbulb, FileText, AlertCircle, MessageCircle,
  Package, UtensilsCrossed, Hammer, Sofa, PawPrint, BatteryCharging,
  ArrowUpDown, BadgeCheck, Wind, Check
} from "lucide-react";
import clsx from "clsx";
import { toast } from "react-toastify";
import { apartmentService } from "@/services/apartmentService";
import { viewingService } from "@/services/viewingService";
import { favoriteService } from "@/services/favoriteService";
import { Apartment } from "@/type/apartment";
import { formatMoneyVND } from "@/utils/format-number";
import { fDate } from "@/utils/format-time";
import { asImageSrc } from "@/utils/imageUrl";
import CommentList from "@/components/CommentList";
import CommentForm from "@/components/CommentForm";

/* ===================== Helpers ===================== */
// Simple cookie reader for checking auth token
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
  return null;
}
const hasLoginToken = () => {
  if (typeof window === "undefined") return false;
  return !!(
    getCookie("access_token") ||
    window.localStorage.getItem("access_token") ||
    window.sessionStorage.getItem("access_token") ||
    window.localStorage.getItem("tokenAdmin") ||
    window.localStorage.getItem("tokenUser")
  );
};

// Đọc thông tin người dùng đã đăng nhập (được lưu ở cookie/localStorage với key 'auth_user')
function readAuthUser(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    // Ưu tiên cookie để đồng bộ đa tab
    const cookieMatch = document.cookie.match(/(^| )auth_user=([^;]+)/);
    const raw = cookieMatch ? decodeURIComponent(cookieMatch[2]) : (localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user'));
    if (!raw) return null;
    const json = JSON.parse(raw);
    if (json && typeof json === 'object') return json;
  } catch {}
  return null;
}

// ========== Reconstructed missing helpers & components (after refactor merge) ==========
const parseNum = (v: any, fallback = 0): number => {
  if (v == null) return fallback;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : fallback;
};
const toISOWithTZ = (dateStr: string, timeStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
  return dt.toISOString();
};

// Các key tiện nghi cũ (giữ cho tương thích nếu cần)
type AmenityKey =
  | "wifi" | "parking" | "private_bath" | "shared_kitchen" | "aircon"
  | "water_heater" | "security" | "balcony" | "elevator"
  | "pet" | "ev" | "wardrobe" | "fridge" | "range_hood" | "kitchen_table" | "desk" | "mezzanine" | "shared_bath" | "flexible_hours" | "no_owner"
  | "bed" | "mattress" | "bedding" | "dressing_table" | "sofa" | "washing_machine_shared" | "washing_machine_private";

const getAmenityMeta = (key: AmenityKey): { label: string; icon: React.ReactNode } => {
  const meta: Record<AmenityKey, { label: string; icon: any }> = {
    wifi: { label: "Wi-Fi", icon: Wifi },
    parking: { label: "Chỗ để xe", icon: Car },
    private_bath: { label: "WC riêng", icon: ShowerHead },
    shared_kitchen: { label: "Bếp chung", icon: Home },
    aircon: { label: "Điều hoà", icon: Zap },
    water_heater: { label: "Nóng lạnh", icon: ShowerHead },
    security: { label: "An ninh", icon: ShieldCheck },
    balcony: { label: "Ban công", icon: Home },
  // new furniture
  bed: { label: "Giường", icon: BedDouble },
  mattress: { label: "Đệm", icon: Package },
  bedding: { label: "Ga gối", icon: Package },
  dressing_table: { label: "Bàn trang điểm", icon: Hammer },
  sofa: { label: "Sofa", icon: Sofa },
  washing_machine_shared: { label: "Máy giặt (chung)", icon: Package },
  washing_machine_private: { label: "Máy giặt (riêng)", icon: Package },
    elevator: { label: "Thang máy", icon: ArrowUpDown },
    pet: { label: "Cho nuôi pet", icon: PawPrint },
    ev: { label: "Xe điện", icon: BatteryCharging },
    wardrobe: { label: "Tủ quần áo", icon: Package },
    fridge: { label: "Tủ lạnh", icon: Package },
    range_hood: { label: "Hút mùi", icon: Wind },
    kitchen_table: { label: "Bàn bếp", icon: UtensilsCrossed },
    desk: { label: "Bàn làm việc", icon: Hammer },
    mezzanine: { label: "Gác xép", icon: ArrowUpDown },
    shared_bath: { label: "WC chung", icon: ShowerHead },
    flexible_hours: { label: "Giờ linh hoạt", icon: Clock },
    no_owner: { label: "Không chung chủ", icon: BadgeCheck },
  };
  const item = meta[key];
  const IconComponent = item.icon;
  return { label: item.label, icon: <IconComponent className="h-4 w-4" /> };
};

const Section = React.forwardRef<HTMLElement, { title: string; children: React.ReactNode; right?: React.ReactNode }>(
  ({ title, children, right }, ref) => (
    <section ref={ref} className="rounded-2xl border border-emerald-100/70 bg-white/80 shadow-[0_6px_20px_-12px_rgba(16,185,129,0.35)] backdrop-blur px-4 py-4 md:px-6 md:py-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-emerald-950">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  )
);
Section.displayName = "Section";

function Breadcrumb({ title, district }: { title: string; district?: string }) {
  return (
    <div className="mb-3 flex items-center gap-1 text-sm text-emerald-900/80">
      <Link href="/" className="hover:underline">Trang chủ</Link>
      <ChevronRight className="h-4 w-4" />
      <Link href="/tim-phong-quanh-day" className="hover:underline">Tìm phòng</Link>
      {district ? (
        <>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/khu-vuc/${district}`} className="hover:underline">{district}</Link>
        </>
      ) : null}
      <ChevronRight className="h-4 w-4" />
      <span className="truncate">{title}</span>
    </div>
  );
}

function FancyHeader({
  title, address, priceVnd, depositVnd, excerpt, updatedAt, noOwnerLiving, flexibleHours, isVerified,
}: {
  title: string; address: string; priceVnd: number; depositVnd?: number; excerpt?: string | null; updatedAt?: string | Date; noOwnerLiving?: boolean; flexibleHours?: boolean; isVerified?: boolean;
}) {
  const daysSinceUpdate = updatedAt ? Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)) : 999;
  const isNew = daysSinceUpdate <= 7;
  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-1">
      <div className="rounded-3xl bg-white/70 p-5 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Vào ở ngay</span>
              {isNew && <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> Tin mới</span>}
              {noOwnerLiving && <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-700 ring-1 ring-orange-200 inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> Không chung chủ</span>}
              {flexibleHours && <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200 inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Giờ giấc tự do</span>}
              {isVerified && (
                <span className="rounded-full bg-sky-50/80 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200 inline-flex items-center gap-1">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-white ring-1 ring-white/40">
                    <Check className="h-3 w-3" />
                  </span>
                  Nhà đã xác minh
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold leading-tight text-emerald-950 md:text-4xl">{title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-emerald-800/80">
              <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /><span className="line-clamp-1">{address}</span></div>
              {updatedAt && <span className="flex items-center gap-1 text-xs text-emerald-700/80"><Calendar className="h-3.5 w-3.5" /> Cập nhật {fDate(updatedAt, "DD/MM/YYYY")}</span>}
            </div>
            {excerpt && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-emerald-900/80">{excerpt}</p>}
          </div>
          <div className="shrink-0 rounded-2xl border border-emerald-200 bg-white px-6 py-5 shadow-sm">
            <div className="text-md font-semibold uppercase text-emerald-700">Giá thuê</div>
            <div className="text-2xl font-extrabold text-emerald-900">{formatMoneyVND(priceVnd)}/ tháng</div>
            {depositVnd && depositVnd !== priceVnd && (
              <div className="mt-2 pt-2 border-t border-emerald-100 text-xs text-emerald-700">Đặt cọc: <span className="font-semibold text-emerald-800">{formatMoneyVND(depositVnd)}</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KeyFacts({ areaM2, bedrooms, bathrooms }: { areaM2: number; bedrooms: number; bathrooms: number }) {
  const items = [
    { icon: <Ruler className="h-4 w-4" />, label: `${areaM2} m²` },
    { icon: <BedDouble className="h-4 w-4" />, label: `${bedrooms} PN` },
    { icon: <ShowerHead className="h-4 w-4" />, label: `${bathrooms} WC` },
    { icon: <Lock className="h-4 w-4" />, label: "Riêng tư" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2 text-emerald-950 shadow-[0_4px_14px_-10px_rgba(16,185,129,0.45)]">
          {it.icon}<span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function AmenityGrid({ amenities }: { amenities: AmenityKey[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {amenities.map((k) => {
        const meta = getAmenityMeta(k);
        return (
          <div key={k} className="group flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-emerald-900 transition hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-300">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-200 group-hover:bg-emerald-100">{meta.icon}</span>
            <span className="font-medium text-sm">{meta.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((x, i) => (
        <span key={i} className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm text-emerald-800 shadow-[0_4px_12px_-10px_rgba(16,185,129,0.6)]">
          <ShieldCheck className="h-3.5 w-3.5" /> {x}
        </span>
      ))}
    </div>
  );
}

function Gallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const big = images?.[active] ?? images?.[0];
  const bigSrc = asImageSrc(big || undefined);
  const isVideo = (u?: string | null) => {
    if (!u) return false;
    const s = String(u).toLowerCase();
    return s.includes('/static/videos/') || s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov') || s.includes('youtube.com') || s.includes('youtu.be') || s.includes('vimeo.com');
  };

  return (
    <>
      <div className="rounded-3xl border border-emerald-100 bg-white/80 p-2 backdrop-blur">
  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
          {bigSrc ? (
            isVideo(big) ? (
              <video src={bigSrc} controls className="h-full w-full object-contain bg-black" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bigSrc} alt="" className="h-full w-full object-cover transition-all duration-300 hover:scale-[1.01]" onClick={() => setOpen(true)} />
            )
          ) : (
            <div className="grid h-full w-full place-items-center text-sm text-emerald-800/70">Chưa có ảnh</div>
          )}
          {bigSrc && !isVideo(big) && (
            <button onClick={() => setOpen(true)} className="absolute bottom-3 right-3 rounded-xl bg-emerald-900/70 px-3 py-1.5 text-xs text-white backdrop-blur hover:bg-emerald-900">
              Xem lớn
            </button>
          )}
        </div>
        {images?.length > 1 && (
          <div className="mt-2 grid grid-cols-5 gap-2">
            {images.slice(0, 10).map((src, i) => {
              const s = asImageSrc(src);
              if (!s) return null;
              return (
                <button key={i} onClick={() => setActive(i)} className={clsx("relative aspect-[4/3] overflow-hidden rounded-xl border", i === active ? "border-emerald-600 ring-2 ring-emerald-600/50" : "border-emerald-100")}>
                  {isVideo(src) ? (
                    <div className="h-full w-full bg-black grid place-items-center text-[10px] text-white/80">Video</div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s} alt="" className="h-full w-full object-cover" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {open && bigSrc && !isVideo(big) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <button className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-emerald-900" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
          <div className="flex h-full items-center justify-center p-4">
            <div className="relative w-full max-w-5xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bigSrc} alt="" width={1600} height={900} className="h-auto w-full rounded-2xl object-contain" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MapBox({ lat, lng, address }: { lat?: number; lng?: number; address: string }) {
  const valid = Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0 && lat !== 1 && lng !== 1;
  const src = valid
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
  return (
    <div className="overflow-hidden rounded-b-3xl bg-white/80 shadow-[0_6px_20px_-12px_rgba(16,185,129,0.35)]">
      <div className="flex items-center gap-2 p-3 text-emerald-900">
        <MapPin className="h-5 w-5" />
        <span className="truncate">{address}</span>
        <button onClick={() => navigator.clipboard.writeText(address)} className="ml-auto inline-flex items-center gap-1 rounded-md border border-emerald-200 px-2 py-1 text-xs text-emerald-800 hover:bg-emerald-50">
          <Copy className="h-3.5 w-3.5" /> Sao chép
        </button>
      </div>
      <div className="h-[360px] w-full">
        <iframe title="Bản đồ" src={src} className="h-full w-full" loading="lazy" />
      </div>
    </div>
  );
}

function AvailabilityBar({ availableFrom }: { availableFrom?: string | number | Date }) {
  if (!availableFrom) return null;
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
  Dự kiến có thể vào ở từ <b>{fDate(availableFrom, "DD/MM/YYYY")}</b>
    </div>
  );
}

function PriceBreakdown({
  roomPrice, deposit, electricPrice, waterPrice, internetFee, serviceFee, serviceFeeNote,
}: {
  roomPrice?: number; deposit?: number; electricPrice?: number; waterPrice?: number; internetFee?: number; serviceFee?: number; serviceFeeNote?: string | null;
}) {
  const rows = [
    { k: "Tiền phòng/tháng", v: roomPrice, highlight: true },
    { k: "Tiền cọc", v: deposit },
    { k: "Điện", v: electricPrice ? `${formatMoneyVND(electricPrice)}/kWh` : undefined },
    { k: "Nước", v: waterPrice ? `${formatMoneyVND(waterPrice)}/m³` : undefined },
    { k: "Internet", v: internetFee ? formatMoneyVND(internetFee) + "/tháng" : undefined },
    { k: "Phí dịch vụ", v: serviceFee ? formatMoneyVND(serviceFee) + "/người/tháng" : undefined },
  ].filter((r) => r.v != null);

  if (!rows.length) return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800">
      <div className="flex items-start gap-3">
        <Lightbulb className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
        <div>
          <div className="font-medium">Thông tin chi phí chưa đầy đủ</div>
          <div className="mt-1 text-xs text-emerald-700">Vui lòng liên hệ chủ nhà để biết thêm chi tiết về các khoản chi phí khác như điện, nước, internet, phí dịch vụ...</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="divide-y divide-emerald-100 rounded-2xl border border-emerald-100 bg-white overflow-hidden">
        {rows.map((r, i) => (
          <div key={i} className={clsx(
            "flex items-center justify-between px-4 py-3",
            r.highlight && "bg-emerald-50/50"
          )}>
            <span className={clsx(
              "text-emerald-900/90",
              r.highlight && "font-semibold text-emerald-900"
            )}>{r.k}</span>
            <span className={clsx(
              "font-semibold",
              r.highlight ? "text-lg text-emerald-700" : "text-emerald-900"
            )}>
              {typeof r.v === "number" ? formatMoneyVND(r.v) : r.v}
            </span>
          </div>
        ))}
      </div>
      
      {/* Lưu ý khi thiếu thông tin */}
      {(serviceFeeNote) && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-xs text-emerald-800 flex items-start gap-2">
          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
          <div><span className="font-medium">Ghi chú phí dịch vụ:</span> {serviceFeeNote}</div>
        </div>
      )}
      {(!electricPrice || !waterPrice || !internetFee) && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium">Lưu ý:</span> Một số chi phí chưa được cập nhật. Vui lòng liên hệ chủ nhà để biết đầy đủ thông tin.
          </div>
        </div>
      )}
    </div>
  );
}

function HouseRules({ rules }: { rules?: string[] }) {
  if (!rules?.length) return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800">
      <div className="flex items-start gap-3">
        <FileText className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
        <div>
          <div className="font-medium">Nội quy chưa được cập nhật</div>
          <div className="mt-1 text-xs text-emerald-700">Vui lòng liên hệ chủ nhà để biết thêm chi tiết về quy định sinh hoạt, giờ giấc và các điều khoản khác.</div>
        </div>
      </div>
    </div>
  );
  return <Chips items={rules} />;
}

/* ===================== Booking Modal ===================== */
type ViewingVariant = "booking" | "deposit";

function BaseViewingModal({
  open, onClose, apartmentId, variant,
}: { open: boolean; onClose: () => void; apartmentId: number; variant: ViewingVariant; }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string[]; preferredAt?: string[]; name?: string[] } | null>(null);

  useEffect(() => {
    if (open) {
      setFieldErrors(null);
      // Prefill họ tên & SĐT từ tài khoản nếu chưa nhập
      const u = readAuthUser();
      if (u) {
        if (!name && u.name) setName(u.name);
        if (!phone && u.phone) setPhone(u.phone);
      }
    }
  }, [open]);

  const dateToInput = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const todayStr = dateToInput(new Date());
  const tomorrowStr = dateToInput(new Date(Date.now() + 24 * 60 * 60 * 1000));

  const canSubmit = date && time && name && phone;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    try {
      setSubmitting(true);
      setFieldErrors(null);
      const preferredAt = toISOWithTZ(date, time);
      const payloadNote = variant === "deposit"
        ? (note ? `[DEPOSIT] ${note}` : `[DEPOSIT] Yêu cầu đặt cọc`)
        : (note || undefined);
      await viewingService.create({ apartmentId, preferredAt, name, phone, note: payloadNote });
      toast.success(variant === "deposit" ? "Đã gửi yêu cầu đặt cọc (Trạng thái: Chờ đặt cọc)" : "Đã gửi yêu cầu đặt lịch xem phòng!");
      onClose();
    } catch (e: any) {
      if (e?.response?.status === 401) {
        toast.info(variant === "deposit" ? "Vui lòng đăng nhập để đặt cọc." : "Vui lòng đăng nhập để đặt lịch xem phòng.");
        onClose();
        return;
      }
      // Cố gắng bóc tách lỗi theo NestJS (Bad Request) { error, message: string|string[], statusCode }
      const resp = e?.response?.data;
      const messages: string[] = Array.isArray(resp?.message)
        ? resp.message
        : resp?.message
        ? [resp.message]
        : e?.message
        ? [e.message]
  : [variant === "deposit" ? "Không thể gửi yêu cầu đặt cọc" : "Không thể đặt lịch"];

      // Map lỗi theo trường để hiển thị inline
      const errs: { phone?: string[]; preferredAt?: string[]; name?: string[] } = {};
      for (const m of messages) {
        const s = String(m).toLowerCase();
        if (s.includes("phone")) errs.phone = [...(errs.phone || []), m];
        if (s.includes("preferredat") || s.includes("startat")) errs.preferredAt = [...(errs.preferredAt || []), m];
        if (s.includes("name")) errs.name = [...(errs.name || []), m];
      }
      if (Object.keys(errs).length) setFieldErrors(errs);
      // Show tất cả lỗi bằng toast
      messages.forEach((msg) => toast.error(msg));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm">
      <div className="flex h-full items-center justify-center p-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className={clsx("relative p-4 text-white",
            variant === "deposit" ? "bg-gradient-to-r from-cyan-600 to-cyan-500" : "bg-gradient-to-r from-emerald-600 to-emerald-500"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/30">
                  {variant === "deposit" ? <ShieldCheck className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
                </span>
                <div>
                  <h3 className="text-lg font-semibold leading-6">{variant === "deposit" ? "Đặt cọc ngay" : "Đặt lịch xem phòng"}</h3>
                  <p className="text-xs opacity-90">{variant === "deposit" ? "Gửi yêu cầu đặt cọc, chúng tôi sẽ liên hệ xác nhận." : "Chọn thời gian phù hợp, chúng tôi sẽ xác nhận ngay."}</p>
                </div>
              </div>
              <button onClick={() => { setFieldErrors(null); onClose(); }} className="rounded-full p-1 text-white/90 hover:bg-white/15">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-emerald-800">{variant === "deposit" ? "Ngày" : "Ngày xem"}</label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"><CalendarDays className="h-4 w-4" /></span>
                  <input type="date" min={todayStr} className={clsx("w-full rounded-lg border border-slate-300/80 px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-emerald-400", fieldErrors?.preferredAt && "border-rose-400") } value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <button type="button" onClick={() => setDate(todayStr)} className="rounded-full border border-emerald-200 px-3 py-1 text-emerald-800 hover:bg-emerald-50">Hôm nay</button>
                  <button type="button" onClick={() => setDate(tomorrowStr)} className="rounded-full border border-emerald-200 px-3 py-1 text-emerald-800 hover:bg-emerald-50">Ngày mai</button>
                </div>
                {fieldErrors?.preferredAt && (
                  <div className="mt-1 text-xs text-rose-600">{fieldErrors.preferredAt.join("; ")}</div>
                )}
              </div>
              <div>
                <label className="text-sm text-emerald-800">Giờ</label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"><Clock className="h-4 w-4" /></span>
                  <input type="time" className={clsx("w-full rounded-lg border border-slate-300/80 px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-emerald-400", fieldErrors?.preferredAt && "border-rose-400") } value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {['09:00','14:00','18:00'].map(t => (
                    <button key={t} type="button" onClick={() => setTime(t)} className="rounded-full border border-emerald-200 px-3 py-1 text-emerald-800 hover:bg-emerald-50">{t}</button>
                  ))}
                </div>
                {fieldErrors?.preferredAt && (
                  <div className="mt-1 text-xs text-rose-600">{fieldErrors.preferredAt.join("; ")}</div>
                )}
              </div>

              <div>
                <label className="text-sm text-emerald-800">Họ tên</label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"><User className="h-4 w-4" /></span>
                  <input className={clsx("w-full rounded-lg border border-slate-300/80 px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-emerald-400", fieldErrors?.name && "border-rose-400") } placeholder="Nguyễn Văn A" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                {fieldErrors?.name && (
                  <div className="mt-1 text-xs text-rose-600">{fieldErrors.name.join("; ")}</div>
                )}
              </div>
              <div>
                <label className="text-sm text-emerald-800">Số điện thoại</label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"><Phone className="h-4 w-4" /></span>
                  <input inputMode="tel" className={clsx("w-full rounded-lg border border-slate-300/80 px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-emerald-400", fieldErrors?.phone && "border-rose-400") } placeholder="09xx xxx xxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                {fieldErrors?.phone && (
                  <div className="mt-1 text-xs text-rose-600">{fieldErrors.phone.join("; ")}</div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-emerald-800">Ghi chú</label>
                <textarea className="mt-1 w-full rounded-lg border border-slate-300/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={variant === "deposit" ? "Ví dụ: Tôi muốn chuyển khoản đặt cọc ngay hôm nay." : "Ví dụ: Tôi muốn xem phòng trong 15 phút, tôi có thể đến sớm hơn một chút."} />
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-800 flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-emerald-600" />
              <div>
                {variant === "deposit"
                  ? "Yêu cầu đặt cọc sẽ được xác nhận qua số điện thoại bạn cung cấp."
                  : "Bạn có thể thay đổi hoặc huỷ lịch sau khi đặt. Chúng tôi sẽ liên hệ xác nhận qua số điện thoại bạn cung cấp."}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={onClose} className="rounded-xl border border-emerald-200 px-4 py-2 text-emerald-800 hover:bg-emerald-50">Huỷ</button>
              <button
                disabled={!canSubmit || submitting}
                onClick={handleSubmit}
                className={clsx(
                  "rounded-xl px-4 py-2 text-white",
                  !canSubmit || submitting
                    ? (variant === "deposit" ? "bg-cyan-400" : "bg-emerald-400")
                    : (variant === "deposit"
                        ? "bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600"
                        : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600")
                )}
              >
                {submitting ? "Đang gửi..." : (variant === "deposit" ? "Gửi yêu cầu đặt cọc" : "Đặt lịch")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingModal({ open, onClose, apartmentId }: { open: boolean; onClose: () => void; apartmentId: number; }) {
  return <BaseViewingModal open={open} onClose={onClose} apartmentId={apartmentId} variant="booking" />;
}

/* ===================== Deposit Modal ===================== */
function DepositModal({
  open, onClose, apartmentId,
}: { open: boolean; onClose: () => void; apartmentId: number; }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string[]; preferredAt?: string[]; name?: string[] } | null>(null);

  useEffect(() => {
    if (open) {
      setFieldErrors(null);
      // Prefill họ tên & SĐT từ tài khoản nếu sẵn có
      const u = readAuthUser();
      if (u) {
        if (!name && u.name) setName(u.name);
        if (!phone && u.phone) setPhone(u.phone);
      }
    }
  }, [open]);

  const dateToInput = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const todayStr = dateToInput(new Date());
  const tomorrowStr = dateToInput(new Date(Date.now() + 24 * 60 * 60 * 1000));

  const canSubmit = date && time && name && phone;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    try {
      setSubmitting(true);
      setFieldErrors(null);
      const preferredAt = toISOWithTZ(date, time);
      const extraNote = note ? `[DEPOSIT] ${note}` : `[DEPOSIT] Yêu cầu đặt cọc`;
      await viewingService.create({ apartmentId, preferredAt, name, phone, note: extraNote });
      toast.success("Đã gửi yêu cầu đặt cọc (Trạng thái: Chờ đặt cọc)");
      onClose();
    } catch (e: any) {
      if (e?.response?.status === 401) {
        toast.info("Vui lòng đăng nhập để đặt cọc.");
        onClose();
        return;
      }
      const resp = e?.response?.data;
      const messages: string[] = Array.isArray(resp?.message)
        ? resp.message
        : resp?.message
        ? [resp.message]
        : e?.message
        ? [e.message]
        : ["Không thể gửi yêu cầu đặt cọc"];
      const errs: { phone?: string[]; preferredAt?: string[]; name?: string[] } = {};
      for (const m of messages) {
        const s = String(m).toLowerCase();
        if (s.includes("phone")) errs.phone = [...(errs.phone || []), m];
        if (s.includes("preferredat") || s.includes("startat")) errs.preferredAt = [...(errs.preferredAt || []), m];
        if (s.includes("name")) errs.name = [...(errs.name || []), m];
      }
      if (Object.keys(errs).length) setFieldErrors(errs);
      messages.forEach((msg) => toast.error(msg));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm">
      <div className="flex h-full items-center justify-center p-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-emerald-700 to-emerald-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/30">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold leading-6">Đặt cọc ngay</h3>
                  <p className="text-xs opacity-90">Gửi yêu cầu đặt cọc, chúng tôi sẽ liên hệ xác nhận.</p>
                </div>
              </div>
              <button onClick={() => { setFieldErrors(null); onClose(); }} className="rounded-full p-1 text-white/90 hover:bg-white/15">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-emerald-800">Ngày</label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"><CalendarDays className="h-4 w-4" /></span>
                  <input type="date" min={todayStr} className={clsx("w-full rounded-lg border px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-emerald-400", fieldErrors?.preferredAt && "border-rose-400") } value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <button type="button" onClick={() => setDate(todayStr)} className="rounded-full border border-emerald-200 px-3 py-1 text-emerald-800 hover:bg-emerald-50">Hôm nay</button>
                  <button type="button" onClick={() => setDate(tomorrowStr)} className="rounded-full border border-emerald-200 px-3 py-1 text-emerald-800 hover:bg-emerald-50">Ngày mai</button>
                </div>
                {fieldErrors?.preferredAt && (
                  <div className="mt-1 text-xs text-rose-600">{fieldErrors.preferredAt.join("; ")}</div>
                )}
              </div>
              <div>
                <label className="text-sm text-emerald-800">Giờ</label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"><Clock className="h-4 w-4" /></span>
                  <input type="time" className={clsx("w-full rounded-lg border px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-emerald-400", fieldErrors?.preferredAt && "border-rose-400") } value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {["09:00","14:00","18:00"].map(t => (
                    <button key={t} type="button" onClick={() => setTime(t)} className="rounded-full border border-emerald-200 px-3 py-1 text-emerald-800 hover:bg-emerald-50">{t}</button>
                  ))}
                </div>
                {fieldErrors?.preferredAt && (
                  <div className="mt-1 text-xs text-rose-600">{fieldErrors.preferredAt.join("; ")}</div>
                )}
              </div>

              <div>
                <label className="text-sm text-emerald-800">Họ tên</label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"><User className="h-4 w-4" /></span>
                  <input className={clsx("w-full rounded-lg border px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-emerald-400", fieldErrors?.name && "border-rose-400") } placeholder="Nguyễn Văn A" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                {fieldErrors?.name && (
                  <div className="mt-1 text-xs text-rose-600">{fieldErrors.name.join("; ")}</div>
                )}
              </div>
              <div>
                <label className="text-sm text-emerald-800">Số điện thoại</label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"><Phone className="h-4 w-4" /></span>
                  <input inputMode="tel" className={clsx("w-full rounded-lg border px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-emerald-400", fieldErrors?.phone && "border-rose-400") } placeholder="09xx xxx xxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                {fieldErrors?.phone && (
                  <div className="mt-1 text-xs text-rose-600">{fieldErrors.phone.join("; ")}</div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-emerald-800">Ghi chú</label>
                <textarea className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: Tôi muốn chuyển khoản đặt cọc ngay hôm nay." />
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-800 flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-emerald-600" />
              <div>
                Yêu cầu đặt cọc sẽ được xác nhận qua số điện thoại bạn cung cấp.
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={onClose} className="rounded-xl border border-emerald-200 px-4 py-2 text-emerald-800 hover:bg-emerald-50">Huỷ</button>
              <button
                disabled={!canSubmit || submitting}
                onClick={handleSubmit}
                className={clsx(
                  "rounded-xl px-4 py-2 text-white",
                  !canSubmit || submitting ? "bg-emerald-400" : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                )}
              >
                {submitting ? "Đang gửi..." : "Gửi yêu cầu đặt cọc"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== PAGE ===================== */
export default function RoomPage({ slug }: { slug: string }) {
  const router = useRouter();
  const [data, setData] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [fav, setFav] = useState<boolean>(false);
  const [loadingFav, setLoadingFav] = useState(false);
  const [related, setRelated] = useState<Apartment[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  // Scroll spy state
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [showStickyBar, setShowStickyBar] = useState(false);
  // Khi click tab, tạm thời khoá scrollspy để không ghi đè trạng thái active
  const [scrollLockUntil, setScrollLockUntil] = useState<number>(0);
  const heroRef = React.useRef<HTMLDivElement | null>(null);
  const overviewRef = React.useRef<HTMLElement | null>(null);
  const featuresRef = React.useRef<HTMLElement | null>(null);
  const descriptionRef = React.useRef<HTMLElement | null>(null);
  const mapRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const apt = await apartmentService.getBySlug(slug);
        if (!mounted) return;
        setData(apt);
        setFav(!!(apt as any)?.favorited); // lấy cờ từ BE
        setErr(null);
        // Record view (ignore errors) and persist to local recent
        try {
          const id = (apt as any)?.id;
          const slugVal = (apt as any)?.slug;
          if (id) {
            // call backend if authed (cookie or localStorage/sessionStorage)
            const authed = hasLoginToken();
            if (authed) viewingService.recordVisit(id).catch(()=>{});
            // local storage fallback
            if (typeof window !== 'undefined') {
              const key = 'recent_rooms';
              const raw = window.localStorage.getItem(key);
              const arr = raw ? (JSON.parse(raw) as any[]) : [];
              const now = new Date().toISOString();
              const filtered = Array.isArray(arr) ? arr.filter(x => x && x.apartmentId !== id) : [];
              filtered.unshift({ apartmentId: id, slug: slugVal, title: (apt as any)?.title, coverImageUrl: (apt as any)?.coverImageUrl, viewedAt: now });
              const limited = filtered.slice(0, 50);
              window.localStorage.setItem(key, JSON.stringify(limited));
            }
          }
        } catch {}
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Không thể tải dữ liệu");
        setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  // Fetch related apartments when data loaded
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!data) return;
      try {
        setLoadingRelated(true);
        // Prefer same location/district if available
        const q: any = { limit: 6 };
        if ((data as any).locationId) q.locationId = (data as any).locationId;
        else if ((data as any).locationSlug) q.locationSlug = (data as any).locationSlug;

        const resp = await apartmentService.getAll(q);
        if (!mounted) return;
        // resp might be { items, total } or an array
        const items: Apartment[] = Array.isArray(resp) ? resp : resp?.items || [];
        // Exclude current apartment and limit to 4
        const filtered = items.filter((a) => a.id !== data.id).slice(0, 4);
        setRelated(filtered);
      } catch (err) {
        // ignore silently
      } finally {
        if (mounted) setLoadingRelated(false);
      }
    })();
    return () => { mounted = false; };
  }, [data]);

  const images = useMemo(() => {
    if (!data) return [] as string[];
    const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
    const norm = (s?: string | null) => {
      if (!s) return "";
      if (s.startsWith("http") && base && s.startsWith(base)) return s.slice(base.length);
      return s;
    };
    const isVideo = (u?: string | null) => {
      if (!u) return false;
      const s = String(u).toLowerCase();
      return s.includes('/static/videos/') || s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov') || s.includes('youtube.com') || s.includes('youtu.be') || s.includes('vimeo.com');
    };
    const srcImages = Array.isArray((data as any).images) ? ((data as any).images as string[]) : [];
    const cover = data.coverImageUrl || null;

    // Find first video in images
    const firstVideo = srcImages.find(isVideo) || null;
    const rest = srcImages.filter((s) => s !== firstVideo);

    const out: string[] = [];
    const pushUnique = (val?: string | null) => {
      if (!val) return;
      const n = norm(val);
      const exists = out.some((x) => norm(x) === n);
      if (!exists) out.push(val);
    };

    if (firstVideo) {
      // Order: video first, then cover, then the rest
      pushUnique(firstVideo);
      pushUnique(cover);
      for (const s of rest) pushUnique(s);
    } else {
      // No video: put cover first, then images
      pushUnique(cover);
      for (const s of srcImages) pushUnique(s);
    }

    return out;
  }, [data]);

  // Avatar/thumbnail for sticky bar
  const avatarSrc = useMemo(() => {
    const src = (data as any)?.coverImageUrl || images?.[0] || null;
  return asImageSrc(src || undefined) || undefined;
  }, [data, images]);

  // Gom nhóm tiện nghi theo yêu cầu: "Nội thất" & "Tiện ích"
  const furnitureAmenities: AmenityKey[] = useMemo(() => {
    if (!data) return [];
    const f: AmenityKey[] = [];
    if ((data as any).hasAirConditioner) f.push("aircon");
    if ((data as any).hasWaterHeater) f.push("water_heater");
    if ((data as any).hasKitchenCabinet) f.push("shared_kitchen");
    if ((data as any).hasWardrobe) f.push("wardrobe");
    if ((data as any).hasFridge) f.push("fridge");
    if ((data as any).hasRangeHood) f.push("range_hood");
    if ((data as any).hasKitchenTable) f.push("kitchen_table");
    if ((data as any).hasDesk) f.push("desk");
    // new furniture flags
    if ((data as any).hasBed) f.push("bed");
    if ((data as any).hasMattress) f.push("mattress");
    if ((data as any).hasBedding) f.push("bedding");
    if ((data as any).hasDressingTable) f.push("dressing_table");
    if ((data as any).hasSofa) f.push("sofa");
    // washing machine variants (furniture section per latest requirement)
    if ((data as any).hasWashingMachineShared) f.push("washing_machine_shared");
    if ((data as any).hasWashingMachinePrivate) f.push("washing_machine_private");
    return Array.from(new Set(f));
  }, [data]);

  const serviceAmenities: AmenityKey[] = useMemo(() => {
    if (!data) return [];
    const a: AmenityKey[] = [];
    if ((data as any).hasPrivateBathroom) a.push("private_bath");
    if ((data as any).hasSharedBathroom) a.push("shared_bath");
    if ((data as any).hasMezzanine) a.push("mezzanine");
    if ((data as any).noOwnerLiving) a.push("no_owner");
    if ((data as any).flexibleHours) a.push("flexible_hours");
    if ((data as any).hasElevator) a.push("elevator");
    if ((data as any).allowPet) a.push("pet");
    if ((data as any).allowElectricVehicle) a.push("ev");
    // mặc định wifi & parking luôn có (có thể bỏ nếu muốn chính xác tuyệt đối)
    a.push("wifi", "parking");
    return Array.from(new Set(a));
  }, [data]);

  // ===== Sticky tab bar logic (must be before any conditional returns) =====
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      // Determine when to show bar (after hero bottom)
      const heroBottom = heroRef.current ? (heroRef.current.getBoundingClientRect().bottom + window.scrollY) : 0;
      setShowStickyBar(scrollY > heroBottom - 80); // small threshold

      // Build an ordered list of sections to evaluate
      const candidates: { id: string; el: HTMLElement | null }[] = [
        { id: "overview", el: overviewRef.current },
        { id: "features", el: featuresRef.current },
        { id: "description", el: descriptionRef.current },
        { id: "map", el: mapRef.current },
      ].filter(c => c.el);

      // New algorithm: choose the last section whose top is above (scrollY + offset)
      const stickyOffset = 90; // approximate height of fixed bar + margin
      const thresholdY = scrollY + stickyOffset + 10; // small buffer

      let current = candidates[0]?.id || "overview";
      for (const c of candidates) {
        const topAbs = c.el!.getBoundingClientRect().top + window.scrollY;
        if (topAbs <= thresholdY) {
          current = c.id; // advance as long as section top is above threshold
        } else {
          break; // sections are ordered; stop once top is below threshold
        }
      }
      // Nếu đang trong giai đoạn khoá (sau khi click tab) thì bỏ qua cập nhật tự động
      if (Date.now() < scrollLockUntil) return;
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [data]);

  const scrollTo = (id: string) => {
    const targetMap: Record<string, HTMLElement | null> = {
      overview: overviewRef.current,
      features: featuresRef.current,
      description: descriptionRef.current,
      map: mapRef.current,
    };
    const el = targetMap[id];
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 72; // offset for sticky bar height
    // Khoá scrollspy ~600ms (thời gian smooth scroll) để highlight giữ nguyên
    setScrollLockUntil(Date.now() + 600);
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "features", label: "Tiện nghi" },
    { id: "description", label: "Mô tả", disabled: !data?.description },
    { id: "map", label: "Bản đồ" },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl px-3 py-8 lg:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-64 rounded bg-emerald-100/70" />
          <div className="h-24 rounded-2xl bg-emerald-50" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="aspect-[16/10] w-full rounded-2xl bg-emerald-50" />
              <div className="h-24 rounded-2xl bg-emerald-50" />
              <div className="h-40 rounded-2xl bg-emerald-50" />
            </div>
            <div className="h-72 rounded-2xl bg-emerald-50" />
          </div>
        </div>
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="mx-auto max-w-screen-2xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-emerald-900">Có lỗi xảy ra</p>
        <p className="mt-1 text-emerald-800/80">{err}</p>
        <Link href="/tim-phong-quanh-day" className="mt-4 inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
          Quay lại trang tìm phòng
        </Link>
      </div>
    );
  }

  // ======= Derivatives =======
  const priceVnd = parseNum((data as any).rentPrice);
  const areaM2 = parseNum((data as any).areaM2);
  const bedrooms = parseNum((data as any).bedrooms);
  const bathrooms = parseNum((data as any).bathrooms);
  const depositVnd = parseNum((data as any).deposit) || priceVnd || undefined;
  const addressLine = data.streetAddress || (data as any).addressPath || "Hà Nội";
  const lat = parseNum((data as any).lat, undefined as any);
  const lng = parseNum((data as any).lng, undefined as any);
  const electricPrice = parseNum((data as any).electricityPricePerKwh, 0) || undefined;
  const waterPrice = parseNum((data as any).waterPricePerM3, 0) || undefined;
  const internetFee = parseNum((data as any).internetPricePerRoom, 0) || undefined;
  const serviceFee = parseNum((data as any).commonServiceFeePerPerson, 0) || undefined;
  const serviceFeeNote = ((data as any)?.serviceFeeNote as string) || undefined;
  const availableFrom = (data as any)?.availableFrom as any;
  const rules = ((data as any)?.houseRules as string[]) || [];
  const guests = parseNum((data as any)?.guests, 0) || undefined;
  const landlordPhone = "0968.345.486"; // fixed hotline override per request
  const landlordName = (data as any)?.contactName || (data as any)?.landlordName || "Chủ nhà";
  const updatedAt = (data as any)?.updatedAt as any;
  const noOwnerLiving = (data as any)?.noOwnerLiving || false;
  const flexibleHours = (data as any)?.flexibleHours || false;

  const normalizePhone = (p: string) => p.replace(/\D/g, "");
  const phoneRaw = normalizePhone(landlordPhone);
  const zaloUrl = `https://zalo.me/2661388511949942518`;

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.06),transparent_40%)]" />
        <div className="mx-auto max-w-screen-2xl px-3 py-6 lg:px-6">
          <Breadcrumb title={data.title} />
          <div ref={heroRef}>
            <FancyHeader
              title={data.title}
              address={addressLine}
              priceVnd={priceVnd}
              depositVnd={depositVnd}
              excerpt={(data as any).excerpt}
              updatedAt={updatedAt}
              noOwnerLiving={noOwnerLiving}
              flexibleHours={flexibleHours}
              isVerified={(data as any).isVerified}
            />
          </div>

          {/* Fixed top tabs + info bar (full-width, covers header) */}
          <div className={clsx(
            "fixed inset-x-0 top-0 z-[120] border-b border-emerald-100 bg-white shadow-sm transition-all",
            showStickyBar ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <div className="mx-auto max-w-screen-2xl px-3 lg:px-6">
              <div className="px-3 py-2 md:px-5 md:py-3">
                  {/* Info row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-emerald-50 ring-1 ring-emerald-200">
                        {avatarSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[10px] text-emerald-700">Ảnh</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xl font-semibold text-emerald-900">{data.title}</div>
                        <div className="mt-0.5 flex items-center gap-1 truncate text-xs text-emerald-700">
                          <div className="leading-none text-xl font-extrabold text-emerald-900 py-2">{formatMoneyVND(priceVnd)}/ Tháng</div>
                          <MapPin className="h-3.5 w-3.5 ml-5" />
                          <span className="truncate text-lg">{addressLine}</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                      <div className="text-right">
                        <div className="mt-2 flex items-center justify-end gap-2">
                          {phoneRaw && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(phoneRaw).then(() => {
                                  toast.success(`Đã sao chép số: ${phoneRaw}`);
                                }).catch(() => {
                                  try {
                                    const ta = document.createElement('textarea');
                                    ta.value = phoneRaw; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                                    toast.success(`Đã sao chép số: ${phoneRaw}`);
                                  } catch {
                                    toast.info(`Số điện thoại: ${phoneRaw}`);
                                  }
                                });
                              }}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                            >
                              <Phone className="h-4 w-4" /> Gọi ngay
                            </button>
                          )}
                          {/* Internal chat button (replaces external Zalo link) */}
                          <button
                            type="button"
                            onClick={() => {
                              const ownerId = (data as any)?.createdById;
                              if (!ownerId) {
                                toast.error('Không tìm thấy chủ nhà để chat');
                                return;
                              }
                              router.push(`/chat?apartmentId=${(data as any)?.id}&ownerId=${ownerId}`);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-100"
                          >
                            <MessageCircle className="h-4 w-4" /> Chat
                          </button>
                          
                          {/* Internal chat with owner */}
                          <button
                            type="button"
                            onClick={() => {
                              const ownerId = (data as any)?.createdById;
                              if (!ownerId) {
                                toast.error('Không tìm thấy chủ nhà để chat');
                                return;
                              }
                              // Navigate immediately to chat page with params; chat page will create/open conversation
                              router.push(`/chat?apartmentId=${(data as any)?.id}&ownerId=${ownerId}`);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                          >
                            <MessageCircle className="h-4 w-4" /> Chat với chủ nhà
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Tabs row */}
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <nav className="flex flex-1 flex-wrap items-center gap-2 md:gap-3" role="tablist" aria-label="Room detail sections">
                      {tabs.map(t => (
                        <button
                          key={t.id}
                          role="tab"
                          aria-selected={activeSection === t.id}
                          disabled={t.disabled}
                          onClick={() => { setActiveSection(t.id); scrollTo(t.id); }}
                          className={clsx(
                            "rounded-full px-3 py-1 text-[0.90rem] font-semibold transition border",
                            t.disabled && "cursor-not-allowed border-emerald-100 bg-transparent opacity-40",
                            activeSection === t.id && !t.disabled ? "border-emerald-600 bg-emerald-600 text-white shadow" : "border-emerald-100 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </nav>
                    {/* Price + call on small screens */}
                    <div className="flex items-center gap-3 sm:hidden">
                      <div className="text-right">
                        <div className="text-[10px] font-semibold uppercase text-emerald-600">Giá thuê</div>
                        <div className="leading-none text-xl font-extrabold text-emerald-900">{formatMoneyVND(priceVnd)}</div>
                        <div className="mt-1 flex items-center justify-end gap-2">
                          {phoneRaw && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(phoneRaw).then(() => {
                                  toast.success(`Đã sao chép số: ${phoneRaw}`);
                                }).catch(() => {
                                  try {
                                    const ta = document.createElement('textarea');
                                    ta.value = phoneRaw; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                                    toast.success(`Đã sao chép số: ${phoneRaw}`);
                                  } catch {
                                    toast.info(`Số điện thoại: ${phoneRaw}`);
                                  }
                                });
                              }}
                              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                              aria-label="Sao chép số chủ nhà"
                            >
                              <Phone className="h-4 w-4" /> Gọi ngay
                            </button>
                          )}
                          {/* Internal chat button (replaces external Zalo link) */}
                          <button
                            type="button"
                            onClick={() => {
                              const ownerId = (data as any)?.createdById;
                              if (!ownerId) {
                                toast.error('Không tìm thấy chủ nhà để chat');
                                return;
                              }
                              router.push(`/chat?apartmentId=${(data as any)?.id}&ownerId=${ownerId}`);
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-100"
                          >
                            <MessageCircle className="h-4 w-4" /> Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/* Spacer to prevent layout jump when fixed bar appears */}
          {showStickyBar && <div aria-hidden className="mb-4 h-[96px] md:h-[108px]" />}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left */}
            <div className="space-y-5 lg:col-span-2">
              <Gallery images={images} />
              <AvailabilityBar availableFrom={availableFrom} />

              <Section ref={overviewRef as any} title="Tổng quan">
                <KeyFacts areaM2={areaM2} bedrooms={bedrooms} bathrooms={bathrooms} />
                {/* Thông tin chi tiết */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/30 p-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-emerald-700">Địa chỉ</div>
                      <div className="mt-0.5 text-sm text-emerald-900">{addressLine}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {typeof guests === 'number' && guests > 0 && (
                      <div className="rounded-lg border border-emerald-100 bg-white px-3 py-2">
                        <div className="text-xs text-emerald-700">Số người ở tối đa</div>
                        <div className="mt-0.5 font-semibold text-emerald-900">{guests} người</div>
                      </div>
                    )}
                    <div className="rounded-lg border border-emerald-100 bg-white px-3 py-2">
                      <div className="text-xs text-emerald-700">Trạng thái</div>
                      <div className="mt-0.5 font-semibold text-emerald-900">
                        {(data as any).status === 'published' ? 'Đang cho thuê' : 'Không khả dụng'}
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              <Section ref={featuresRef as any} title="Tiện nghi">
                <div className="space-y-6">
                  {/* Nội thất */}
                  <div>
                    <div className="flex items-center mb-2 gap-2">
                      <Sofa className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700 tracking-wide">NỘI THẤT</span>
                    </div>
                    {furnitureAmenities.length ? (
                      <AmenityGrid amenities={furnitureAmenities} />
                    ) : (
                      <div className="rounded-lg border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white px-3 py-3 text-xs text-emerald-700 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-emerald-500" /> Chưa có nội thất được đánh dấu.
                      </div>
                    )}
                    {(data as any)?.furnitureNote && (
                      <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2 text-xs text-emerald-800 flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                        <div><span className="font-medium">Ghi chú nội thất:</span> {(data as any).furnitureNote}</div>
                      </div>
                    )}
                  </div>

                  {/* Tiện ích */}
                  <div>
                    <div className="flex items-center mb-2 gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700 tracking-wide">TIỆN ÍCH</span>
                    </div>
                    {serviceAmenities.length ? (
                      <AmenityGrid amenities={serviceAmenities} />
                    ) : (
                      <div className="rounded-lg border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white px-3 py-3 text-xs text-emerald-700 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-emerald-500" /> Chưa có tiện ích được đánh dấu.
                      </div>
                    )}
                    {(data as any)?.amenitiesNote && (
                      <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2 text-xs text-emerald-800 flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                        <div><span className="font-medium">Ghi chú tiện nghi:</span> {(data as any).amenitiesNote}</div>
                      </div>
                    )}
                  </div>
                </div>
              </Section>

              <Section title="Chi phí chi tiết">
                <PriceBreakdown
                  roomPrice={priceVnd}
                  deposit={depositVnd}
                  electricPrice={electricPrice}
                  waterPrice={waterPrice}
                  internetFee={internetFee}
                  serviceFee={serviceFee}
                  serviceFeeNote={serviceFeeNote}
                />
              </Section>

              {/* <Section title="Quy định nhà">
                <HouseRules rules={rules} />
              </Section> */}

              {data.description ? (
                <Section ref={descriptionRef as any} title="Mô tả chi tiết">
                  <div
                    className="prose prose-emerald max-w-none prose-p:leading-relaxed prose-ul:list-disc prose-li:marker:text-emerald-600"
                    dangerouslySetInnerHTML={{ __html: data.description as string }}
                  />
                </Section>
              ) : null}
              <Section ref={mapRef as any} title="Bản đồ">
                <MapBox lat={lat} lng={lng} address={addressLine} />
              </Section>
              {/* Comments were moved to the right column below booking CTA */}
            </div>

            {/* Right */}
            <div className="space-y-5 lg:col-span-1">
              <div className="sticky top-35">
                <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-[0_10px_30px_-16px_rgba(16,185,129,0.6)] backdrop-blur">
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      onClick={async () => {
                        if (loadingFav || !data) return;
                        if (!hasLoginToken()) {
                          toast.info("Vui lòng đăng nhập để sử dụng tính năng yêu thích.");
                          router.push("/dang-nhap");
                          return;
                        }
                        try {
                          setLoadingFav(true);
                          const next = !fav;
                          setFav(next);
                          if (next) {
                            await favoriteService.addFavorite({ apartmentId: data.id });
                            toast.success("Đã thêm vào yêu thích ❤️");
                          } else {
                            await favoriteService.removeFavorite(data.id);
                            toast.info("Đã bỏ khỏi yêu thích 💔");
                          }
                          // Sync các component khác
                          if (typeof window !== "undefined") {
                            window.dispatchEvent(new CustomEvent("fav:changed"));
                          }
                        } catch (e: any) {
                          setFav((v) => !v);
                          toast.error(e?.message || "Không thể cập nhật yêu thích");
                        } finally {
                          setLoadingFav(false);
                        }
                      }}
                      disabled={loadingFav}
                      className={clsx(
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-emerald-800 hover:bg-emerald-50",
                        fav ? "border-rose-300 text-rose-700 bg-rose-50/40" : "border-emerald-200",
                        loadingFav && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <Heart className={clsx("h-5 w-5", fav && "fill-rose-500 text-rose-500")} /> {fav ? "Đã lưu" : "Lưu tin"}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "");
                        toast.success("Đã sao chép liên kết!");
                      }}
                      className="flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-emerald-800 hover:bg-emerald-50"
                    >
                      <Share2 className="h-5 w-5" /> Chia sẻ
                    </button>
                  </div>
                  {/* <button
                    type="button"
                    onClick={() => {
                      const raw = landlordPhone.replace(/\D/g, '');
                      navigator.clipboard.writeText(raw).then(() => {
                        toast.success(`Đã sao chép số: ${raw}`);
                      }).catch(() => {
                        try {
                          const ta = document.createElement('textarea');
                          ta.value = raw; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                          toast.success(`Đã sao chép số: ${raw}`);
                        } catch {
                          toast.info(`Số điện thoại: ${raw}`);
                        }
                      });
                    }}
                    className="group mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow hover:bg-emerald-700"
                    aria-label="Sao chép số chủ nhà"
                  >
                    <Phone className="h-5 w-5" /> Gọi ngay
                  </button> */}
                  <button
                    onClick={() => {
                      if (!hasLoginToken()) {
                        toast.info("Vui lòng đăng nhập để đặt lịch xem phòng.");
                        return;
                      }
                      setBookingOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 px-4 py-3 text-emerald-800 hover:bg-emerald-50"
                  >
                    <CalendarDays className="h-5 w-5" /> Đặt lịch xem phòng
                  </button>

                  <button
                    onClick={() => {
                      if (!hasLoginToken()) {
                        toast.info("Vui lòng đăng nhập để đặt cọc.");
                        return;
                      }
                      setDepositOpen(true);
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3 text-white shadow hover:from-emerald-800 hover:to-emerald-700"
                  >
                    <ShieldCheck className="h-5 w-5" /> Đặt cọc ngay
                  </button>

                  {/* Thẻ thông tin nhanh */}
                  <div className="mt-3 rounded-xl border border-emerald-100 bg-white p-3 text-sm text-emerald-900/90">
                    <div className="flex items-center justify-between">
                      <span>Đăng lúc</span>
                      <b>{fDate((data as any).createdAt, "DD/MM/YYYY")}</b>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cập nhật</span>
                      <b>{fDate((data as any).updatedAt, "DD/MM/YYYY")}</b>
                    </div>
                  </div>
                  {/* Thông tin chủ nhà (hiển thị tên, có nút hiện số) */}
                  <div className="mt-3 rounded-xl border border-emerald-100 bg-white p-3 text-sm text-emerald-900/90">
                    <div className="mb-2 text-sm font-semibold text-emerald-900">Thông tin chủ nhà</div>
                    <div className="space-y-2">
                      <div className="truncate">Tên: <b className="text-emerald-800">{landlordName}</b></div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                          onClick={() => {
                            setShowPhone(true);
                            if (phoneRaw) {
                              navigator.clipboard.writeText(phoneRaw).then(() => {
                                toast.success(`Đã sao chép số: ${phoneRaw}`);
                              }).catch(() => {
                                try {
                                  const ta = document.createElement('textarea');
                                  ta.value = phoneRaw; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                                  toast.success(`Đã sao chép số: ${phoneRaw}`);
                                } catch {
                                  toast.info(`Số điện thoại: ${phoneRaw}`);
                                }
                              });
                            }
                          }}
                        >
                          <Phone className="h-4 w-4" /> {showPhone ? phoneRaw : 'Hiện số chủ nhà'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const ownerId = (data as any)?.createdById;
                            if (!ownerId) {
                              toast.error('Không tìm thấy chủ nhà để chat');
                              return;
                            }
                            router.push(`/chat?apartmentId=${(data as any)?.id}&ownerId=${ownerId}`);
                          }}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-800 hover:bg-sky-100"
                        >
                          <MessageCircle className="h-4 w-4" /> Chat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Comments moved here — placed under booking CTA for better UX */}
                <div className="mt-4">
                  <Section title="Bình luận">
                    <div className="space-y-4">
                      <CommentForm targetType="apartment" targetId={data.id} />
                      <CommentList targetType="apartment" targetId={data.id} />
                    </div>
                  </Section>
                </div>

                  {/* Related apartments */}
                  <div className="mt-4">
                    <Section title="Phòng liên quan">
                      {loadingRelated ? (
                        <div className="text-sm text-emerald-700">Đang tải...</div>
                      ) : (
                        <div className="space-y-3">
                          {related.length === 0 ? (
                            <div className="text-sm text-emerald-800/80">Không có gợi ý nào.</div>
                          ) : (
                            related.map((r) => (
                              <Link key={r.id} href={`/room/${r.slug}`} className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-white p-3 hover:shadow-md">
                                <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-emerald-50">
                                  {r.coverImageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={asImageSrc(r.coverImageUrl as string) as string} alt={r.title} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm text-emerald-700">Ảnh</div>
                                  )}
                                </div>
                                <div className="flex-1 text-sm">
                                  <div className="font-semibold text-emerald-900 text-base line-clamp-2">{r.title}</div>
                                  <div className="mt-1 text-sm text-emerald-700 font-medium">{formatMoneyVND(parseNum((r as any).rentPrice))}</div>
                                  {/* optional small meta row */}
                                  {(r as any).areaM2 && (
                                    <div className="mt-1 text-xs text-emerald-600">{parseNum((r as any).areaM2)} m²</div>
                                  )}
                                </div>
                              </Link>
                            ))
                          )}
                        </div>
                      )}
                    </Section>
                  </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal booking */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        apartmentId={data.id}
      />
      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        apartmentId={data.id}
      />
    </>
  );
}
