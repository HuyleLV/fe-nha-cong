// components/SearchBar.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from 'react-dom';
import { useRouter } from "next/navigation";
import { Search, User, Bed } from "lucide-react";
import clsx from "clsx";
import type { Route } from "next";
import { toSlug } from "@/utils/formatSlug";
import { fNumber, formatMoneyVND } from '@/utils/format-number';
import { toast } from 'react-toastify';
import { locationService } from '@/services/locationService';
import type { Location } from '@/type/location';

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
  segmented?: boolean; // render 3 equal segments like Airbnb
  compact?: boolean; // reduce internal padding / font-size for compact header search
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
  segmented,
  compact,
}: Props) {
  const [q, setQ] = useState(defaultValue);
  const [guests, setGuests] = useState<string>(defaultGuests !== undefined ? String(defaultGuests) : "1");
  const [beds, setBeds] = useState<string>(defaultBeds !== undefined ? String(defaultBeds) : "1");
  const [occupants, setOccupants] = useState<string>(defaultOccupants !== undefined ? String(defaultOccupants) : "1");
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const locationRef = useRef<any>(null);
  const priceRef = useRef<HTMLElement | null>(null);
  const roomsRef = useRef<any>(null);
  const [pricePos, setPricePos] = useState<{ top: number; left: number; width?: number } | null>(null);
  const [roomsPos, setRoomsPos] = useState<{ top: number; left: number; width?: number } | null>(null);
  const [locationPos, setLocationPos] = useState<{ top: number; left: number; width?: number } | null>(null);
  const locationPaneRef = useRef<HTMLDivElement | null>(null);
  const pricePaneRef = useRef<HTMLDivElement | null>(null);
  const roomsPaneRef = useRef<HTMLDivElement | null>(null);
  // New dynamic filters
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [pricePickerOpen, setPricePickerOpen] = useState(false);
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [roomsPickerOpen, setRoomsPickerOpen] = useState(false);
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
  const [province, setProvince] = useState<number | undefined>(undefined);
  const [city, setCity] = useState<number | undefined>(undefined);
  const [district, setDistrict] = useState<number | undefined>(undefined);
  const [nearby, setNearby] = useState<{ lat: number; lng: number } | null>(null);

  const [provincesList, setProvincesList] = useState<Location[]>([]);
  const [citiesList, setCitiesList] = useState<Location[]>([]);
  const [districtsList, setDistrictsList] = useState<Location[]>([]);
  const router = useRouter();
  const PRICE_SLIDER_MAX = 10000000;
  const PRICE_SLIDER_STEP = 500000;
  const formatVND = (v?: number) => {
    if (typeof v !== 'number') return '';
    let val = v;
    if (val > 0 && val < 10000) val = val * 1000;
    return formatMoneyVND(val, false);
  };

    const handleNearbyClick = () => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        toast.error('Trình duyệt không hỗ trợ định vị');
        return;
      }

      toast.info('Đang lấy vị trí của bạn...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setNearby({ lat, lng });
          setLocationName('Lân cận');
          setLocationSlug(`nearby:${lat.toFixed(6)}:${lng.toFixed(6)}`);
          setProvince(undefined);
          setCity(undefined);
          setDistrict(undefined);
          setLocationPickerOpen(false);
          toast.success('Đã lấy vị trí. Hiển thị kết quả lân cận.');
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) toast.error('Vui lòng cho phép quyền vị trí để sử dụng tính năng Lân cận');
          else toast.error('Không thể lấy vị trí. Vui lòng thử lại.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    // Fetch provinces when opening the location picker (lazy)
    useEffect(() => {
      let cancelled = false;
      async function loadProvinces() {
        try {
          const { items } = await locationService.getAll({ page: 1, limit: 200, level: 'Province' as any });
          if (!cancelled) setProvincesList(items || []);
        } catch (err) {
          // silent - keep fallback empty
        }
      }
      if (locationPickerOpen && provincesList.length === 0) loadProvinces();
      return () => { cancelled = true; };
    }, [locationPickerOpen]);

    // When province changes, load cities
    useEffect(() => {
      let cancelled = false;
      async function loadCities() {
        if (!province) {
          setCitiesList([]);
          return;
        }
        try {
          const { items } = await locationService.getAll({ page: 1, limit: 500, level: 'City' as any, parentId: province });
          if (!cancelled) setCitiesList(items || []);
        } catch (err) {
          setCitiesList([]);
        }
      }
      loadCities();
      return () => { cancelled = true; };
    }, [province]);

    // When city changes, load districts
    useEffect(() => {
      let cancelled = false;
      async function loadDistricts() {
        if (!city) {
          setDistrictsList([]);
          return;
        }
        try {
          const { items } = await locationService.getAll({ page: 1, limit: 1000, level: 'District' as any, parentId: city });
          if (!cancelled) setDistrictsList(items || []);
        } catch (err) {
          setDistrictsList([]);
        }
      }
      loadDistricts();
      return () => { cancelled = true; };
    }, [city]);

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
      if (nearby) {
        qs.set('nearbyLat', String(nearby.lat));
        qs.set('nearbyLng', String(nearby.lng));
      } else if (locationSlug) qs.set("locationSlug", locationSlug);
      router.push(`/search?${qs.toString()}` as Route);
    }
  }

  // close picker when clicking outside
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (pickerOpen && pickerRef.current && !pickerRef.current.contains(t)) setPickerOpen(false);
      if (allPickerOpen && allPickerRef.current && !allPickerRef.current.contains(t)) setAllPickerOpen(false);

      // location: close only when click outside both trigger and pane
      if (locationPickerOpen) {
        const inTrigger = locationRef.current && locationRef.current.contains(t);
        const inPane = locationPaneRef.current && locationPaneRef.current.contains(t);
        if (!inTrigger && !inPane) setLocationPickerOpen(false);
      }

      if (pricePickerOpen) {
        const inTrigger = priceRef.current && priceRef.current.contains(t);
        const inPane = pricePaneRef.current && pricePaneRef.current.contains(t);
        if (!inTrigger && !inPane) setPricePickerOpen(false);
      }

      // date picker removed for segmented mode; keep no-op

      if (roomsPickerOpen) {
        const inTrigger = roomsRef.current && roomsRef.current.contains(t);
        const inPane = roomsPaneRef.current && roomsPaneRef.current.contains(t);
        if (!inTrigger && !inPane) setRoomsPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [pickerOpen, allPickerOpen, locationPickerOpen, pricePickerOpen, roomsPickerOpen]);

  // compute location popover position and keep it updated on resize/scroll
  useEffect(() => {
    function updatePos() {
      if (!locationRef.current) {
        setLocationPos(null);
        return;
      }
      const rect = locationRef.current.getBoundingClientRect();
      const maxWidth = Math.min(320, Math.floor(window.innerWidth * 0.92));
      let left = rect.right - maxWidth;
      if (left < 8) left = 8;
      if (left + maxWidth > window.innerWidth - 8) left = Math.max(8, window.innerWidth - maxWidth - 8);
      const top = rect.bottom + 8;
      setLocationPos({ top, left, width: maxWidth });
    }

    if (locationPickerOpen) {
      updatePos();
      window.addEventListener('resize', updatePos);
      window.addEventListener('scroll', updatePos, true);
      return () => {
        window.removeEventListener('resize', updatePos);
        window.removeEventListener('scroll', updatePos, true);
      };
    }
    return;
  }, [locationPickerOpen]);

  useEffect(() => {
    function updatePos() {
      if (!priceRef.current) {
        setPricePos(null);
        return;
      }
      const rect = priceRef.current.getBoundingClientRect();
      const maxWidth = Math.min(360, Math.floor(window.innerWidth * 0.96));
      let left = rect.right - maxWidth;
      if (left < 8) left = 8;
      if (left + maxWidth > window.innerWidth - 8) left = Math.max(8, window.innerWidth - maxWidth - 8);
      const top = rect.bottom + 8;
      setPricePos({ top, left, width: maxWidth });
    }

    if (pricePickerOpen) {
      updatePos();
      window.addEventListener('resize', updatePos);
      window.addEventListener('scroll', updatePos, true);
      return () => {
        window.removeEventListener('resize', updatePos);
        window.removeEventListener('scroll', updatePos, true);
      };
    }
    return;
  }, [pricePickerOpen]);

  useEffect(() => {
    function updatePos() {
      if (!roomsRef.current) {
        setRoomsPos(null);
        return;
      }
      const rect = roomsRef.current.getBoundingClientRect();
      const maxWidth = Math.min(360, Math.floor(window.innerWidth * 0.92));
      let left = rect.right - maxWidth;
      if (left < 8) left = 8;
      if (left + maxWidth > window.innerWidth - 8) left = Math.max(8, window.innerWidth - maxWidth - 8);
      const top = rect.bottom + 8;
      setRoomsPos({ top, left, width: maxWidth });
    }

    if (roomsPickerOpen) {
      updatePos();
      window.addEventListener('resize', updatePos);
      window.addEventListener('scroll', updatePos, true);
      return () => {
        window.removeEventListener('resize', updatePos);
        window.removeEventListener('scroll', updatePos, true);
      };
    }
    return;
  }, [roomsPickerOpen]);

  useEffect(() => {
    setQ(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    setGuests(defaultGuests !== undefined ? String(defaultGuests) : "1");
  }, [defaultGuests]);

  useEffect(() => {
    setOccupants(defaultOccupants !== undefined ? String(defaultOccupants) : "1");
  }, [defaultOccupants]);

  useEffect(() => {
    setBeds(defaultBeds !== undefined ? String(defaultBeds) : "1");
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
      setSelectedType(undefined); 
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
      <div className={clsx("flex items-center gap-2 rounded-full border border-gray-200 bg-white shadow-sm", compact ? 'px-2 py-1 text-sm' : 'px-3 py-2')}>
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#006633] to-[#4CAF50]">
          <Search className="h-5 w-5 text-white" />
        </div>
        {segmented ? (
          // Airbnb-style segmented inputs: 3 equal parts
          <div ref={pickerRef} className="flex flex-1 items-center divide-x divide-slate-200 rounded-full overflow-hidden">
            <button type="button" ref={locationRef} onClick={() => { setLocationPickerOpen(v => { const nv = !v; if (nv) { setPricePickerOpen(false); setRoomsPickerOpen(false); setAllPickerOpen(false); } return nv; }); }} className="flex-1 text-left px-4 py-2 text-sm">
              <div className="text-xs text-slate-500">Địa điểm</div>
              <div className="text-sm text-slate-800">{locationName ?? 'Tìm kiếm điểm đến'}</div>
            </button>

            <button type="button" ref={(el) => { priceRef.current = el; }} onClick={() => { setPricePickerOpen(v => { const nv = !v; if (nv) { setLocationPickerOpen(false); setRoomsPickerOpen(false); setAllPickerOpen(false); } return nv; }); }} className="flex-1 text-left px-4 py-2 text-sm">
              <div className="text-xs text-slate-500">Khoảng giá</div>
              <div className="text-sm text-slate-800">{(priceMin != null || priceMax != null) ? `Giá: ${formatVND(priceMin) || ''}${priceMin && priceMax ? '–' : ''}${formatVND(priceMax) || ''}` : 'Khoảng giá'}</div>
            </button>

            {locationPickerOpen && typeof document !== 'undefined' && locationRef?.current && createPortal(
              <div
                ref={(el) => { locationPaneRef.current = el; }}
                style={{
                  position: 'fixed',
                  top: `${locationRef.current.getBoundingClientRect().bottom + 8}px`,
                  left: `${Math.max(8, Math.min(window.innerWidth - 340, locationRef.current.getBoundingClientRect().left))}px`,
                  width: '320px',
                  maxWidth: '92vw'
                }}
                className="bg-white rounded-2xl shadow-lg p-4 z-[100000] border border-emerald-100 min-w-[280px]"
              >
                <div className="flex items-start justify-between">
                  <div className="text-xs text-slate-500 mb-2">Khu vực</div>
                  <button type="button" onClick={() => setLocationPickerOpen(false)} className="text-slate-400 hover:text-slate-600 ml-2">✕</button>
                </div>

                <div className="mb-3">
                  <button type="button" onClick={handleNearbyClick} className="w-full text-left px-3 py-2 rounded-md border border-emerald-200 hover:bg-emerald-50 text-emerald-800">Lân cận (Tìm xung quanh bạn)</button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-400 mb-2">Tỉnh / TP</div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {provincesList.length === 0 ? (
                        <div className="text-sm text-slate-400">Đang tải...</div>
                      ) : provincesList.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setProvince(p.id); setCity(undefined); setDistrict(undefined); }}
                          className={clsx("px-3 py-1 rounded-full border text-sm whitespace-nowrap", province === p.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-800 border-emerald-200')}
                        >{p.name}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400 mb-2">Thành phố / Huyện</div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {citiesList.length === 0 ? (
                        <div className="text-sm text-slate-400">Chọn tỉnh trước</div>
                      ) : citiesList.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setCity(c.id); setDistrict(undefined); }}
                          className={clsx("px-3 py-1 rounded-full border text-sm whitespace-nowrap", city === c.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-800 border-emerald-200')}
                        >{c.name}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400 mb-2">Quận / Phường</div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {districtsList.length === 0 ? (
                        <div className="text-sm text-slate-400">Chọn thành phố trước</div>
                      ) : districtsList.map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => { setLocationName(d.name || undefined); setLocationSlug(d.slug || undefined); setProvince(undefined); setCity(undefined); setDistrict(d.id); setLocationPickerOpen(false); }}
                          className="px-3 py-1 rounded-full border bg-white text-emerald-800 border-emerald-200 text-sm whitespace-nowrap"
                        >{d.name}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
            {pricePickerOpen && typeof document !== 'undefined' && priceRef?.current && (
              createPortal(
                <div
                  ref={(el) => { pricePaneRef.current = el; }}
                  style={{
                    position: 'fixed',
                    top: pricePos ? `${pricePos.top}px` : undefined,
                    left: pricePos ? `${pricePos.left}px` : undefined,
                    width: pricePos?.width ? `${pricePos.width}px` : '360px',
                    maxWidth: '96vw'
                  }}
                  className="bg-white rounded-2xl shadow-lg p-4 z-[100000] border border-emerald-100 min-w-[300px]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-slate-800">Khoảng giá</div>
                    <div className="text-xs text-slate-400">VND / tháng</div>
                  </div>

                  <div className="mb-3 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div>Min: <span className="font-medium text-slate-700">{formatVND(priceMin) || '0'}</span></div>
                      <div>Max: <span className="font-medium text-slate-700">{formatVND(priceMax) || formatVND(PRICE_SLIDER_MAX)}</span></div>
                    </div>

                    <div className="relative w-full h-8 flex items-center combined-range">
                      {(() => {
                        const minVal = priceMin ?? 0;
                        const maxVal = priceMax ?? PRICE_SLIDER_MAX;
                        const minPct = Math.round((minVal / PRICE_SLIDER_MAX) * 100);
                        const maxPct = Math.round((maxVal / PRICE_SLIDER_MAX) * 100);
                        const trackStyle = { background: `linear-gradient(to right, #eefaf2 0% ${minPct}%, #b7f3c9 ${minPct}% ${maxPct}%, #eefaf2 ${maxPct}% 100%)` };
                        return (
                          <div className="w-full px-2 slider-track" style={trackStyle}>
                            <div className="relative">
                              <input
                                aria-label="Min price"
                                type="range"
                                min={0}
                                max={PRICE_SLIDER_MAX}
                                step={PRICE_SLIDER_STEP}
                                value={minVal}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setPriceMin(val === 0 ? undefined : val);
                                  if (priceMax != null && val > priceMax) setPriceMax(val);
                                }}
                                className="absolute inset-0 w-full appearance-none bg-transparent h-8"
                                style={{ zIndex: 30 }}
                              />

                              <input
                                aria-label="Max price"
                                type="range"
                                min={0}
                                max={PRICE_SLIDER_MAX}
                                step={PRICE_SLIDER_STEP}
                                value={maxVal}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setPriceMax(val === PRICE_SLIDER_MAX ? undefined : val);
                                  if (priceMin != null && val < priceMin) setPriceMin(val);
                                }}
                                className="absolute inset-0 w-full appearance-none bg-transparent h-8"
                                style={{ zIndex: 40 }}
                              />
                              <div className="h-2" />
                            </div>
                          </div>
                        );
                      })()}
                      <style>{`
                        .combined-range { height:36px; }
                        .combined-range .slider-track { height:8px; border-radius:9999px; display:block; }
                        .combined-range input[type=range] { -webkit-appearance:none; appearance:none; position:absolute; left:0; right:0; top:50%; transform:translateY(-50%); height:24px; background:transparent; margin:0; padding:0; }
                        .combined-range input[type=range]::-webkit-slider-runnable-track { height:8px; background:transparent; border-radius:9999px; }
                        .combined-range input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:18px; height:18px; border-radius:50%; background:#fff; border:3px solid #006633; box-shadow:0 1px 2px rgba(0,0,0,0.15); transform:translateY(-50%); }
                        .combined-range input[type=range]::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:#fff; border:3px solid #006633; box-shadow:0 1px 2px rgba(0,0,0,0.15); transform:translateY(-50%); }
                      `}</style>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3 gap-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => { setPriceMin(undefined); setPriceMax(2000000); }} className="text-xs px-2 py-1 rounded-full border border-emerald-200 hover:bg-emerald-50">Dưới 2 triệu</button>
                      <button type="button" onClick={() => { setPriceMin(2000000); setPriceMax(4000000); }} className="text-xs px-2 py-1 rounded-full border border-emerald-200 hover:bg-emerald-50">2 - 4 triệu</button>
                      <button type="button" onClick={() => { setPriceMin(4000000); setPriceMax(6000000); }} className="text-xs px-2 py-1 rounded-full border border-emerald-200 hover:bg-emerald-50">4 - 6 triệu</button>
                      <button type="button" onClick={() => { setPriceMin(6000000); setPriceMax(undefined); }} className="text-xs px-2 py-1 rounded-full border border-emerald-200 hover:bg-emerald-50">Trên 6 triệu</button>
                    </div>
                    <button type="button" onClick={() => setPricePickerOpen(false)} className="text-xs px-2 py-1 rounded-full border border-slate-200 text-slate-600">Đóng</button>
                  </div>
                </div>,
                document.body
              )
            )}
            

            <button type="button" ref={roomsRef} onClick={() => { setRoomsPickerOpen(v => { const nv = !v; if (nv) { setLocationPickerOpen(false); setPricePickerOpen(false); setAllPickerOpen(false); } return nv; }); }} className="flex-1 text-left px-4 py-2 text-sm">
              <div className="text-xs text-slate-500">Khách</div>
              <div className="text-sm text-slate-800">{guests ? `${guests} khách` : 'Thêm khách'}</div>
            </button>
            {roomsPickerOpen && typeof document !== 'undefined' && roomsRef?.current && createPortal(
              <div
                ref={(el) => { roomsPaneRef.current = el; }}
                style={{
                  position: 'fixed',
                  top: roomsPos ? `${roomsPos.top}px` : undefined,
                  left: roomsPos ? `${roomsPos.left}px` : undefined,
                  width: roomsPos?.width ? `${roomsPos.width}px` : '360px',
                  maxWidth: '92vw'
                }}
                className="bg-white rounded-2xl shadow-lg p-4 z-[100000] border border-emerald-100 min-w-[300px]"
              >
                <div className="text-sm font-medium text-slate-700 mb-3">Tuỳ chọn</div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">Số lượng người</div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setGuests((g) => String(Math.max(1, Number(g || 1) - 1)))} className="w-8 h-8 rounded-md border flex items-center justify-center text-lg" style={{ borderColor: '#e6f4ea', color: '#006633' }}>−</button>
                      <input type="number" min={1} max={20} className="w-12 h-8 rounded border border-slate-200 px-0 text-sm text-center" value={guests} onChange={(e)=> setGuests(e.target.value)} />
                      <button type="button" onClick={() => setGuests((g) => String(Math.min(20, Number(g || 1) + 1)))} className="w-8 h-8 rounded-md border flex items-center justify-center text-lg" style={{ borderColor: '#e6f4ea', color: '#006633' }}>+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">Số phòng ngủ</div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setBeds((b) => String(Math.max(0, Number(b || 0) - 1)))} className="w-8 h-8 rounded-md border flex items-center justify-center text-lg" style={{ borderColor: '#e6f4ea', color: '#006633' }}>−</button>
                      <input type="number" min={0} max={10} className="w-12 h-8 rounded border border-slate-200 px-0 text-sm text-center" value={beds} onChange={(e)=> setBeds(e.target.value)} />
                      <button type="button" onClick={() => setBeds((b) => String(Math.min(10, Number(b || 0) + 1)))} className="w-8 h-8 rounded-md border flex items-center justify-center text-lg" style={{ borderColor: '#e6f4ea', color: '#006633' }}>+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">Số phòng WC</div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setOccupants((o) => String(Math.max(0, Number(o || 0) - 1)))} className="w-8 h-8 rounded-md border flex items-center justify-center text-lg" style={{ borderColor: '#e6f4ea', color: '#006633' }}>−</button>
                      <input type="number" min={0} max={10} className="w-12 h-8 rounded border border-slate-200 px-0 text-sm text-center" value={occupants} onChange={(e)=> setOccupants(e.target.value)} />
                      <button type="button" onClick={() => setOccupants((o) => String(Math.min(10, Number(o || 0) + 1)))} className="w-8 h-8 rounded-md border flex items-center justify-center text-lg" style={{ borderColor: '#e6f4ea', color: '#006633' }}>+</button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
        ) : (
          <>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
            />
            {/* Three horizontal filter options: Khu vực | Khoảng giá | Phòng/Ngủ & Số người */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Khu vực */}
              <div className="relative" ref={locationRef}>
                <button type="button" onClick={() => setLocationPickerOpen(v => !v)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium" style={{ borderColor: '#e6f4ea', background: 'white' }}>
                  <span className="text-slate-700">{locationName ? `Khu vực: ${locationName}` : 'Khu vực'}</span>
                </button>
                {locationPickerOpen && typeof document !== 'undefined' && (
                  createPortal(
                    <div
                      ref={(el) => { locationPaneRef.current = el; }}
                      style={{
                        position: 'fixed',
                        top: locationPos ? `${locationPos.top}px` : undefined,
                        left: locationPos ? `${locationPos.left}px` : undefined,
                        width: locationPos?.width ? `${locationPos.width}px` : '320px',
                        maxWidth: '92vw'
                      }}
                      className="bg-white rounded-2xl shadow-lg p-4 z-[100000] border border-emerald-100 min-w-[280px]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="text-xs text-slate-500 mb-2">Khu vực</div>
                        <button type="button" onClick={() => setLocationPickerOpen(false)} className="text-slate-400 hover:text-slate-600 ml-2">✕</button>
                      </div>

                      <div className="mb-3">
                        <button type="button" onClick={handleNearbyClick} className="w-full text-left px-3 py-2 rounded-md border border-emerald-200 hover:bg-emerald-50 text-emerald-800">Lân cận (Tìm xung quanh bạn)</button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-slate-400 mb-2">Tỉnh / TP</div>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {provincesList.length === 0 ? (
                              <div className="text-sm text-slate-400">Đang tải...</div>
                            ) : provincesList.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => { setProvince(p.id); setCity(undefined); setDistrict(undefined); }}
                                className={clsx("px-3 py-1 rounded-full border text-sm whitespace-nowrap", province === p.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-800 border-emerald-200')}
                              >{p.name}</button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-400 mb-2">Thành phố / Huyện</div>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {citiesList.length === 0 ? (
                              <div className="text-sm text-slate-400">Chọn tỉnh trước</div>
                            ) : citiesList.map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => { setCity(c.id); setDistrict(undefined); }}
                                className={clsx("px-3 py-1 rounded-full border text-sm whitespace-nowrap", city === c.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-800 border-emerald-200')}
                              >{c.name}</button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-400 mb-2">Quận / Phường</div>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {districtsList.length === 0 ? (
                              <div className="text-sm text-slate-400">Chọn thành phố trước</div>
                            ) : districtsList.map(d => (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => { setLocationName(d.name || undefined); setLocationSlug(d.slug || undefined); setProvince(undefined); setCity(undefined); setDistrict(d.id); setLocationPickerOpen(false); }}
                                className="px-3 py-1 rounded-full border bg-white text-emerald-800 border-emerald-200 text-sm whitespace-nowrap"
                              >{d.name}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>,
                    document.body
                  )
                )}
              </div>

              {/* Khoảng giá */}
              <div className="relative" ref={(el) => { priceRef.current = el; }}>
                <button type="button" onClick={() => setPricePickerOpen(v => !v)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium" style={{ borderColor: '#e6f4ea', background: 'white' }}>
                  <span className="text-slate-700">{(priceMin != null || priceMax != null) ? `Giá: ${formatVND(priceMin) || ''}${priceMin && priceMax ? '–' : ''}${formatVND(priceMax) || ''}` : 'Khoảng giá'}</span>
                </button>
                {pricePickerOpen && typeof document !== 'undefined' && (
                  createPortal(
                    <div
                      ref={(el) => { pricePaneRef.current = el; }}
                      style={{
                        position: 'fixed',
                        top: pricePos ? `${pricePos.top}px` : undefined,
                        left: pricePos ? `${pricePos.left}px` : undefined,
                        width: pricePos?.width ? `${pricePos.width}px` : '360px',
                        maxWidth: '96vw'
                      }}
                      className="bg-white rounded-2xl shadow-lg p-4 z-[100000] border border-emerald-100 min-w-[300px]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-slate-800">Khoảng giá</div>
                        <div className="text-xs text-slate-400">VND / tháng</div>
                      </div>

                      <div className="mb-3 flex flex-col gap-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div>Min: <span className="font-medium text-slate-700">{formatVND(priceMin) || '0'}</span></div>
                          <div>Max: <span className="font-medium text-slate-700">{formatVND(priceMax) || formatVND(PRICE_SLIDER_MAX)}</span></div>
                        </div>

                        {/* Combined dual-handle slider: two overlapping ranges with a colored track */}
                        <div className="relative w-full h-8 flex items-center combined-range">
                          {(() => {
                            const minVal = priceMin ?? 0;
                            const maxVal = priceMax ?? PRICE_SLIDER_MAX;
                            const minPct = Math.round((minVal / PRICE_SLIDER_MAX) * 100);
                            const maxPct = Math.round((maxVal / PRICE_SLIDER_MAX) * 100);
                            const trackStyle = { background: `linear-gradient(to right, #eefaf2 0% ${minPct}%, #b7f3c9 ${minPct}% ${maxPct}%, #eefaf2 ${maxPct}% 100%)` };
                            return (
                              <div className="w-full px-2 slider-track" style={trackStyle}>
                                <div className="relative">
                                  <input
                                    aria-label="Min price"
                                    type="range"
                                    min={0}
                                    max={PRICE_SLIDER_MAX}
                                    step={PRICE_SLIDER_STEP}
                                    value={minVal}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setPriceMin(val === 0 ? undefined : val);
                                      if (priceMax != null && val > priceMax) setPriceMax(val);
                                    }}
                                    className="absolute inset-0 w-full appearance-none bg-transparent h-8"
                                    style={{ zIndex: 30 }}
                                  />

                                  <input
                                    aria-label="Max price"
                                    type="range"
                                    min={0}
                                    max={PRICE_SLIDER_MAX}
                                    step={PRICE_SLIDER_STEP}
                                    value={maxVal}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setPriceMax(val === PRICE_SLIDER_MAX ? undefined : val);
                                      if (priceMin != null && val < priceMin) setPriceMin(val);
                                    }}
                                    className="absolute inset-0 w-full appearance-none bg-transparent h-8"
                                    style={{ zIndex: 40 }}
                                  />
                                  {/* invisible spacer to keep height */}
                                  <div className="h-2" />
                                </div>
                              </div>
                            );
                          })()}
                          <style>{`
                            /* Wrapper height and centering */
                            .combined-range { height:36px; }
                            .combined-range .slider-track { height:8px; border-radius:9999px; display:block; }

                            /* Make range inputs overlay the track and center thumbs vertically */
                            .combined-range input[type=range] { -webkit-appearance:none; appearance:none; position:absolute; left:0; right:0; top:50%; transform:translateY(-50%); height:24px; background:transparent; margin:0; padding:0; }
                            .combined-range input[type=range]::-webkit-slider-runnable-track { height:8px; background:transparent; border-radius:9999px; }
                            .combined-range input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:18px; height:18px; border-radius:50%; background:#fff; border:3px solid #006633; box-shadow:0 1px 2px rgba(0,0,0,0.15); transform:translateY(-50%); }
                            .combined-range input[type=range]::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:#fff; border:3px solid #006633; box-shadow:0 1px 2px rgba(0,0,0,0.15); transform:translateY(-50%); }
                          `}</style>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3 gap-3">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => { setPriceMin(undefined); setPriceMax(2000000); }} className="text-xs px-2 py-1 rounded-full border border-emerald-200 hover:bg-emerald-50">Dưới 2 triệu</button>
                          <button type="button" onClick={() => { setPriceMin(2000000); setPriceMax(4000000); }} className="text-xs px-2 py-1 rounded-full border border-emerald-200 hover:bg-emerald-50">2 - 4 triệu</button>
                          <button type="button" onClick={() => { setPriceMin(4000000); setPriceMax(6000000); }} className="text-xs px-2 py-1 rounded-full border border-emerald-200 hover:bg-emerald-50">4 - 6 triệu</button>
                          <button type="button" onClick={() => { setPriceMin(6000000); setPriceMax(undefined); }} className="text-xs px-2 py-1 rounded-full border border-emerald-200 hover:bg-emerald-50">Trên 6 triệu</button>
                        </div>
                        <button type="button" onClick={() => setPricePickerOpen(false)} className="text-xs px-2 py-1 rounded-full border border-slate-200 text-slate-600">Đóng</button>
                      </div>
                    </div>,
                    document.body
                  )
                )}
              </div>

              {/* Phòng/Ngủ & Số người */}
              <div className="relative" ref={roomsRef}>
                <button type="button" onClick={() => setRoomsPickerOpen(v => !v)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium" style={{ borderColor: '#e6f4ea', background: 'white' }}>
                  <span className="text-slate-700">Phòng/Ngủ & Người</span>
                </button>
                {roomsPickerOpen && typeof document !== 'undefined' && (
                  createPortal(
                    <div
                      ref={(el) => { roomsPaneRef.current = el; }}
                      style={{
                        position: 'fixed',
                        top: roomsPos ? `${roomsPos.top}px` : undefined,
                        left: roomsPos ? `${roomsPos.left}px` : undefined,
                        width: roomsPos?.width ? `${roomsPos.width}px` : '360px',
                        maxWidth: '92vw'
                      }}
                      className="bg-white rounded-2xl shadow-lg p-4 z-[100000] border border-emerald-100 min-w-[300px]"
                    >
                      <div className="text-sm font-medium text-slate-700 mb-3">Phòng & Số người</div>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-600 w-36">Phòng khách</div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setGuests((g) => String(Math.max(1, Number(g || 1) - 1)))} className="w-8 h-8 rounded-md border flex items-center justify-center text-lg" style={{ borderColor: '#e6f4ea', color: '#006633' }}>−</button>
                            <input type="number" min={1} max={12} className="w-10 h-8 rounded border border-slate-200 px-0 text-sm text-center" value={guests} onChange={(e)=> setGuests(e.target.value)} />
                            <button type="button" onClick={() => setGuests((g) => String(Math.min(12, Number(g || 1) + 1)))} className="w-8 h-8 rounded-md border flex items-center justify-center text-lg" style={{ borderColor: '#e6f4ea', color: '#006633' }}>+</button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-600 w-36">Phòng ngủ</div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setBeds((b) => String(Math.max(1, Number(b || 1) - 1)))} className="w-8 h-8 rounded-md border flex items-center justify-center text-lg" style={{ borderColor: '#e6f4ea', color: '#006633' }}>−</button>
                            <input type="number" min={1} max={6} className="w-10 h-8 rounded border border-slate-200 px-0 text-sm text-center" value={beds} onChange={(e)=> setBeds(e.target.value)} />
                            <button type="button" onClick={() => setBeds((b) => String(Math.min(6, Number(b || 1) + 1)))} className="w-8 h-8 rounded-md border flex items-center justify-center text-lg" style={{ borderColor: '#e6f4ea', color: '#006633' }}>+</button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-600 w-36">Số người ở</div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setOccupants((o) => String(Math.max(1, Number(o || 1) - 1)))} className="w-8 h-8 rounded-md border flex items-center justify-center text-lg" style={{ borderColor: '#e6f4ea', color: '#006633' }}>−</button>
                            <input type="number" min={1} max={20} className="w-10 h-8 rounded border border-slate-200 px-0 text-sm text-center" value={occupants} onChange={(e)=> setOccupants(e.target.value)} />
                            <button type="button" onClick={() => setOccupants((o) => String(Math.min(20, Number(o || 1) + 1)))} className="w-8 h-8 rounded-md border flex items-center justify-center text-lg" style={{ borderColor: '#e6f4ea', color: '#006633' }}>+</button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-3">
                        <button type="button" onClick={() => setRoomsPickerOpen(false)} className="text-xs px-2 py-1 rounded-full border border-emerald-200 text-emerald-700">Đóng</button>
                      </div>
                    </div>,
                    document.body
                  )
                )}
              </div>
            </div>
          </>
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
