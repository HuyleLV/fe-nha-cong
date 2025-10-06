"use client";

import { useMemo, useState } from "react";
import {
  MapPinned,
  ChevronDown,
  ChevronRight,
  BadgePercent,
  Flame,
  Heart,
  BedDouble,
  Bath,
  Ruler,
  Star,
  FilterX,
  Map as MapIcon,
  List
} from "lucide-react";
import SearchBar from "@/components/searchBar";

// --------- Helpers ---------
const cx = (...arr: (string | false | undefined)[]) => arr.filter(Boolean).join(" ");

// Fake data
const ROOMS = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  title:
    i % 3 === 0
      ? "CCMN khu Thanh Xuân – Full nội thất – Ở ngay"
      : i % 3 === 1
      ? "Phòng full đồ, thoáng mát tại P. Mai Dịch"
      : "Trọ Lê Quý Đôn siêu đẹp, tiện ích khu cao cấp",
  price: [5200000, 6200000, 7000000, 6800000, 5900000][i % 5],
  district: ["Cầu Giấy", "Thanh Xuân", "Hai Bà Trưng", "Hoàng Mai"][i % 4],
  ward: ["Mai Dịch", "Nhân Chính", "Bạch Đằng", "Đại Kim"][i % 4],
  city: "Hà Nội",
  photos: `https://picsum.photos/seed/room-${i + 10}/800/480`,
  available: [0, 1, 2, 5][i % 4],
  size: [18, 22, 28, 35][i % 4],
  beds: [1, 1, 1, 2][i % 4],
  baths: [1, 1, 1, 1][i % 4],
  rating: [4.6, 4.8, 4.5, 4.7][i % 4],
  hot: i % 2 === 0,
}));

// --------- Root Page Component (default export) ---------
export default function TimPhongQuanhDayPage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [sort, setSort] = useState("best");
  const [liked, setLiked] = useState<number[]>([]);

  // Filters state
  const [areas, setAreas] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [price, setPrice] = useState<[number, number]>([2000000, 8000000]);
  const [onlyHot, setOnlyHot] = useState(false);

  const results = useMemo(() => {
    let list = ROOMS.filter(r =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.district.toLowerCase().includes(query.toLowerCase()) ||
      r.ward.toLowerCase().includes(query.toLowerCase())
    );
    if (areas.length) list = list.filter(r => areas.includes(r.district));
    if (onlyHot) list = list.filter(r => r.hot);
    list = list.filter(r => r.price >= price[0] && r.price <= price[1]);

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "newest") list = [...list].reverse();
    return list;
  }, [query, areas, price, onlyHot, sort]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="max-w-7xl mx-auto mt-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <MapPinned/>
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
                  setAreas([]); setTypes([]); setAmenities([]); setOnlyHot(false); setPrice([2000000, 8000000]);
                }}
                className="text-sm inline-flex items-center gap-1 text-green-700 hover:text-green-900"
              >
                <FilterX className="w-4 h-4"/> Đặt lại
              </button>
            </div>

            <Accordion title="Khu vực">
              <CheckGroup
                options={["Cầu Giấy", "Thanh Xuân", "Hai Bà Trưng", "Hoàng Mai"]}
                values={areas}
                onChange={setAreas}
              />
            </Accordion>

            <Accordion title="Giá (VND/tháng)">
              <PriceRange value={price} onChange={setPrice} min={1000000} max={12000000} step={500000} />
            </Accordion>

            <Accordion title="Loại phòng">
              <CheckGroup
                options={["Chung cư mini", "Phòng trọ", "Studio", "Căn hộ 1PN"]}
                values={types}
                onChange={setTypes}
              />
            </Accordion>

            <Accordion title="Tiện nghi">
              <CheckGroup
                options={["Thang máy", "Chỗ để xe", "Bếp riêng", "Ban công", "Máy giặt"]}
                values={amenities}
                onChange={setAmenities}
              />
            </Accordion>

            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={onlyHot} onChange={e=>setOnlyHot(e.target.checked)} className="accent-green-600" />
                <span className="inline-flex items-center gap-1">Ưu tiên <Flame className="w-4 h-4 text-orange-500"/> Giá tốt</span>
              </label>
              <button className="bg-gradient-to-r from-[#006633] to-[#4CAF50] text-white px-4 py-2 rounded-xl font-semibold shadow hover:opacity-95">Áp dụng</button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="md:col-span-3">
            <SearchBar />
            
            <Toolbar
                sort={sort}
                setSort={setSort}
                view={view}
                setView={setView}
                count={results.length}
            />

          {view === "list" ? (
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
            <div className="rounded-2xl border border-green-200 bg-white h-[600px] grid place-items-center text-sm text-gray-600">
              <div className="text-center">
                <MapIcon className="mx-auto mb-2 text-green-700"/>
                Chế độ bản đồ demo (nhúng Mapbox/Google Maps ở đây)
              </div>
            </div>
          )}

          <Pagination />
        </main>
      </div>
    </div>
  );
}

// --------- UI Pieces ---------
function Toolbar({ sort, setSort, view, setView, count }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 mt-10">
      <div className="text-sm text-gray-600">Tìm thấy <b className="text-green-800">{count}</b> phòng phù hợp</div>
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
            onClick={()=>setView("list")}
            className={cx("px-3 py-2 text-sm flex items-center gap-1", view==='list' ? "bg-green-600 text-white" : "bg-white text-green-700 hover:bg-green-50")}
          >
            <List className="w-4 h-4"/> Danh sách
          </button>
          <button
            onClick={()=>setView("map")}
            className={cx("px-3 py-2 text-sm flex items-center gap-1", view==='map' ? "bg-green-600 text-white" : "bg-white text-green-700 hover:bg-green-50")}
          >
            <MapIcon className="w-4 h-4"/> Bản đồ
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
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between text-left">
        <span className="font-semibold text-green-900">{title}</span>
        <ChevronRight className={cx("w-4 h-4 transition", open && "rotate-90")} />
      </button>
      <div className={cx("overflow-hidden transition-all", open ? "mt-2" : "h-0")}>{open && children}</div>
    </div>
  );
}

function CheckGroup({ options, values, onChange }: { options: string[]; values: string[]; onChange: (v: string[]) => void; }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const checked = values.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onChange(checked ? values.filter(v=>v!==opt) : [...values, opt])}
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

function PriceRange({ value, onChange, min, max, step }: { value: [number, number]; onChange: (v: [number, number]) => void; min: number; max: number; step: number; }) {
  const [a, b] = value;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span>{a.toLocaleString()} đ</span>
        <span>—</span>
        <span>{b.toLocaleString()} đ</span>
      </div>
      {/* simple dual range (stacked) for demo */}
      <input type="range" min={min} max={max} step={step} value={a} onChange={(e)=>onChange([Number(e.target.value), b])} className="w-full accent-green-600" />
      <input type="range" min={min} max={max} step={step} value={b} onChange={(e)=>onChange([a, Number(e.target.value)])} className="w-full accent-green-600 -mt-2" />
    </div>
  );
}

function RoomCard({ data, liked, onLike }: { data: any; liked: boolean; onLike: ()=>void; }) {
  const price = data.price.toLocaleString();
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-green-200 shadow-sm hover:shadow-md transition">
      <div className="relative">
        <img src={data.photos} alt={data.title} className="w-full h-48 object-cover" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {data.hot && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/90 text-orange-600 px-2 py-1 rounded-full border border-orange-200 shadow-sm">
              <Flame className="w-3 h-3"/> Giá tốt
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/90 text-green-700 px-2 py-1 rounded-full border border-green-200 shadow-sm">
            <BadgePercent className="w-3 h-3"/> Ưu đãi
          </span>
        </div>
        <button onClick={onLike} className="absolute top-3 right-3 p-2 rounded-full bg-white/90 border border-green-200 text-green-700 hover:bg-green-50">
          {liked ? <Heart className="w-4 h-4 fill-current"/> : <Heart className="w-4 h-4"/>}
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-green-900 group-hover:underline leading-snug line-clamp-2">
          {data.title}
        </h3>
        <div className="mt-1 text-red-600 font-semibold">Từ {price} / tháng</div>
        <div className="mt-1 text-sm text-gray-600">
          {`Phường ${data.ward}, Quận ${data.district}, ${data.city}`}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1"><BedDouble className="w-4 h-4 text-green-700"/> {data.beds} giường</span>
          <span className="inline-flex items-center gap-1"><Bath className="w-4 h-4 text-green-700"/> {data.baths} WC</span>
          <span className="inline-flex items-center gap-1"><Ruler className="w-4 h-4 text-green-700"/> {data.size} m²</span>
          <span className="inline-flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500"/> {data.rating}</span>
          <span className="inline-flex items-center gap-1 text-gray-500">Còn trống: {data.available} phòng</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:opacity-95">Xem chi tiết</button>
          <button className="px-4 py-2 rounded-xl border border-green-200 text-green-800 hover:bg-green-50">Liên hệ</button>
        </div>
      </div>
    </article>
  );
}

function Pagination() {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          className={cx(
            "w-10 h-10 rounded-xl border text-sm font-semibold",
            i === 0 ? "bg-green-600 text-white border-green-600" : "bg-white border-green-200 text-green-800 hover:bg-green-50"
          )}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}