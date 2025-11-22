// components/SearchBar.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Bed } from "lucide-react";
import clsx from "clsx";
import type { Route } from "next";
import { toSlug } from "@/utils/formatSlug";

type Mode = 'phong' | 'nha' | 'mat-bang';

type Props = {
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  defaultGuests?: number;
  defaultBeds?: number;
  defaultOccupants?: number;
  mode?: Mode; // điều khiển các lựa chọn hiển thị trong ô search
  onSearch?: (q: string, opts?: { guests?: number; beds?: number; occupants?: number; type?: string; priceMin?: number; priceMax?: number; areaMin?: number; areaMax?: number; mode?: Mode; locationSlug?: string; locationName?: string }) => void;      // mở rộng
  onOpenLocation?: () => void;         // ✅ thêm
};

export default function SearchBar({
  placeholder = "Tìm nhà, phòng trọ, căn hộ dịch vụ…",
  defaultValue = "",
  className,
  onSearch,
  onOpenLocation,
  defaultGuests,
  defaultBeds,
  defaultOccupants,
  mode,
}: Props) {
  const [q, setQ] = useState(defaultValue);
  const [guests, setGuests] = useState<string>(defaultGuests !== undefined ? String(defaultGuests) : "");
  const [beds, setBeds] = useState<string>(defaultBeds !== undefined ? String(defaultBeds) : "");
  const [occupants, setOccupants] = useState<string>(defaultOccupants !== undefined ? String(defaultOccupants) : "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  // New dynamic filters
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [pricePickerOpen, setPricePickerOpen] = useState(false);
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  // Unified filter panel (combine all choices into one button)
  const [allPickerOpen, setAllPickerOpen] = useState(false);
  const allPickerRef = useRef<HTMLDivElement | null>(null);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
  const [areaMin, setAreaMin] = useState<number | undefined>(undefined);
  const [areaMax, setAreaMax] = useState<number | undefined>(undefined);
  const [locationName, setLocationName] = useState<string | undefined>(undefined);
  const [locationSlug, setLocationSlug] = useState<string | undefined>(undefined);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = q.trim();
    const g = guests ? Number(guests) : undefined;
    const b = beds ? Number(beds) : undefined;
    const occ = occupants ? Number(occupants) : undefined;
  if (onSearch) onSearch(value, { guests: g, beds: b, occupants: occ, type: selectedType, priceMin, priceMax, areaMin, areaMax, mode, locationSlug, locationName });
    else {
      const qs = new URLSearchParams();
      qs.set("q", value);
      if (g !== undefined) qs.set("guests", String(g));
      if (b !== undefined) qs.set("beds", String(b));
      if (occ !== undefined) qs.set("occupants", String(occ));
      if (selectedType) qs.set("type", selectedType);
      if (priceMin !== undefined) qs.set("minPrice", String(priceMin));
      if (priceMax !== undefined) qs.set("maxPrice", String(priceMax));
      if (areaMin !== undefined) qs.set("minArea", String(areaMin));
      if (areaMax !== undefined) qs.set("maxArea", String(areaMax));
      if (locationSlug) qs.set("locationSlug", locationSlug);
      router.push(`/search?${qs.toString()}` as Route);
    }
  }

  // close picker when clicking outside
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (pickerOpen && pickerRef.current && !pickerRef.current.contains(t)) setPickerOpen(false);
      if (allPickerOpen && allPickerRef.current && !allPickerRef.current.contains(t)) setAllPickerOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [pickerOpen, allPickerOpen]);

  // sync when parent updates defaults (e.g., URL params changed)
  useEffect(() => {
    setQ(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    setGuests(defaultGuests !== undefined ? String(defaultGuests) : "");
  }, [defaultGuests]);

  useEffect(() => {
    setOccupants(defaultOccupants !== undefined ? String(defaultOccupants) : "");
  }, [defaultOccupants]);

  useEffect(() => {
    setBeds(defaultBeds !== undefined ? String(defaultBeds) : "");
  }, [defaultBeds]);

  // Reset defaults when mode changes
  useEffect(() => {
    // close popovers
    setTypePickerOpen(false);
    setPricePickerOpen(false);
    setAreaPickerOpen(false);
    setLocationPickerOpen(false);
    setAllPickerOpen(false);
    // reset values based on mode
    if (mode === 'phong') {
      setSelectedType('Studio');
      setPriceMin(undefined);
      setPriceMax(undefined);
      setAreaMin(undefined);
      setAreaMax(undefined);
      // keep location; user chooses per session
    } else if (mode === 'nha') {
      setSelectedType(undefined); // chờ user chọn trong danh sách
      setPriceMin(undefined);
      setPriceMax(undefined);
      setAreaMin(undefined);
      setAreaMax(undefined);
    } else if (mode === 'mat-bang') {
      setSelectedType(undefined);
      setPriceMin(undefined);
      setPriceMax(undefined);
      setAreaMin(undefined);
      setAreaMax(undefined);
    }
  }, [mode]);

  return (
    <form onSubmit={submit} className={clsx("w-full", className)}>
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#006633] to-[#4CAF50]">
          <Search className="h-5 w-5 text-white" />
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
        />
        {/* Khu vực / Bộ lọc: on homepage we surface a single 'Bộ lọc' button and move Khách/Ngủ into the filter panel */}
        {/* Compact filter summary button: shows active filters or 'Bộ lọc' and opens panel */}
        <div className="hidden xs:block">
          <button
            type="button"
            onClick={() => setAllPickerOpen((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium"
            style={{ borderColor: '#e6f4ea', background: 'white' }}
            aria-haspopup="dialog"
            aria-expanded={allPickerOpen}
          >
            <span className="text-slate-700">
              {(() => {
                const parts: string[] = [];
                if (locationName) parts.push(locationName as string);
                if (selectedType) parts.push(selectedType);
                if (guests) parts.push(`${guests} phòng khách`);
                if (beds !== "") parts.push(`${beds} phòng ngủ`);
                if (occupants) parts.push(`${occupants} người ở`);
                if (priceMin != null || priceMax != null) {
                  const pmin = priceMin != null ? `${priceMin}` : '';
                  const pmax = priceMax != null ? `${priceMax}` : '';
                  parts.push(`Giá ${pmin}${pmin && pmax ? '–' : ''}${pmax}`);
                }
                return parts.length ? parts.join(' • ') : 'Bộ lọc';
              })()}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 transform ${allPickerOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {/* Unified Filters Button (combine all choices into one) */}
        {mode && (
          <div className="relative" ref={allPickerRef}>
            <button
              type="button"
              onClick={() => setAllPickerOpen(v => !v)}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-white hover:shadow-sm transition cursor-pointer"
              style={{ borderColor: '#006633' }}
            >
              <span className="text-sm text-slate-700">Bộ lọc</span>
            </button>
            {allPickerOpen && (
              <div className="absolute right-0 mt-2 w-[520px] max-w-[92vw] bg-white rounded-2xl shadow-2xl p-4 z-50 border border-emerald-100">
                {/* Khu vực */}
                <div className="mb-4">
                  <div className="text-xs text-slate-500 mb-2">Khu vực</div>
                  <input
                    type="text"
                    placeholder="Nhập tên quận (VD: Cầu Giấy)"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={locationName ?? ''}
                    onChange={(e)=> { setLocationName(e.target.value); setLocationSlug(e.target.value ? toSlug(e.target.value) : undefined); }}
                  />
                  <div className="text-xs text-slate-500 mt-2 mb-1">Gợi ý</div>
                  <div className="flex flex-wrap gap-2">
                    {["Ba Đình","Cầu Giấy","Đống Đa","Hai Bà Trưng","Hoàn Kiếm","Thanh Xuân","Nam Từ Liêm","Bắc Từ Liêm","Hà Đông"].map(n => (
                      <button key={n} type="button" onClick={()=> { setLocationName(n); setLocationSlug(toSlug(n)); }} className="px-2 py-1 text-xs rounded-full border border-emerald-200 hover:bg-emerald-50 text-emerald-800">{n}</button>
                    ))}
                  </div>
                </div>
                {/* Loại hình */}
                {(mode === 'phong' || mode === 'nha') && (
                  <div className="mb-4">
                    <div className="text-xs text-slate-500 mb-2">Loại hình</div>
                    <div className="flex flex-wrap gap-2">
                      {(mode === 'phong' ? ['Studio'] : ['Nhà phố', 'Nhà nguyên căn', 'Chung cư', 'Nhà tập thể']).map(opt => (
                        <button key={opt} type="button" onClick={() => setSelectedType(opt)} className={clsx("px-3 py-1.5 rounded-full border text-sm", selectedType===opt ? "bg-emerald-600 text-white border-emerald-600" : "border-emerald-200 hover:bg-emerald-50 text-emerald-800")}>{opt}</button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Giá tiền */}
                {(mode === 'phong' || mode === 'nha') && (
                  <div className="mb-4">
                    <div className="text-xs text-slate-500 mb-2">Khoảng giá (VND/tháng)</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder="Tối thiểu" className="rounded-lg border px-3 py-2 text-sm" value={priceMin ?? ''} onChange={(e)=> setPriceMin(e.target.value === '' ? undefined : Number(e.target.value))} />
                      <input type="number" placeholder="Tối đa" className="rounded-lg border px-3 py-2 text-sm" value={priceMax ?? ''} onChange={(e)=> setPriceMax(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </div>
                  </div>
                )}
                {/* Diện tích */}
                {mode === 'mat-bang' && (
                  <div className="mb-4">
                    <div className="text-xs text-slate-500 mb-2">Khoảng diện tích (m²)</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder="Tối thiểu" className="rounded-lg border px-3 py-2 text-sm" value={areaMin ?? ''} onChange={(e)=> setAreaMin(e.target.value === '' ? undefined : Number(e.target.value))} />
                      <input type="number" placeholder="Tối đa" className="rounded-lg border px-3 py-2 text-sm" value={areaMax ?? ''} onChange={(e)=> setAreaMax(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </div>
                  </div>
                )}
                {/* Guests/Beds: always visible in the filter panel and styled compactly */}
                <div className="mb-4 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-2">Phòng khách</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGuests((g) => String(Math.max(0, Number(g || 0) - 1)))}
                        className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-[#ecf9ef]"
                        style={{ borderColor: '#e6f4ea', color: '#006633' }}
                        aria-label="Giảm khách"
                      >
                        −
                      </button>
                      <input type="number" min={0} max={12} className="flex-1 rounded-lg border px-3 py-2 text-sm" value={guests} onChange={(e)=> setGuests(e.target.value)} />
                      <button
                        type="button"
                        onClick={() => setGuests((g) => String(Math.min(12, Number(g || 0) + 1)))}
                        className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-[#ecf9ef]"
                        style={{ borderColor: '#e6f4ea', color: '#006633' }}
                        aria-label="Tăng khách"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-2">Phòng ngủ</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBeds((b) => String(Math.max(0, Number(b || 0) - 1)))}
                        className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-[#ecf9ef]"
                        style={{ borderColor: '#e6f4ea', color: '#006633' }}
                        aria-label="Giảm ngủ"
                      >
                        −
                      </button>
                      <input type="number" min={0} max={6} className="flex-1 rounded-lg border px-3 py-2 text-sm" value={beds} onChange={(e)=> setBeds(e.target.value)} />
                      <button
                        type="button"
                        onClick={() => setBeds((b) => String(Math.min(6, Number(b || 0) + 1)))}
                        className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-[#ecf9ef]"
                        style={{ borderColor: '#e6f4ea', color: '#006633' }}
                        aria-label="Tăng ngủ"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-slate-500 mb-2">Số người ở</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOccupants((o) => String(Math.max(0, Number(o || 0) - 1)))}
                      className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-[#ecf9ef]"
                      style={{ borderColor: '#e6f4ea', color: '#006633' }}
                      aria-label="Giảm số người ở"
                    >
                      −
                    </button>
                    <input type="number" min={0} max={20} className="flex-1 rounded-lg border px-3 py-2 text-sm" value={occupants} onChange={(e)=> setOccupants(e.target.value)} />
                    <button
                      type="button"
                      onClick={() => setOccupants((o) => String(Math.min(20, Number(o || 0) + 1)))}
                      className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-[#ecf9ef]"
                      style={{ borderColor: '#e6f4ea', color: '#006633' }}
                      aria-label="Tăng số người ở"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => { setSelectedType(undefined); setPriceMin(undefined); setPriceMax(undefined); setAreaMin(undefined); setAreaMax(undefined); setLocationName(undefined); setLocationSlug(undefined); }} className="px-4 py-2 text-sm rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50">Xoá</button>
                  <button type="button" onClick={() => setAllPickerOpen(false)} className="px-4 py-2 text-sm rounded-full bg-gradient-to-r from-[#006633] to-[#4CAF50] text-white">Áp dụng</button>
                </div>
              </div>
            )}
          </div>
        )}
        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-emerald-600 text-white px-5 py-2 text-sm font-semibold hover:bg-emerald-700 cursor-pointer"
        >
          Tìm kiếm
        </button>
      </div>
    </form>
  );
}
