// app/rooms/[slug]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Heart,
  Share2,
  MapPin,
  Home,
  ShowerHead,
  BedDouble,
  Ruler,
  Lock,
  Zap,
  Wifi,
  Car,
  ShieldCheck,
  Phone,
  CalendarDays,
  Copy,
  Star,
  X,
} from "lucide-react";
import clsx from "clsx";
import { formatMoneyVND } from "@/utils/format-number";
import { apartmentService } from "@/services/apartmentService";
import { Apartment } from "@/type/apartment";

/* ===================== Amenity ===================== */
type AmenityKey =
  | "wifi"
  | "parking"
  | "private_bath"
  | "shared_kitchen"
  | "aircon"
  | "water_heater"
  | "security"
  | "balcony"
  | "washing"
  | "elevator";

const AMENITY_META: Record<AmenityKey, { label: string; icon: React.ReactNode }> = {
  wifi: { label: "Wi-Fi", icon: <Wifi className="h-4 w-4" /> },
  parking: { label: "Chỗ để xe", icon: <Car className="h-4 w-4" /> },
  private_bath: { label: "WC riêng", icon: <ShowerHead className="h-4 w-4" /> },
  shared_kitchen: { label: "Bếp chung", icon: <Home className="h-4 w-4" /> },
  aircon: { label: "Điều hoà", icon: <Zap className="h-4 w-4" /> },
  water_heater: { label: "Nóng lạnh", icon: <ShowerHead className="h-4 w-4" /> },
  security: { label: "An ninh", icon: <ShieldCheck className="h-4 w-4" /> },
  balcony: { label: "Ban công", icon: <Home className="h-4 w-4" /> },
  washing: { label: "Máy giặt", icon: <Home className="h-4 w-4" /> },
  elevator: { label: "Thang máy", icon: <Home className="h-4 w-4" /> },
};

/* ===================== Helpers & Defaults ===================== */
const withBase = (u?: string) => {
  if (!u) return "";
  if (u.startsWith("http") || u.startsWith("data:")) return u;
  return `${process.env.NEXT_PUBLIC_API_URL || ""}${u}`;
};
const parseNum = (v: any, fallback = 0): number => {
  if (v == null) return fallback;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : fallback;
};

type SimilarItem = {
  id: number;
  title: string;
  priceVnd: number;
  cover: string;
  district: string;
  areaM2: number;
  slug: string;
};

const DEFAULT_AMENITIES: AmenityKey[] = [
  "wifi",
  "aircon",
  "private_bath",
  "water_heater",
  "security",
  "parking",
  "balcony",
];
const DEFAULT_POLICIES = ["Không chung chủ", "Giờ giấc linh hoạt"];
const CONTACT_NAME = "Chủ nhà";
const CONTACT_PHONE = "0968 123 456";

const SIMILAR_FALLBACK: SimilarItem[] = [
  { id: 101, slug: "phong-gac-xep-18m2-sach", title: "Gác xép 18m², WC riêng, sạch như mới", priceVnd: 3200000, cover: "/static/images/444ac251-05fe-4f79-b80c-a7e4506ebe9b.jpg", district: "Đống Đa", areaM2: 18 },
  { id: 102, slug: "ccmn-25m2-full-do", title: "CCMN 25m² full đồ – vào ở ngay", priceVnd: 4500000, cover: "/static/images/444ac251-05fe-4f79-b80c-a7e4506ebe9b.jpg", district: "Ba Đình", areaM2: 25 },
  { id: 103, slug: "phong-22m2-ban-cong", title: "Phòng 22m² có ban công, gửi xe free", priceVnd: 3800000, cover: "/static/images/444ac251-05fe-4f79-b80c-a7e4506ebe9b.jpg", district: "Cầu Giấy", areaM2: 22 },
  { id: 104, slug: "phong-20m2-gan-keangnam", title: "Phòng mới 20m², gần Keangnam", priceVnd: 4000000, cover: "/static/images/444ac251-05fe-4f79-b80c-a7e4506ebe9b.jpg", district: "Nam Từ Liêm", areaM2: 20 },
];

/* ===================== Atoms ===================== */
const Section = ({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) => (
  <section className="rounded-2xl border border-emerald-100/70 bg-white/80 shadow-[0_6px_20px_-12px_rgba(16,185,129,0.35)] backdrop-blur px-4 py-4 md:px-6 md:py-5">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-emerald-950">{title}</h2>
      {right}
    </div>
    {children}
  </section>
);

/* ===================== Pieces ===================== */
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
  title,
  address,
  priceVnd,
  depositVnd,
  rating = 4.8,
  reviewsCount = 26,
}: {
  title: string;
  address: string;
  priceVnd: number;
  depositVnd?: number;
  rating?: number;
  reviewsCount?: number;
}) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-1">
      <div className="rounded-3xl bg-white/70 p-5 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2">
              <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">Tin mới</span>
              <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-700 ring-1 ring-orange-200">Không chung chủ</span>
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200">Vào ở ngay</span>
            </div>
            <h1 className="text-2xl font-bold leading-snug text-emerald-950 md:text-3xl">{title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-emerald-800/80">
              <div className="flex items-center gap-1"><MapPin className="h-4 w-4" />{address}</div>
              {rating ? (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-emerald-900">{rating.toFixed(1)}</span>
                  <span>({reviewsCount} đánh giá)</span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="shrink-0 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-right">
            <div className="text-xs text-emerald-700">Giá phòng</div>
            <div className="text-3xl font-extrabold text-emerald-900">{formatMoneyVND(priceVnd)}</div>
            {depositVnd ? <div className="text-xs text-emerald-700/80">Cọc {formatMoneyVND(depositVnd)}</div> : null}
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
      {amenities.map((k) => (
        <div key={k} className="group flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2 text-emerald-900 transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-200">{AMENITY_META[k].icon}</span>
          <span>{AMENITY_META[k].label}</span>
        </div>
      ))}
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

  return (
    <>
      <div className="rounded-3xl border border-emerald-100 bg-white/80 p-2 backdrop-blur">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
          {big ? (
            <img src={withBase(big)} alt="" className="h-full w-full object-cover transition-all duration-300 hover:scale-[1.01]" onClick={() => setOpen(true)} />
          ) : (
            <div className="grid h-full w-full place-items-center text-sm text-emerald-800/70">Chưa có ảnh</div>
          )}
          {big && (
            <button onClick={() => setOpen(true)} className="absolute bottom-3 right-3 rounded-xl bg-emerald-900/70 px-3 py-1.5 text-xs text-white backdrop-blur hover:bg-emerald-900">
              Xem lớn
            </button>
          )}
        </div>
        {images?.length > 1 && (
          <div className="mt-2 grid grid-cols-5 gap-2">
            {images.slice(0, 10).map((src, i) => (
              <button key={i} onClick={() => setActive(i)} className={clsx("relative aspect-[4/3] overflow-hidden rounded-xl border", i === active ? "border-emerald-600 ring-2 ring-emerald-600/50" : "border-emerald-100")}>
                <img src={withBase(src)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {open && big && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <button className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-emerald-900" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
          <div className="flex h-full items-center justify-center p-4">
            <div className="relative w-full max-w-5xl">
              <img src={withBase(big)} alt="" width={1600} height={900} className="h-auto w-full rounded-2xl object-contain" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MapBox({ lat, lng, address }: { lat?: number; lng?: number; address: string }) {
  const validLatLng = Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 || lng === 0 || lat === 1 || lng === 1);
  const src = validLatLng
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white/80 shadow-[0_6px_20px_-12px_rgba(16,185,129,0.35)]">
      <div className="flex items-center gap-2 p-3 text-emerald-900">
        <MapPin className="h-5 w-5" />
        <span>{address}</span>
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

function SimilarGrid({ items }: { items: SimilarItem[] }) {
  if (!items?.length) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((it) => (
        <Link key={it.id} href={`/rooms/${it.slug}`} className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white/90 shadow-[0_8px_24px_-16px_rgba(16,185,129,0.45)] transition hover:-translate-y-0.5 hover:shadow-lg">
          <div className="relative aspect-[4/3]">
            <img src={withBase(it.cover)} alt={it.title} className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
          </div>
          <div className="p-3">
            <h3 className="line-clamp-2 text-sm font-medium text-emerald-950">{it.title}</h3>
            <div className="mt-2 text-sm">
              <span className="text-emerald-800/70">{it.areaM2} m² • {it.district}</span>
            </div>
            <span className="font-semibold text-emerald-700">{formatMoneyVND(it.priceVnd)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function StickyActions({ phone, contactName, listingId, onFav }: { phone: string; contactName?: string; listingId?: number | string; onFav: () => void; }) {
  return (
    <div className="sticky top-6 z-[1]">
      <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-[0_10px_30px_-16px_rgba(16,185,129,0.6)] backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={onFav} className="flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-emerald-800 hover:bg-emerald-50"><Heart className="h-5 w-5" /> Lưu tin</button>
          <button className="flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-emerald-800 hover:bg-emerald-50"><Share2 className="h-5 w-5" /> Chia sẻ</button>
        </div>
        <a href={`tel:${phone || ""}`} className="group mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow hover:bg-emerald-700">
          <Phone className="h-5 w-5" /> Gọi ngay
        </a>
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 px-4 py-3 text-emerald-800 hover:bg-emerald-50">
          <CalendarDays className="h-5 w-5" /> Đặt lịch xem phòng
        </button>
        <div className="mt-4 rounded-xl bg-emerald-50/70 p-3 text-sm text-emerald-800">
          <p className="font-medium">Người liên hệ</p>
          <p className="mt-1">• {contactName || "Chủ nhà"}</p>
          {listingId ? (
            <div className="mt-2 flex items-center gap-2">
              <code className="rounded bg-white px-2 py-1">#{listingId}</code>
              <span className="text-emerald-700/70">Mã tin</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/80 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-screen-sm items-center gap-2">
          <button onClick={onFav} className="flex w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 p-2 text-emerald-800">
            <Heart className="h-5 w-5" />
          </button>
          <a href={`tel:${phone || ""}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-white">
            <Phone className="h-5 w-5" /> Gọi
          </a>
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 py-3 text-emerald-800">Đặt lịch</button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Page ===================== */
export default function RoomPage({ slug }: {slug: string }) {
  const [fav, setFav] = useState(false);
  const [data, setData] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [similar] = useState<SimilarItem[]>(SIMILAR_FALLBACK); // fix cứng

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const apt = await apartmentService.getBySlug(slug);
        if (!mounted) return;
        setData(apt);
        setErr(null);
      } catch (e: any) {
        setErr(e?.message || "Không tải được dữ liệu");
        setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

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

  // ======= Derivatives from API data (không map object, chỉ tính toán) =======
  const priceVnd = parseNum((data as any).rentPrice);
  const areaM2 = parseNum((data as any).areaM2);
  const bedrooms = parseNum((data as any).bedrooms);
  const bathrooms = parseNum((data as any).bathrooms);
  const depositVnd = priceVnd || undefined; // fix cứng: cọc = 1 tháng
  const images = data.coverImageUrl ? [data.coverImageUrl] : [];
  const district = (data.location?.level?.toLowerCase?.() === "district" && data.location?.name) || undefined;
  const addressLine = data.streetAddress || [district, "Hà Nội"].filter(Boolean).join(", ");
  const lat = parseNum((data as any).lat, undefined as any);
  const lng = parseNum((data as any).lng, undefined as any);

  return (
    <div className="relative">
      {/* subtle bg pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.06),transparent_40%)]" />
      <div className="mx-auto max-w-screen-xl px-3 py-6 lg:px-6">
        <Breadcrumb title={data.title} district={district} />
        <FancyHeader title={data.title} address={addressLine} priceVnd={priceVnd} depositVnd={depositVnd} />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-5 lg:col-span-2">
            <Gallery images={images} />

            <Section title="Tổng quan">
              <KeyFacts areaM2={areaM2} bedrooms={bedrooms} bathrooms={bathrooms} />
            </Section>

            <Section title="Tiện nghi">
              <AmenityGrid amenities={DEFAULT_AMENITIES} />
            </Section>

            <Section title="Chính sách">
              <Chips items={DEFAULT_POLICIES} />
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

            <Section title="Có thể bạn quan tâm" right={<Link href="/tim-phong-quanh-day" className="text-sm text-emerald-700 hover:underline">Xem thêm</Link>}>
              <SimilarGrid items={SIMILAR_FALLBACK} />
            </Section>
          </div>

          {/* Right column */}
          <div className="space-y-5 lg:col-span-1">
            <StickyActions phone={CONTACT_PHONE} contactName={CONTACT_NAME} listingId={data.id} onFav={() => setFav((v) => !v)} />
            <Section title="Địa chỉ">
              <div className="text-sm text-emerald-800/90">{addressLine}</div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
