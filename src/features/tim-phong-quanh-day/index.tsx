"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapPinned, ChevronDown, ChevronRight, BadgePercent, Flame, Heart,
  BedDouble, Bath, Ruler, FilterX, Map as MapIcon, List,
} from "lucide-react";
import SearchBar from "@/components/searchBar";
import { Apartment, ApartmentStatus } from "@/type/apartment";
import { apartmentService } from "@/services/apartmentService";
import Pagination from "@/components/Pagination";
import { toSlug } from "@/utils/formatSlug";

// ================ Helpers =================
const cx = (...arr: (string | false | undefined)[]) => arr.filter(Boolean).join(" ");
const toVnd = (n?: number | string) => {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  return (Number.isFinite(v) ? v : 0).toLocaleString("vi-VN");
};
const priceNum = (x: Apartment) => Number((x as any)?.rentPrice ?? 0);

// cấu hình trang
const LIMIT = 10;

// ================ Root Page =================
export default function TimPhongQuanhDayPage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [sort, setSort] = useState<"best" | "price-asc" | "price-desc" | "newest">("best");
  const [liked, setLiked] = useState<number[]>([]);

  // Filters ↔ QueryApartmentDto
  const [areas, setAreas] = useState<string[]>([]);
  const [price, setPrice] = useState<[number, number]>([2_000_000, 8_000_000]);
  const [bedrooms, setBedrooms] = useState<number | undefined>(undefined);
  const [bathrooms, setBathrooms] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<ApartmentStatus | undefined>("published");
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
    locationSlug: areas.length > 0 ? toSlug(areas[0]) : undefined,
    minPrice: price?.[0],
    maxPrice: price?.[1],
    bedrooms,
    bathrooms,
    status,
    page,
    limit: LIMIT,
  });

  // Call API via service + paginate meta
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
        setTotalPages(meta.totalPages ?? Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || LIMIT))));
        // đồng bộ page nếu server có thể điều chỉnh
        if (meta.page && meta.page !== page) setPage(meta.page);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Lỗi tải dữ liệu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250); // debounce

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, areas, price, bedrooms, bathrooms, status, page]); // không phụ thuộc LIMIT vì là hằng

  // client-side sort (nếu server chưa hỗ trợ)
  const results = useMemo(() => {
    let arr = [...list];
    if (onlyHot) arr = arr.filter((r: any) => r?.isHot || r?.hot);
    if (sort === "price-asc")  arr.sort((a, b) => priceNum(a) - priceNum(b));
    if (sort === "price-desc") arr.sort((a, b) => priceNum(b) - priceNum(a));
    if (sort === "newest")     arr = arr.slice().reverse();
    return arr;
  }, [list, onlyHot, sort]);

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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-green-900 font-bold">Bộ lọc</h2>
              <button
                onClick={() => {
                  setAreas([]);
                  setBedrooms(undefined);
                  setBathrooms(undefined);
                  setStatus("published");
                  setOnlyHot(false);
                  setPrice([2_000_000, 8_000_000]);
                  setPage(1);
                }}
                className="text-sm inline-flex items-center gap-1 text-green-700 hover:text-green-900"
              >
                <FilterX className="w-4 h-4" /> Đặt lại
              </button>
            </div>

            <Accordion title="Khu vực">
              <CheckGroup
                options={["Cầu Giấy", "Thanh Xuân", "Hai Bà Trưng", "Hoàng Mai", "Hà Đông", "Mỹ Đình"]}
                values={areas}
                onChange={(v) => {
                  setAreas(v);
                  setPage(1);
                }}
              />
            </Accordion>

            <Accordion title="Giá (VND/tháng)">
              <PriceRange
                value={price}
                onChange={(v) => {
                  const [min, max] = normalizeMinMax(v[0], v[1]);
                  setPrice([min, max]);
                  setPage(1);
                }}
                min={0}
                max={12_000_000}
                step={500_000}
              />
            </Accordion>

            <Accordion title="Phòng ngủ / WC">
              <div className="grid grid-cols-2 gap-2">
                <NumberChip
                  labelPrefix="PN"
                  values={[0, 1, 2, 3]}
                  current={bedrooms}
                  onChange={(n) => {
                    setBedrooms(n);
                    setPage(1);
                  }}
                />
                <NumberChip
                  labelPrefix="WC"
                  values={[0, 1, 2]}
                  current={bathrooms}
                  onChange={(n) => {
                    setBathrooms(n);
                    setPage(1);
                  }}
                />
              </div>
            </Accordion>

            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyHot}
                  onChange={(e) => setOnlyHot(e.target.checked)}
                  className="accent-green-600"
                />
                <span className="inline-flex items-center gap-1">
                  Ưu tiên <Flame className="w-4 h-4 text-orange-500" /> Giá tốt
                </span>
              </label>
              <button
                onClick={() => setPage(1)}
                className="bg-gradient-to-r from-[#006633] to-[#4CAF50] text-white px-4 py-2 rounded-xl font-semibold shadow hover:opacity-95"
              >
                Áp dụng
              </button>
            </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5">
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
              {/* header nhỏ (tuỳ chọn) */}
              <div className="flex items-center gap-2 p-3 border-b border-green-100 text-sm text-gray-700">
                <MapIcon className="text-green-700" />
                <span>Bản đồ Hà Đông</span>
              </div>

              {/* khung bản đồ */}
              <div className="h-[600px]">
                <iframe
                  title="Bản đồ Hà Đông"
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
            <option value="best">Phù hợp nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="newest">Mới nhất</option>
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

function CheckGroup({
  options,
  values,
  onChange,
}: {
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const checked = values.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onChange(checked ? values.filter((v) => v !== opt) : [...values, opt])}
            className={cx(
              "text-sm px-3 py-2 rounded-xl border transition flex items-center justify-center",
              checked ? "bg-green-600 text-white border-green-600" : "border-green-200 hover:bg-green-50 text-green-800"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
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
  current?: number;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(undefined)}
        className={cx(
          "text-xs px-3 py-1.5 rounded-xl border transition",
          current == null ? "bg-green-600 text-white border-green-600" : "border-green-200 hover:bg-green-50 text-green-800"
        )}
      >
        {labelPrefix} Tất cả
      </button>
      {values.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={cx(
            "text-xs px-3 py-1.5 rounded-xl border transition",
            current === n ? "bg-green-600 text-white border-green-600" : "border-green-200 hover:bg-green-50 text-green-800"
          )}
        >
          {labelPrefix} {n}
        </button>
      ))}
    </div>
  );
}

function PriceRange({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: [number, number];
  onChange: (v: [number, number]) => void;
  min: number;
  max: number;
  step: number;
}) {
  const [a, b] = value;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span>{toVnd(a)} đ</span>
        <span>—</span>
        <span>{toVnd(b)} đ</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={a}
        onChange={(e) => onChange(normalizeMinMax(Number(e.target.value), b))}
        className="w-full accent-green-600"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={b}
        onChange={(e) => onChange(normalizeMinMax(a, Number(e.target.value)))}
        className="w-full accent-green-600 -mt-2"
      />
    </div>
  );
}

function RoomCard({ data, liked, onLike }: { data: Apartment; liked: boolean; onLike: () => void }) {
  const price = toVnd(data.rentPrice);
  const ward = data.addressPath;
  const img = data.coverImageUrl || `https://picsum.photos/seed/apm-${data.id}/800/480`;
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-green-200 shadow-sm hover:shadow-md transition">
      <div className="relative">
        <img src={process.env.NEXT_PUBLIC_API_URL + img} alt={data.title} className="w-full h-48 object-cover" />
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
        <h3 className="font-bold text-green-900 group-hover:underline leading-snug line-clamp-2">{data.title}</h3>
        <div className="mt-1 text-red-600 font-semibold">Từ {price} / tháng</div>
        <div className="mt-1 text-sm text-gray-600">{ward}</div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1"><BedDouble className="w-4 h-4 text-green-700" /> {data.bedrooms ?? 0} giường</span>
          <span className="inline-flex items-center gap-1"><Bath className="w-4 h-4 text-green-700" /> {data.bathrooms ?? 0} WC</span>
          <span className="inline-flex items-center gap-1"><Ruler className="w-4 h-4 text-green-700" /> {data.areaM2 ?? 0} m²</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:opacity-95">Xem chi tiết</button>
          <button className="px-4 py-2 rounded-xl border border-green-200 text-green-800 hover:bg-green-50">Liên hệ</button>
        </div>
      </div>
    </article>
  );
}

function normalizeMinMax(a: number, b: number): [number, number] {
  return a > b ? [b, a] : [a, b];
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
