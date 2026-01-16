"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  MapPinned, ChevronDown, ChevronRight, Flame,
  FilterX, Map as MapIcon, List, RotateCcw, X
} from "lucide-react";
import SearchBar from "@/components/searchBar";
import { Apartment, ApartmentStatus } from "@/type/apartment";
import { apartmentService } from "@/services/apartmentService";
import Pagination from "@/components/Pagination";
import { toSlug } from "@/utils/formatSlug";
import LocationLookup from "@/app/admin/components/locationLookup";
import { locationService } from "@/services/locationService";
import type { Location } from "@/type/location";
import RoomCardItem from "@/components/roomCardItem";
import LazyMap from "@/components/map/LazyMap";
import MapRoomItem from "@/components/map/MapRoomItem";
import { MapApartment } from "@/services/mapService";

// ================ Helpers =================
const cx = (...arr: (string | false | undefined)[]) => arr.filter(Boolean).join(" ");
const toVnd = (n?: number | string) => {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  return (Number.isFinite(v) ? v : 0).toLocaleString("vi-VN");
};
const LIMIT = 16;

// ================ Root Page =================
export default function TimPhongQuanhDayPage() {
  // View / sort
  const [view, setView] = useState<"list" | "map">("list");
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc" | "area_desc">("newest");
  // modal state for mobile filter popup
  const [showFilter, setShowFilter] = useState(false);

  // search
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();

  // Filters ↔ QueryApartmentDto
  const [locationSlug, setLocationSlug] = useState<string | undefined>(undefined);
  const [locationId, setLocationId] = useState<number | undefined>(undefined); // resolved from slug (fallback)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [status, setStatus] = useState<ApartmentStatus | undefined>("published");
  const [minPrice, setMinPrice] = useState<string>("0");
  const [maxPrice, setMaxPrice] = useState<string>("8000000");
  const [minArea, setMinArea] = useState<string>("0");
  const [maxArea, setMaxArea] = useState<string>("100");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [bathrooms, setBathrooms] = useState<string>("");
  const [livingRooms, setLivingRooms] = useState<string>("");
  const [guests, setGuests] = useState<string>("");

  // Amenities (boolean)
  const [hasPrivateBathroom, setHasPrivateBathroom] = useState(false);
  const [hasMezzanine, setHasMezzanine] = useState(false);
  const [noOwnerLiving, setNoOwnerLiving] = useState(false);
  const [hasAirConditioner, setHasAirConditioner] = useState(false);
  const [hasWaterHeater, setHasWaterHeater] = useState(false);
  const [hasWashingMachine, setHasWashingMachine] = useState(false);
  const [hasWardrobe, setHasWardrobe] = useState(false);
  const [flexibleHours, setFlexibleHours] = useState(false);
  const [hasSharedBathroom, setHasSharedBathroom] = useState(false);
  const [hasWashingMachineShared, setHasWashingMachineShared] = useState(false);
  const [hasWashingMachinePrivate, setHasWashingMachinePrivate] = useState(false);
  const [hasDesk, setHasDesk] = useState(false);
  const [hasKitchenTable, setHasKitchenTable] = useState(false);
  const [hasKitchenCabinet, setHasKitchenCabinet] = useState(false);
  const [hasRangeHood, setHasRangeHood] = useState(false);
  const [hasFridge, setHasFridge] = useState(false);
  // New amenities (2025-11)
  const [hasElevator, setHasElevator] = useState(false);
  const [allowPet, setAllowPet] = useState(false);
  const [allowElectricVehicle, setAllowElectricVehicle] = useState(false);

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
    locationId: locationId || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minArea: minArea ? Number(minArea) : undefined,
    maxArea: maxArea ? Number(maxArea) : undefined,
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
    livingRooms: livingRooms ? Number(livingRooms) : undefined,
    guests: guests ? Number(guests) : undefined,
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
    hasSharedBathroom: hasSharedBathroom || undefined,
    hasWashingMachineShared: hasWashingMachineShared || undefined,
    hasWashingMachinePrivate: hasWashingMachinePrivate || undefined,
    hasDesk: hasDesk || undefined,
    hasKitchenTable: hasKitchenTable || undefined,
    hasKitchenCabinet: hasKitchenCabinet || undefined,
    hasRangeHood: hasRangeHood || undefined,
    hasFridge: hasFridge || undefined,
    hasElevator: hasElevator || undefined,
    allowPet: allowPet || undefined,
    allowElectricVehicle: allowElectricVehicle || undefined,
    hasWardrobe: hasWardrobe || undefined,
    flexibleHours: flexibleHours || undefined,
    page,
    limit: LIMIT,
  });

  // Sync URL query params into state so direct navigation with ?q=... works
  useEffect(() => {
    try {
      const q = searchParams?.get("q") ?? "";
      const g = searchParams?.get("guests") ?? "";
      const b = searchParams?.get("beds") ?? searchParams?.get("bedrooms") ?? "";
      const lr = searchParams?.get("livingRooms") ?? searchParams?.get("living_rooms") ?? "";
      const locSlug = searchParams?.get("locationSlug") ?? ""; // khu vực
      setQuery(q);
      setGuests(g);
      setBedrooms(b);
      setLivingRooms(lr);
      // chỉ set locationSlug nếu param có giá trị (giữ lựa chọn người dùng sau đó)
      if (locSlug) setLocationSlug(locSlug);

      // booleans (stored as 'true'/'false')
      const readBool = (k: string) => {
        const v = searchParams?.get(k);
        return v === 'true';
      };
      setHasPrivateBathroom(readBool('hasPrivateBathroom'));
      setHasSharedBathroom(readBool('hasSharedBathroom'));
      setHasMezzanine(readBool('hasMezzanine'));
      setNoOwnerLiving(readBool('noOwnerLiving'));
      setHasAirConditioner(readBool('hasAirConditioner'));
      setHasWaterHeater(readBool('hasWaterHeater'));
      setHasWashingMachine(readBool('hasWashingMachine'));
      setHasWashingMachineShared(readBool('hasWashingMachineShared'));
      setHasWashingMachinePrivate(readBool('hasWashingMachinePrivate'));
      setHasWardrobe(readBool('hasWardrobe'));
      setHasDesk(readBool('hasDesk'));
      setHasKitchenTable(readBool('hasKitchenTable'));
      setHasKitchenCabinet(readBool('hasKitchenCabinet'));
      setHasRangeHood(readBool('hasRangeHood'));
      setHasFridge(readBool('hasFridge'));
      setHasElevator(readBool('hasElevator'));
      setAllowPet(readBool('allowPet'));
      setAllowElectricVehicle(readBool('allowElectricVehicle'));

      // reset page to 1 when params change
      setPage(1);
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

  // Resolve locationSlug -> locationId & selectedLocation chỉ bằng API /api/locations (không gọi endpoint by-slug)
  useEffect(() => {
    if (!locationSlug) { setLocationId(undefined); return; }
    // Nếu locationSlug là số => dùng trực tiếp
    if (/^\d+$/.test(locationSlug)) { setLocationId(Number(locationSlug)); setSelectedLocation(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const { items } = await locationService.getAll({ page: 1, limit: 20 });
        const found = items.find((l: any) => l.slug === locationSlug);
        if (!cancelled) {
          setLocationId(found?.id);
          if (found) setSelectedLocation(found as Location);
        }
      } catch (e) {
        if (!cancelled) { setLocationId(undefined); setSelectedLocation(null); }
      }
    })();
    return () => { cancelled = true; };
  }, [locationSlug]);

  // close modal on Escape
  useEffect(() => {
    if (!showFilter) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowFilter(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showFilter]);

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
    query, locationSlug, locationId, minPrice, maxPrice, minArea, maxArea,
    bedrooms, bathrooms, livingRooms, guests, status, sort,
    hasPrivateBathroom, hasSharedBathroom, hasMezzanine, noOwnerLiving, hasAirConditioner,
    hasWaterHeater, hasWashingMachine, hasWashingMachineShared, hasWashingMachinePrivate, hasWardrobe, hasDesk, hasKitchenTable, hasKitchenCabinet, hasRangeHood, hasFridge,
    flexibleHours, hasElevator, allowPet, allowElectricVehicle, page
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
    setSelectedLocation(null);
    setStatus("published");
    setMinPrice("0");
    setMaxPrice("12000000");
    setMinArea("0");
    setMaxArea("100");
    setBedrooms("");
    setLivingRooms("");
    setGuests("");
    setBathrooms("");
    setHasPrivateBathroom(false);
    setHasSharedBathroom(false);
    setHasMezzanine(false);
    setNoOwnerLiving(false);
    setHasAirConditioner(false);
    setHasWaterHeater(false);
    setHasWashingMachine(false);
    setHasWashingMachineShared(false);
    setHasWashingMachinePrivate(false);
    setHasWardrobe(false);
    setHasDesk(false);
    setHasKitchenTable(false);
    setHasKitchenCabinet(false);
    setHasRangeHood(false);
    setHasFridge(false);
    setHasElevator(false);
    setAllowPet(false);
    setAllowElectricVehicle(false);
    setFlexibleHours(false);
    setOnlyHot(false);
    setSort("newest");
    setPage(1);
  };

  // Map interaction
  const mapRef = useRef<any>(null); // PropertyMapHandle
  const [mapItems, setMapItems] = useState<MapApartment[]>([]); // Items visible on map
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Filter Area */}
      <div className="bg-white border-b sticky top-0 z-[40]">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MapPinned className="text-emerald-600 w-6 h-6" />
              <h1 className="font-bold text-xl text-slate-800">Tìm phòng quanh đây</h1>
            </div>

            <div className="flex-1 max-w-2xl mx-auto w-full flex gap-2">
              <button
                type="button"
                onClick={() => setShowFilter(true)}
                className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium"
              >
                <FilterX className="w-4 h-4" />
                <span className="hidden sm:inline">Bộ lọc</span>
              </button>
              <div className="flex-1">
                <SearchBar
                  className="w-full"
                  segmented
                  defaultValue={query}
                  defaultGuests={guests ? Number(guests) : undefined}
                  defaultBeds={bedrooms ? Number(bedrooms) : undefined}
                  onSearch={(q: string, opts) => {
                    setQuery(q);
                    if (opts?.guests !== undefined) setGuests(String(opts.guests));
                    if (opts?.beds !== undefined) setBedrooms(String(opts.beds));
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {/* View Switcher */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 shrink-0">
              <button
                onClick={() => setView("list")}
                className={cx(
                  "px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1.5 transition-all",
                  view === "list" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <List className="w-4 h-4" /> List
              </button>
              <button
                onClick={() => setView("map")}
                className={cx(
                  "px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1.5 transition-all",
                  view === "map" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <MapIcon className="w-4 h-4" /> Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFilter(false)} />
          <div className="relative w-full max-w-2xl mx-auto h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-slate-800">Bộ lọc tìm kiếm</h2>
              <button onClick={() => setShowFilter(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              <div className="space-y-6">
                <Accordion title="Khu vực & Địa điểm">
                  <LocationLookup
                    value={selectedLocation}
                    onChange={async (loc: any) => {
                      const slug = loc?.slug || (loc?.name ? toSlug(loc.name) : undefined);
                      setSelectedLocation(loc ?? null);
                      setLocationSlug(slug);
                      setPage(1);
                    }}
                    placeholder="Tìm kiếm khu vực..."
                    levels={["District"] as any}
                    limit={100}
                  />
                  {locationSlug && (
                    <div className="mt-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 inline-block">
                      📍 {selectedLocation?.name || locationSlug}
                    </div>
                  )}
                </Accordion>

                <div className="h-px bg-slate-100" />

                <Accordion title="Khoảng giá (VND/tháng)">
                  <div className="space-y-4">
                    <DualRange
                      min={0}
                      max={15_000_000}
                      step={100_000}
                      valueMin={Number(minPrice || 0)}
                      valueMax={Number(maxPrice || 15_000_000)}
                      onChange={(minV, maxV) => {
                        setMinPrice(String(minV));
                        setMaxPrice(String(maxV));
                        setPage(1);
                      }}
                      format={(v) => `${toVnd(v)}`}
                    />
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "< 3tr", v: [0, 3_000_000] },
                        { label: "3 - 5tr", v: [3_000_000, 5_000_000] },
                        { label: "5 - 8tr", v: [5_000_000, 8_000_000] },
                        { label: "8 - 12tr", v: [8_000_000, 12_000_000] },
                        { label: "> 12tr", v: [12_000_000, 30_000_000] },
                      ].map((p) => (
                        <button
                          key={p.label}
                          onClick={() => { setMinPrice(String(p.v[0])); setMaxPrice(String(p.v[1])); setPage(1); }}
                          className="px-3 py-1.5 rounded-full border text-xs font-medium transition hover:border-emerald-500 hover:text-emerald-600"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </Accordion>

                <div className="h-px bg-slate-100" />

                <Accordion title="Thông tin phòng">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-slate-700">Diện tích (m²)</label>
                      <DualRange
                        min={0}
                        max={100}
                        step={5}
                        valueMin={Number(minArea || 0)}
                        valueMax={Number(maxArea || 100)}
                        onChange={(minV, maxV) => {
                          setMinArea(String(minV));
                          setMaxArea(String(maxV));
                          setPage(1);
                        }}
                        format={(v) => `${v} m²`}
                      />
                    </div>
                    <div className="space-y-3">
                      <VerticalCounter label="Phòng ngủ" value={bedrooms} onChange={setBedrooms} max={5} />
                      <VerticalCounter label="Phòng khách" value={livingRooms} onChange={setLivingRooms} max={5} />
                      <VerticalCounter label="Vệ sinh (WC)" value={bathrooms} onChange={setBathrooms} max={3} />
                    </div>
                  </div>
                </Accordion>

                <div className="h-px bg-slate-100" />

                <Accordion title="Tiện nghi & Đặc điểm">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <ToggleChip active={hasPrivateBathroom} onToggle={() => { setHasPrivateBathroom(!hasPrivateBathroom); setPage(1); }}>🚿 KK.Khép kín</ToggleChip>
                    <ToggleChip active={hasAirConditioner} onToggle={() => { setHasAirConditioner(!hasAirConditioner); setPage(1); }}>❄️ Điều hoà</ToggleChip>
                    <ToggleChip active={hasWaterHeater} onToggle={() => { setHasWaterHeater(!hasWaterHeater); setPage(1); }}>🔥 Nóng lạnh</ToggleChip>
                    <ToggleChip active={hasMezzanine} onToggle={() => { setHasMezzanine(!hasMezzanine); setPage(1); }}>🏠 Gác xép</ToggleChip>
                    <ToggleChip active={hasFridge} onToggle={() => { setHasFridge(!hasFridge); setPage(1); }}>🧊 Tủ lạnh</ToggleChip>
                    <ToggleChip active={hasWashingMachine} onToggle={() => { setHasWashingMachine(!hasWashingMachine); setPage(1); }}>🧺 Máy giặt</ToggleChip>
                    <ToggleChip active={hasKitchenCabinet} onToggle={() => { setHasKitchenCabinet(!hasKitchenCabinet); setPage(1); }}>🍳 Tủ bếp</ToggleChip>
                    <ToggleChip active={hasElevator} onToggle={() => { setHasElevator(!hasElevator); setPage(1); }}>🛗 Thang máy</ToggleChip>
                    <ToggleChip active={noOwnerLiving} onToggle={() => { setNoOwnerLiving(!noOwnerLiving); setPage(1); }}>🗝️ Ko chung chủ</ToggleChip>
                    <ToggleChip active={allowPet} onToggle={() => { setAllowPet(!allowPet); setPage(1); }}>🐾  Nuôi thú cưng</ToggleChip>
                  </div>
                </Accordion>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
              <button
                onClick={clearAll}
                className="text-slate-600 hover:text-slate-900 font-medium text-sm px-4 py-2 hover:bg-slate-200 rounded-lg transition"
              >
                Xoá tất cả
              </button>
              <button
                onClick={() => { setPage(1); setShowFilter(false); }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-emerald-200 transition transform active:scale-95"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 max-w-screen-2xl w-full mx-auto">
        {view === "list" ? (
          // === LIST VIEW ===
          <div className="px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <div className="text-slate-600 text-sm">
                Tìm thấy <b className="text-emerald-700 text-lg">{total}</b> phòng phù hợp
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="appearance-none bg-white border border-slate-200 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                  <option value="area_desc">Diện tích rộng nhất</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : err ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl text-center">
                <p className="font-bold">Đã có lỗi xảy ra 😔</p>
                <p className="text-sm mt-1">{err}</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-xs underline">Thử lại</button>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {results.map((r) => (
                    <RoomCardItem key={r.id} item={r as any} />
                  ))}
                </div>
                <div className="mt-8">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onPrev={handlePrev}
                    onNext={handleNext}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-slate-700">Không tìm thấy phòng nào</h3>
                <p className="text-slate-500 text-sm mt-1">Hãy thử thay đổi bộ lọc hoặc tìm khu vực khác xem sao nhé.</p>
                <button onClick={clearAll} className="mt-4 text-emerald-600 font-semibold text-sm hover:underline">Xoá bộ lọc</button>
              </div>
            )}
          </div>
        ) : (
          // === MAP VIEW (SPLIT LAYOUT) ===
          <div className="flex h-[calc(100vh-80px)] overflow-hidden border-t">
            {/* Sidebar List */}
            <div className="w-[400px] shrink-0 bg-white border-r flex flex-col md:w-[360px] lg:w-[400px] absolute z-20 md:static h-full transform transition-transform duration-300 -translate-x-full md:translate-x-0 shadow-xl md:shadow-none">
              <div className="p-3 border-b bg-slate-50 flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Trong khu vực này ({mapItems.length})</span>
                <span className="hidden md:inline">Di chuyển bản đồ để tìm</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
                {mapItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-2xl mb-2">🗺️</p>
                    <p className="text-sm">Không có phòng nào trong vùng hiển thị.</p>
                    <p className="text-xs mt-1">Hãy thử thu nhỏ hoặc di chuyển bản đồ.</p>
                  </div>
                ) : (
                  mapItems.map((item) => (
                    // Require MapRoomItem component
                    <MapRoomItem
                      key={item.id}
                      item={item}
                      isActive={activeId === item.id}
                      onClick={() => {
                        setActiveId(item.id);
                        if (mapRef.current) {
                          mapRef.current.flyTo(item.lat, item.lng, 16);
                        }
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative bg-slate-100">
              <LazyMap
                ref={mapRef}
                onItemsChange={(items: MapApartment[]) => setMapItems(items)}
              />
              {/* Mobile Toggle Button for Sidebar could go here if needed */}
              <div className="absolute top-4 left-4 z-[1000] md:hidden">
                {/* Mobile sidebar toggle would be needed for full mobile support, skipping for now as per desktop-first focus */}
              </div>
            </div>
          </div>
        )}
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
      <div className={cx("transition-all", open ? "mt-2 overflow-visible" : "h-0 overflow-hidden")}>{open && children}</div>
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

function VerticalCounter({
  label,
  value,
  onChange,
  max = 10,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  max?: number;
}) {
  const val = value === "" ? 0 : Number(value || 0);
  return (
    <div className="w-full flex items-center justify-between p-3 bg-emerald-50/60 rounded-xl shadow-sm">
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Giảm ${label}`}
          onClick={() => onChange(String(Math.max(0, val - 1)))}
          className="w-9 h-9 rounded-full bg-white border border-emerald-100 shadow-sm flex items-center justify-center hover:bg-emerald-50 transition"
        >
          −
        </button>
        <div className="min-w-[36px] h-9 flex items-center justify-center text-lg font-semibold text-emerald-700 bg-white rounded-md px-2 shadow-sm">{val}</div>
        <button
          type="button"
          aria-label={`Tăng ${label}`}
          onClick={() => onChange(String(Math.min(max, val + 1)))}
          className="w-9 h-9 rounded-full bg-white border border-emerald-100 shadow-sm flex items-center justify-center hover:bg-emerald-50 transition"
        >
          +
        </button>
      </div>
    </div>
  );
}

// Removed custom RoomCard in favor of shared RoomCardItem component

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
