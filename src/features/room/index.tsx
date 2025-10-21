// app/rooms/[slug]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight, Heart, Share2, MapPin, Home, ShowerHead, BedDouble, Ruler, Lock,
  Zap, Wifi, Car, ShieldCheck, Phone, CalendarDays, Copy, X, Sparkles, User,
  Clock, CheckCircle2, Calendar, Lightbulb, FileText, AlertCircle,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "react-toastify";
import { apartmentService } from "@/services/apartmentService";
import { viewingService } from "@/services/viewingService";
import { Apartment } from "@/type/apartment";
import { formatMoneyVND } from "@/utils/format-number";

/* ===================== Helpers ===================== */
const withBase = (u?: string | null) => {
  if (!u) return null;
  if (u.startsWith("http") || u.startsWith("data:")) return u;
  return `${process.env.NEXT_PUBLIC_API_URL || ""}${u}`;
};
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
    window.sessionStorage.getItem("access_token")
  );
};
const parseNum = (v: any, fallback = 0): number => {
  if (v == null) return fallback;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : fallback;
};
const formatDateVN = (d?: string | number | Date) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "";
  }
};
const toISOWithTZ = (dateStr: string, timeStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
  return dt.toISOString();
};

/* ===================== Amenity & small components ===================== */
type AmenityKey =
  | "wifi" | "parking" | "private_bath" | "shared_kitchen" | "aircon"
  | "water_heater" | "security" | "balcony" | "washing" | "elevator";

const getAmenityMeta = (key: AmenityKey): { label: string; icon: React.ReactNode } => {
  const meta = {
    wifi: { label: "Wi-Fi", icon: Wifi },
    parking: { label: "Chỗ để xe", icon: Car },
    private_bath: { label: "WC riêng", icon: ShowerHead },
    shared_kitchen: { label: "Bếp chung", icon: Home },
    aircon: { label: "Điều hoà", icon: Zap },
    water_heater: { label: "Nóng lạnh", icon: ShowerHead },
    security: { label: "An ninh", icon: ShieldCheck },
    balcony: { label: "Ban công", icon: Home },
    washing: { label: "Máy giặt", icon: Home },
    elevator: { label: "Thang máy", icon: Home },
  };
  const item = meta[key];
  const IconComponent = item.icon;
  return {
    label: item.label,
    icon: <IconComponent className="h-4 w-4" />,
  };
};

const Section = ({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) => (
  <section className="rounded-2xl border border-emerald-100/70 bg-white/80 shadow-[0_6px_20px_-12px_rgba(16,185,129,0.35)] backdrop-blur px-4 py-4 md:px-6 md:py-5">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-emerald-950">{title}</h2>
      {right}
    </div>
    {children}
  </section>
);

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
  title, address, priceVnd, depositVnd, rating, reviewsCount, excerpt, updatedAt, noOwnerLiving, flexibleHours,
}: {
  title: string; address: string; priceVnd: number; depositVnd?: number; rating?: number; reviewsCount?: number;
  excerpt?: string | null; updatedAt?: string | Date; noOwnerLiving?: boolean; flexibleHours?: boolean;
}) {
  // Tính số ngày kể từ khi cập nhật
  const daysSinceUpdate = updatedAt ? Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)) : 999;
  const isNew = daysSinceUpdate <= 7;
  
  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-1">
      <div className="rounded-3xl bg-white/70 p-5 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex flex-wrap items-center gap-2">
              {isNew && (
                <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 inline-flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Tin mới
                </span>
              )}
              {noOwnerLiving && (
                <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-700 ring-1 ring-orange-200 inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> Không chung chủ
                </span>
              )}
              {flexibleHours && (
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200 inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Giờ giấc tự do
                </span>
              )}
              <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Vào ở ngay
              </span>
            </div>
            <h1 className="text-2xl font-bold leading-snug text-emerald-950 md:text-3xl">{title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-emerald-800/80">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{address}</span>
              </div>
              {updatedAt && (
                <span className="flex items-center gap-1 text-xs text-emerald-700/80">
                  <Calendar className="h-3.5 w-3.5" /> Cập nhật {formatDateVN(updatedAt)}
                </span>
              )}
            </div>
            {excerpt ? (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-emerald-900/80">
                {excerpt}
              </p>
            ) : null}
          </div>
          <div className="shrink-0 rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-right shadow-sm">
            <div className="text-xs font-medium text-emerald-700 uppercase">Giá thuê</div>
            <div className="text-3xl font-extrabold text-emerald-900">{formatMoneyVND(priceVnd)}</div>
            <div className="text-xs text-emerald-600">/ tháng</div>
            {depositVnd && depositVnd !== priceVnd ? (
              <div className="mt-2 pt-2 border-t border-emerald-100">
                <div className="text-xs text-emerald-700/80">Đặt cọc: <span className="font-semibold text-emerald-800">{formatMoneyVND(depositVnd)}</span></div>
              </div>
            ) : null}
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
  const bigSrc = withBase(big || undefined);

  return (
    <>
      <div className="rounded-3xl border border-emerald-100 bg-white/80 p-2 backdrop-blur">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
          {bigSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bigSrc} alt="" className="h-full w-full object-cover transition-all duration-300 hover:scale-[1.01]" onClick={() => setOpen(true)} />
          ) : (
            <div className="grid h-full w-full place-items-center text-sm text-emerald-800/70">Chưa có ảnh</div>
          )}
          {bigSrc && (
            <button onClick={() => setOpen(true)} className="absolute bottom-3 right-3 rounded-xl bg-emerald-900/70 px-3 py-1.5 text-xs text-white backdrop-blur hover:bg-emerald-900">
              Xem lớn
            </button>
          )}
        </div>
        {images?.length > 1 && (
          <div className="mt-2 grid grid-cols-5 gap-2">
            {images.slice(0, 10).map((src, i) => {
              const s = withBase(src);
              if (!s) return null;
              return (
                <button key={i} onClick={() => setActive(i)} className={clsx("relative aspect-[4/3] overflow-hidden rounded-xl border", i === active ? "border-emerald-600 ring-2 ring-emerald-600/50" : "border-emerald-100")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s} alt="" className="h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {open && bigSrc && (
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
    <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white/80 shadow-[0_6px_20px_-12px_rgba(16,185,129,0.35)]">
      <div className="flex items-center gap-2 p-3 text-emerald-900">
        <MapPin className="h-5 w-5" />
        <span className="truncate">{address}</span>
        <button onClick={() => navigator.clipboard.writeText(address)} className="ml-auto inline-flex items-center gap-1 rounded-md border border-emerald-200 px-2 py-1 text-xs text-emerald-800 hover:bg-emerald-50">
          <Copy className="h-3.5 w-3.5" /> Copy
        </button>
      </div>
      <div className="h-[360px] w-full">
        <iframe title="map" src={src} className="h-full w-full" loading="lazy" />
      </div>
    </div>
  );
}

function AvailabilityBar({ availableFrom }: { availableFrom?: string | number | Date }) {
  if (!availableFrom) return null;
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
      Dự kiến có thể vào ở từ <b>{formatDateVN(availableFrom)}</b>
    </div>
  );
}

function PriceBreakdown({
  roomPrice, deposit, electricPrice, waterPrice, internetFee, serviceFee,
}: {
  roomPrice?: number; deposit?: number; electricPrice?: number; waterPrice?: number; internetFee?: number; serviceFee?: number;
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
function BookingModal({
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
      await viewingService.create({ apartmentId, preferredAt, name, phone, note: note || undefined });
      toast.success("Đã gửi yêu cầu đặt lịch xem phòng!");
      onClose();
    } catch (e: any) {
      if (e?.response?.status === 401) {
        toast.info("Vui lòng đăng nhập để đặt lịch xem phòng.");
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
        : ["Không thể đặt lịch"];

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
          <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/30">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold leading-6">Đặt lịch xem phòng</h3>
                  <p className="text-xs opacity-90">Chọn thời gian phù hợp, chúng tôi sẽ xác nhận ngay.</p>
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
                <label className="text-sm text-emerald-800">Ngày xem</label>
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
                <textarea className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: Tôi muốn xem phòng trong 15 phút, tôi có thể đến sớm hơn một chút." />
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-800 flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-emerald-600" />
              <div>
                Bạn có thể thay đổi hoặc huỷ lịch sau khi đặt. Chúng tôi sẽ liên hệ xác nhận qua số điện thoại bạn cung cấp.
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
                {submitting ? "Đang gửi..." : "Đặt lịch"}
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
  const [data, setData] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [fav, setFav] = useState<boolean>(false);

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

  const images = useMemo(() => {
    if (!data) return [];
    const arr: string[] = [];
    if (data.coverImageUrl) arr.push(data.coverImageUrl);
    if (Array.isArray((data as any).images)) {
      for (const s of (data as any).images as string[]) if (s) arr.push(s);
    }
    return Array.from(new Set(arr.filter(Boolean)));
  }, [data]);

  // Tiện nghi suy ra từ các cờ boolean của BE
  const amenities: AmenityKey[] = useMemo(() => {
    if (!data) return [];
    const list: AmenityKey[] = [];
    
    // Chỉ thêm những tiện nghi thực sự có
    if ((data as any).hasAirConditioner) list.push("aircon");
    if ((data as any).hasWaterHeater) list.push("water_heater");
    if ((data as any).hasPrivateBathroom) list.push("private_bath");
    if ((data as any).hasWashingMachine) list.push("washing");
    if ((data as any).hasWardrobe) list.push("balcony"); // tạm map wardrobe -> balcony
    if ((data as any).hasKitchenCabinet) list.push("shared_kitchen");
    
    // Luôn thêm wifi và parking làm tiện nghi mặc định
    list.push("wifi", "parking");
    
    return Array.from(new Set(list));
  }, [data]);

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-xl px-3 py-8 lg:px-6">
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
      <div className="mx-auto max-w-screen-md px-4 py-16 text-center">
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
  const availableFrom = (data as any)?.availableFrom as any;
  const rules = ((data as any)?.houseRules as string[]) || [];
  const landlordPhone = (data as any)?.contactPhone || "";
  const updatedAt = (data as any)?.updatedAt as any;
  const noOwnerLiving = (data as any)?.noOwnerLiving || false;
  const flexibleHours = (data as any)?.flexibleHours || false;

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.06),transparent_40%)]" />
        <div className="mx-auto max-w-screen-xl px-3 py-6 lg:px-6">
          <Breadcrumb title={data.title} />
          <FancyHeader
            title={data.title}
            address={addressLine}
            priceVnd={priceVnd}
            depositVnd={depositVnd}
            excerpt={(data as any).excerpt}
            updatedAt={updatedAt}
            noOwnerLiving={noOwnerLiving}
            flexibleHours={flexibleHours}
          />

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left */}
            <div className="space-y-5 lg:col-span-2">
              <Gallery images={images} />
              <AvailabilityBar availableFrom={availableFrom} />

              <Section title="Tổng quan">
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
                    <div className="rounded-lg border border-emerald-100 bg-white px-3 py-2">
                      <div className="text-xs text-emerald-700">Mã tin</div>
                      <div className="mt-0.5 font-semibold text-emerald-900">#{data.id}</div>
                    </div>
                    <div className="rounded-lg border border-emerald-100 bg-white px-3 py-2">
                      <div className="text-xs text-emerald-700">Trạng thái</div>
                      <div className="mt-0.5 font-semibold text-emerald-900">
                        {(data as any).status === 'published' ? 'Đang cho thuê' : 'Không khả dụng'}
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Tiện nghi">
                <AmenityGrid amenities={amenities} />
              </Section>

              <Section title="Chi phí chi tiết">
                <PriceBreakdown
                  roomPrice={priceVnd}
                  deposit={depositVnd}
                  electricPrice={electricPrice}
                  waterPrice={waterPrice}
                  internetFee={internetFee}
                  serviceFee={serviceFee}
                />
              </Section>

              <Section title="Quy định nhà">
                <HouseRules rules={rules} />
              </Section>

              {data.description ? (
                <Section title="Mô tả chi tiết">
                  <div
                    className="prose prose-emerald max-w-none prose-p:leading-relaxed prose-ul:list-disc prose-li:marker:text-emerald-600"
                    dangerouslySetInnerHTML={{ __html: data.description as string }}
                  />
                </Section>
              ) : null}

              <MapBox lat={lat} lng={lng} address={addressLine} />
            </div>

            {/* Right */}
            <div className="space-y-5 lg:col-span-1">
              <div className="sticky top-20">
                <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-[0_10px_30px_-16px_rgba(16,185,129,0.6)] backdrop-blur">
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setFav((v) => !v);
                        toast.info(!fav ? "Đã thêm vào yêu thích" : "Đã bỏ khỏi yêu thích");
                      }}
                      className={clsx(
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-emerald-800 hover:bg-emerald-50",
                        fav ? "border-rose-300 text-rose-700 bg-rose-50/40" : "border-emerald-200"
                      )}
                    >
                      <Heart className={clsx("h-5 w-5", fav && "fill-rose-500 text-rose-500")} /> {fav ? "Đã lưu" : "Lưu tin"}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "");
                        toast.success("Đã copy liên kết!");
                      }}
                      className="flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-emerald-800 hover:bg-emerald-50"
                    >
                      <Share2 className="h-5 w-5" /> Chia sẻ
                    </button>
                  </div>
                  {landlordPhone && (
                    <a href={`tel:${landlordPhone}`} className="group mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow hover:bg-emerald-700">
                      <Phone className="h-5 w-5" /> Gọi ngay
                    </a>
                  )}
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

                  {/* Thẻ thông tin nhanh */}
                  <div className="mt-3 rounded-xl border border-emerald-100 bg-white p-3 text-sm text-emerald-900/90">
                    <div className="flex items-center justify-between">
                      <span>Đăng lúc</span>
                      <b>{formatDateVN((data as any).createdAt)}</b>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cập nhật</span>
                      <b>{formatDateVN((data as any).updatedAt)}</b>
                    </div>
                  </div>
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
    </>
  );
}
