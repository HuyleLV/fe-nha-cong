"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapPinned, ChevronDown, ChevronRight, BadgePercent, Flame, Heart,
  BedDouble, Bath, Ruler, FilterX, Map as MapIcon, List, RotateCcw
} from "lucide-react";
import SearchBar from "@/components/searchBar";
import { Apartment, ApartmentStatus } from "@/type/apartment";
import { apartmentService } from "@/services/apartmentService";
import Pagination from "@/components/Pagination";
import { toSlug } from "@/utils/formatSlug";
import LocationLookup from "@/app/admin/components/locationLookup";

// ================ Helpers =================
const cx = (...arr: (string | false | undefined)[]) => arr.filter(Boolean).join(" ");
const toVnd = (n?: number | string) => {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  return (Number.isFinite(v) ? v : 0).toLocaleString("vi-VN");
};
const toNum = (v?: string | number | null) => {
  if (v === null || v === undefined) return undefined;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
};
const LIMIT = 10;

// ================ Root Page =================
export default function TimPhongQuanhDayPage() {
  // View / sort
  const [view, setView] = useState<"list" | "map">("list");
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc" | "area_desc">("newest");

  // search + yêu thích
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState<number[]>([]);

  // Filters ↔ QueryApartmentDto
  const [locationSlug, setLocationSlug] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<ApartmentStatus | undefined>("published");
  const [minPrice, setMinPrice] = useState<string>("0");
  const [maxPrice, setMaxPrice] = useState<string>("8000000");
  const [minArea, setMinArea] = useState<string>("0");
  const [maxArea, setMaxArea] = useState<string>("100");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [bathrooms, setBathrooms] = useState<string>("");

  // Amenities (boolean)
  const [hasPrivateBathroom, setHasPrivateBathroom] = useState(false);
  const [hasMezzanine, setHasMezzanine] = useState(false);
  const [noOwnerLiving, setNoOwnerLiving] = useState(false);
  const [hasAirConditioner, setHasAirConditioner] = useState(false);
  const [hasWaterHeater, setHasWaterHeater] = useState(false);
  const [hasWashingMachine, setHasWashingMachine] = useState(false);
  const [hasWardrobe, setHasWardrobe] = useState(false);
  const [flexibleHours, setFlexibleHours] = useState(false);

  // “Ưu tiên giá tốt” (client-side)
  const [onlyHot, setOnlyHot] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => page < totalPages && setPage(page + 1);

  // Data
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [list, setList] = useState<Apartment[]>([]);

  // Build params (khớp QueryApartmentDto)
  const buildParams = () => ({
    q: query?.trim() || undefined,
    locationSlug: locationSlug || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minArea: minArea ? Number(minArea) : undefined,
    maxArea: maxArea ? Number(maxArea) : undefined,
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
    bathrooms: bathrooms ? Number(bathrooms) : undefined,
    status,
    sort,                  // ✅ server-side sort
    // amenities: chỉ gửi khi true
    hasPrivateBathroom: hasPrivateBathroom || undefined,
    hasMezzanine: hasMezzanine || undefined,
    noOwnerLiving: noOwnerLiving || undefined,
    hasAirConditioner: hasAirConditioner || undefined,
    hasWaterHeater: hasWaterHeater || undefined,
    hasWashingMachine: hasWashingMachine || undefined,
    hasWardrobe: hasWardrobe || undefined,
    flexibleHours: flexibleHours || undefined,
    page,
    limit: LIMIT,
  });

  // Call API via service + paginate meta (debounce 300ms)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);

    const timer = setTimeout(async () => {
      try {
        const { items, meta } = await apartmentService.getAll(buildParams());
        if (cancelled) return;

        setList(items || []);
        setTotal(meta.total ?? 0);
        const pgCount = meta.totalPages ?? Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || LIMIT)));
        setTotalPages(pgCount);

        if (meta.page && meta.page !== page) setPage(meta.page);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Lỗi tải dữ liệu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    query, locationSlug, minPrice, maxPrice, minArea, maxArea,
    bedrooms, bathrooms, status, sort,
    hasPrivateBathroom, hasMezzanine, noOwnerLiving, hasAirConditioner,
    hasWaterHeater, hasWashingMachine, hasWardrobe, flexibleHours, page
  ]);

  // client-side “hot”
  const results = useMemo(() => {
    let arr = [...list];
    if (onlyHot) arr = arr.filter((r: any) => r?.isHot || r?.hot);
    return arr;
  }, [list, onlyHot]);

  // reset filters
  const clearAll = () => {
    setQuery("");
    setLocationSlug(undefined);
    setStatus("published");
    setMinPrice("0");
    setMaxPrice("8000000");
    setMinArea("0");
    setMaxArea("100");
    setBedrooms("");
    setBathrooms("");
    setHasPrivateBathroom(false);
    setHasMezzanine(false);
    setNoOwnerLiving(false);
    setHasAirConditioner(false);
    setHasWaterHeater(false);
    setHasWashingMachine(false);
    setHasWardrobe(false);
    setFlexibleHours(false);
    setOnlyHot(false);
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="max-w-7xl mx-auto mt-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <MapPinned />
          <h1 className="font-bold text-xl md:text-2xl">Tìm phòng quanh đây</h1>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 py-8 px-4">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="sticky top-4 bg-white rounded-2xl border border-emerald-200 shadow-sm p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-green-900 font-bold">Bộ lọc</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearAll}
                  className="text-sm inline-flex items-center gap-1 text-green-700 hover:text-green-900"
                >
                  <RotateCcw className="w-4 h-4" /> Xoá
                </button>
                <button
                  onClick={() => setPage(1)}
                  className="text-sm inline-flex items-center gap-1 text-green-700 hover:text-green-900"
                >
                  <FilterX className="w-4 h-4" /> Áp dụng
                </button>
              </div>
            </div>


            {/* Khu vực */}
            <Accordion title="Khu vực">
              <LocationLookup
                value={null as any}
                onChange={(loc: any) => {
                  setLocationSlug(loc?.slug || (loc?.name ? toSlug(loc.name) : undefined));
                  setPage(1);
                }}
                placeholder="Chọn khu vực"
              />
              {locationSlug && (
                <div className="text-xs text-slate-600 mt-2">
                  Đang lọc theo: <span className="font-medium text-green-700">{locationSlug}</span>
                </div>
              )}
            </Accordion>

            {/* Giá (DualRange) */}
            <Accordion title="Giá (VND/tháng)">
              {/* Preset nhanh */}
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { label: "< 3tr", v: [0, 3_000_000] },
                  { label: "3–5tr", v: [3_000_000, 5_000_000] },
                  { label: "5–8tr", v: [5_000_000, 8_000_000] },
                  { label: "8–12tr", v: [8_000_000, 12_000_000] },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { setMinPrice(String(p.v[0])); setMaxPrice(String(p.v[1])); setPage(1); }}
                    className="text-xs px-3 py-1.5 rounded-full border border-emerald-200 hover:bg-emerald-50 text-emerald-800"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <DualRange
                min={0}
                max={12_000_000}
                step={50_000}
                valueMin={Number(minPrice || 0)}
                valueMax={Number(maxPrice || 12_000_000)}
                onChange={(minV, maxV) => {
                  setMinPrice(String(minV));
                  setMaxPrice(String(maxV));
                  setPage(1);
                }}
                format={(v) => `${toVnd(v)} đ`}
              />
            </Accordion>

            {/* Diện tích (DualRange) */}
            <Accordion title="Diện tích (m²)">
              {/* Preset nhanh */}
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { label: "<20", v: [0, 20] },
                  { label: "20–30", v: [20, 30] },
                  { label: "30–40", v: [30, 40] },
                  { label: "≥40", v: [40, 100] },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { setMinArea(String(p.v[0])); setMaxArea(String(p.v[1])); setPage(1); }}
                    className="text-xs px-3 py-1.5 rounded-full border border-emerald-200 hover:bg-emerald-50 text-emerald-800"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <DualRange
                min={0}
                max={100}
                step={1}
                valueMin={Number(minArea || 0)}
                valueMax={Number(maxArea || 100)}
                onChange={(minV, maxV) => {
                  setMinArea(String(minV));
                  setMaxArea(String(maxV));
                  setPage(1);
                }}
                format={(v) => `${v} m²`}
              />
            </Accordion>

            {/* Phòng ngủ / WC */}
            <Accordion title="Phòng ngủ / WC">
              <div className="grid grid-cols-2 gap-2">
                <NumberChip labelPrefix="PN" values={[0, 1, 2, 3]} current={bedrooms} onChange={setBedrooms} />
                <NumberChip labelPrefix="WC" values={[0, 1, 2]} current={bathrooms} onChange={setBathrooms} />
              </div>
            </Accordion>

            {/* Tiện nghi */}
            <Accordion title="Tiện nghi (Nâng cao)">
              <div className="flex flex-wrap gap-2">
                <ToggleChip active={hasPrivateBathroom} onToggle={() => { setHasPrivateBathroom(!hasPrivateBathroom); setPage(1); }}>VS khép kín</ToggleChip>
                <ToggleChip active={hasMezzanine} onToggle={() => { setHasMezzanine(!hasMezzanine); setPage(1); }}>Gác xép</ToggleChip>
                <ToggleChip active={noOwnerLiving} onToggle={() => { setNoOwnerLiving(!noOwnerLiving); setPage(1); }}>Không chung chủ</ToggleChip>
                <ToggleChip active={hasAirConditioner} onToggle={() => { setHasAirConditioner(!hasAirConditioner); setPage(1); }}>Điều hoà</ToggleChip>
                <ToggleChip active={hasWaterHeater} onToggle={() => { setHasWaterHeater(!hasWaterHeater); setPage(1); }}>Nóng lạnh</ToggleChip>
                <ToggleChip active={hasWashingMachine} onToggle={() => { setHasWashingMachine(!hasWashingMachine); setPage(1); }}>Máy giặt</ToggleChip>
                <ToggleChip active={hasWardrobe} onToggle={() => { setHasWardrobe(!hasWardrobe); setPage(1); }}>Tủ quần áo</ToggleChip>
                <ToggleChip active={flexibleHours} onToggle={() => { setFlexibleHours(!flexibleHours); setPage(1); }}>Giờ linh hoạt</ToggleChip>
              </div>
            </Accordion>

            {/* Khác */}
            <Accordion title="Khác">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyHot}
                  onChange={(e) => { setOnlyHot(e.target.checked); setPage(1); }}
                  className="accent-green-600"
                />
                <span className="inline-flex items-center gap-1">
                  Ưu tiên <Flame className="w-4 h-4 text-orange-500" /> Giá tốt
                </span>
              </label>
            </Accordion>
          </div>
        </aside>

        {/* Results */}
        <main className="md:col-span-3">
          <SearchBar
            onSearch={(q: string) => {
              setQuery(q);
              setPage(1);
            }}
          />

          <Toolbar sort={sort} setSort={setSort} view={view} setView={setView} count={total} />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : err ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Lỗi tải dữ liệu: {err}</div>
          ) : view === "list" ? (
            results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl-grid-cols-2 gap-5">
                {results.map((r) => (
                  <RoomCard
                    key={r.id}
                    data={r}
                    liked={liked.includes(r.id)}
                    onLike={() =>
                      setLiked((s) => (s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id]))
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-white p-6 text-gray-600">
                Không tìm thấy kết quả phù hợp.
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-green-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 p-3 border-b border-green-100 text-sm text-gray-700">
                <MapIcon className="text-green-700" />
                <span>Bản đồ</span>
              </div>
              <div className="h-[600px]">
                <iframe
                  title="Bản đồ"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59615.428462975906!2d105.71369061023124!3d20.953949609279487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134532bef4bcdb7%3A0xbcc7a679fcba07f6!2zSMOgIMSQw7RuZywgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1759043217443!5m2!1svi!2s"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </main>
      </div>
    </div>
  );
}

// ================= UI Pieces =================
function Toolbar({ sort, setSort, view, setView, count }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 mt-10">
      <div className="text-sm text-gray-600">
        Tìm thấy <b className="text-green-800">{count}</b> phòng
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none bg-white border border-green-200 text-sm rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="area_desc">Diện tích lớn nhất</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
        </div>
        <div className="inline-flex rounded-xl border border-green-200 overflow-hidden">
          <button
            onClick={() => setView("list")}
            className={cx(
              "px-3 py-2 text-sm flex items-center gap-1",
              view === "list" ? "bg-green-600 text-white" : "bg-white text-green-700 hover:bg-green-50"
            )}
          >
            <List className="w-4 h-4" /> Danh sách
          </button>
          <button
            onClick={() => setView("map")}
            className={cx(
              "px-3 py-2 text-sm flex items-center gap-1",
              view === "map" ? "bg-green-600 text-white" : "bg-white text-green-700 hover:bg-green-50"
            )}
          >
            <MapIcon className="w-4 h-4" /> Bản đồ
          </button>
        </div>
      </div>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-green-100 py-3">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-left">
        <span className="font-semibold text-green-900">{title}</span>
        <ChevronRight className={cx("w-4 h-4 transition", open && "rotate-90")} />
      </button>
      <div className={cx("overflow-hidden transition-all", open ? "mt-2" : "h-0")}>{open && children}</div>
    </div>
  );
}

function ToggleChip({ active, onToggle, children }: { active: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-1 rounded-full border text-sm transition
        ${active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 hover:bg-slate-50"}`}
    >
      {children}
    </button>
  );
}

function NumberChip({
  labelPrefix,
  values,
  current,
  onChange,
}: {
  labelPrefix: string;
  values: number[];
  current?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("")}
        className={cx(
          "text-xs px-3 py-1.5 rounded-xl border transition",
          !current ? "bg-green-600 text-white border-green-600" : "border-green-200 hover:bg-green-50 text-green-800"
        )}
      >
        {labelPrefix} Tất cả
      </button>
      {values.map((n) => (
        <button
          key={n}
          onClick={() => onChange(String(n))}
          className={cx(
            "text-xs px-3 py-1.5 rounded-xl border transition",
            current === String(n) ? "bg-green-600 text-white border-green-600" : "border-green-200 hover:bg-green-50 text-green-800"
          )}
        >
          {labelPrefix} {n}
        </button>
      ))}
    </div>
  );
}

function RoomCard({ data, liked, onLike }: { data: Apartment; liked: boolean; onLike: () => void }) {
  const price = toVnd(data.rentPrice);
  const ward = data.addressPath || data.location?.name;
  const imgRel = data.coverImageUrl || `/api/static/placeholder/apm-${data.id}.jpg`;
  const src = imgRel?.startsWith("http") ? imgRel : `${process.env.NEXT_PUBLIC_API_URL || ""}${imgRel}`;

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-green-200 shadow-sm hover:shadow-md transition">
      <div className="relative">
        <img src={src} alt={data.title} className="w-full h-48 object-cover" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/90 text-green-700 px-2 py-1 rounded-full border border-green-200 shadow-sm">
            <BadgePercent className="w-3 h-3" /> Ưu đãi
          </span>
        </div>
        <button
          onClick={onLike}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 border border-green-200 text-green-700 hover:bg-green-50"
        >
          {liked ? <Heart className="w-4 h-4 fill-current" /> : <Heart className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4">
        <a href={`/room/${data.slug}`}>
          <h3 className="font-bold text-green-900 group-hover:underline leading-snug line-clamp-2">{data.title}</h3>
          <div className="mt-1 text-red-600 font-semibold">Từ {price} / tháng</div>
          <div className="mt-1 text-sm text-gray-600">{ward}</div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1"><BedDouble className="w-4 h-4 text-green-700" /> {data.bedrooms ?? 0} ngủ</span>
            <span className="inline-flex items-center gap-1"><Bath className="w-4 h-4 text-green-700" /> {data.bathrooms ?? 0} WC</span>
            <span className="inline-flex items-center gap-1"><Ruler className="w-4 h-4 text-green-700" /> {toNum(data.areaM2) ?? 0} m²</span>
          </div>
          <div className="mt-4 flex items-center justify-end">
            <button className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:opacity-95 cursor-pointer">Xem chi tiết</button>
          </div>
        </a>
      </div>
    </article>
  );
}

// DualRange – thanh kéo 2 đầu cho min/max
function DualRange({
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onChange,
  format = (v: number) => String(v),
}: {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onChange: (nextMin: number, nextMax: number) => void;
  format?: (v: number) => string;
}) {
  const [localMin, setLocalMin] = useState(valueMin);
  const [localMax, setLocalMax] = useState(valueMax);

  // sync from props
  useEffect(() => setLocalMin(valueMin), [valueMin]);
  useEffect(() => setLocalMax(valueMax), [valueMax]);

  const handleMin = (v: number) => {
    const clamped = Math.min(Math.max(v, min), localMax);
    setLocalMin(clamped);
    onChange(clamped, localMax);
  };
  const handleMax = (v: number) => {
    const clamped = Math.max(Math.min(v, max), localMin);
    setLocalMax(clamped);
    onChange(localMin, clamped);
  };

  const left = ((localMin - min) / (max - min)) * 100;
  const right = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {/* Values row */}
      <div className="flex items-center justify-between text-sm mb-2">
        <span>{format(localMin)}</span>
        <span>—</span>
        <span>{format(localMax)}</span>
      </div>

      {/* Track */}
      <div className="relative h-8">
        {/* background track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full bg-emerald-100" />
        {/* selected range */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-emerald-400"
          style={{ left: `${left}%`, right: `${100 - right}%` }}
        />
        {/* two inputs overlap */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={(e) => handleMin(Number(e.target.value))}
          className="absolute w-full top-0 bottom-0 appearance-none bg-transparent pointer-events-auto"
          style={{ zIndex: 2 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={(e) => handleMax(Number(e.target.value))}
          className="absolute w-full top-0 bottom-0 appearance-none bg-transparent pointer-events-auto"
          style={{ zIndex: 3 }}
        />

        {/* thumbs (visual only) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-emerald-500 bg-white shadow"
          style={{ left: `calc(${left}% - 8px)` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-emerald-500 bg-white shadow"
          style={{ left: `calc(${right}% - 8px)` }}
        />
      </div>
    </div>
  );
}

// skeleton
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-green-200 shadow-sm animate-pulse">
      <div className="w-full h-48 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="flex gap-2">
          <div className="h-3 bg-gray-100 rounded w-16" />
          <div className="h-3 bg-gray-100 rounded w-16" />
          <div className="h-3 bg-gray-100 rounded w-16" />
        </div>
        <div className="h-9 bg-gray-100 rounded" />
      </div>
    </div>
  );
}
