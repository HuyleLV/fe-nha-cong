// components/SearchBar.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Bed } from "lucide-react";
import clsx from "clsx";
import type { Route } from "next";

type Props = {
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  defaultGuests?: number;
  defaultBeds?: number;
  onSearch?: (q: string, opts?: { guests?: number; beds?: number }) => void;      // ✅ thêm
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
}: Props) {
  const [q, setQ] = useState(defaultValue);
  const [guests, setGuests] = useState<string>(defaultGuests !== undefined ? String(defaultGuests) : "");
  const [beds, setBeds] = useState<string>(defaultBeds !== undefined ? String(defaultBeds) : "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = q.trim();
    const g = guests ? Number(guests) : undefined;
    const b = beds ? Number(beds) : undefined;
    if (onSearch) onSearch(value, { guests: g, beds: b });
    else {
      const qs = new URLSearchParams();
      qs.set("q", value);
      if (g !== undefined) qs.set("guests", String(g));
      if (b !== undefined) qs.set("beds", String(b));
      router.push(`/search?${qs.toString()}` as Route);
    }
  }

  // close picker when clicking outside
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (pickerOpen && pickerRef.current && !pickerRef.current.contains(t)) setPickerOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [pickerOpen]);

  // sync when parent updates defaults (e.g., URL params changed)
  useEffect(() => {
    setQ(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    setGuests(defaultGuests !== undefined ? String(defaultGuests) : "");
  }, [defaultGuests]);

  useEffect(() => {
    setBeds(defaultBeds !== undefined ? String(defaultBeds) : "");
  }, [defaultBeds]);

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
        <button
          type="button"
          onClick={() => onOpenLocation?.()}   // ✅ optional chaining
          className="hidden xs:inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium hover:bg-[#ecf9ef]"
          style={{ borderColor: '#006633', color: '#006633' }}
        >
          Chọn khu vực
        </button>

        {/* Compact guest/bed picker */}
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((v) => !v)}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-white hover:shadow-sm transition cursor-pointer"
            style={{ borderColor: '#006633' }}
          >
            <User className="w-4 h-4" style={{ color: '#006633' }} />
            <span className="text-sm text-slate-700">{guests ? `${guests} khách` : "Khách"}</span>
            <span className="text-slate-300">•</span>
            <Bed className="w-4 h-4" style={{ color: '#006633' }} />
            <span className="text-sm text-slate-700">{beds !== "" ? `${beds} ngủ` : "Ngủ"}</span>
          </button>

          {pickerOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg p-5 z-50" style={{ borderColor: '#e8f6ef' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: '#006633' }} />
                  <div className="text-sm font-medium">Khách</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGuests((g) => String(Math.max(0, Number(g || 0) - 1)))}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-[#ecf9ef] transition cursor-pointer"
                    style={{ borderColor: '#006633', color: '#006633' }}
                    aria-label="Giảm khách"
                  >
                    −
                  </button>
                  <div className="w-10 text-center text-[#006633] font-semibold">{guests || "0"}</div>
                  <button
                    type="button"
                    onClick={() => setGuests((g) => String(Math.min(12, Number(g || 0) + 1)))}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-[#ecf9ef] transition cursor-pointer"
                    style={{ borderColor: '#006633', color: '#006633' }}
                    aria-label="Tăng khách"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4" style={{ color: '#006633' }} />
                  <div className="text-sm font-medium">Ngủ</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBeds((b) => String(Math.max(0, Number(b || 0) - 1)))}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-[#ecf9ef] transition cursor-pointer"
                    style={{ borderColor: '#006633', color: '#006633' }}
                    aria-label="Giảm ngủ"
                  >
                    −
                  </button>
                  <div className="w-10 text-center text-[#006633] font-semibold">{beds !== "" ? beds : "0"}</div>
                  <button
                    type="button"
                    onClick={() => setBeds((b) => String(Math.min(6, Number(b || 0) + 1)))}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-[#ecf9ef] transition cursor-pointer"
                    style={{ borderColor: '#006633', color: '#006633' }}
                    aria-label="Tăng ngủ"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-2 text-right">
                <button type="button" onClick={() => setPickerOpen(false)} className="text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-[#006633] to-[#4CAF50] text-white hover:opacity-95 transition">Xong</button>
              </div>
            </div>
          )}
        </div>
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
