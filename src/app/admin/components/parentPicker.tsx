"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { locationService } from "@/services/locationService";
import { Location, LocationLevel } from "@/type/location";

// Quan hệ parent hợp lệ cho từng child level
// - Province: không có parent
// - City: parent phải là Province
// - District: parent phải là City
const allowedParents: Record<LocationLevel, LocationLevel[]> = {
  Province: [],
  City: ["Province"],
  District: ["City"],
};

type ParentPickerProps = {
  value?: Location | null;
  onChange: (loc: Location | null) => void;
  childLevel: LocationLevel;
  disabled?: boolean;
  placeholder?: string;
};

export default function ParentPicker({
  value,
  onChange,
  childLevel,
  disabled,
  placeholder = "Tìm theo tên hoặc slug để chọn cấp cha…",
}: ParentPickerProps) {
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [openList, setOpenList] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const parentLevels = useMemo<LocationLevel[]>(() => allowedParents[childLevel] ?? [], [childLevel]);
  const viLabel = (lv: LocationLevel) => (lv === 'Province' ? 'Tỉnh' : lv === 'City' ? 'Thành phố' : 'Quận');

  const fetchParents = async (kw: string) => {
    // Nếu level hiện tại không cần parent hoặc component bị vô hiệu hoá, không fetch
    if (parentLevels.length === 0 || disabled) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      // Hiện chưa có endpoint BE /locations/parents → dùng getAll lọc theo level hợp lệ
      const results: Location[] = [];
      for (const lv of parentLevels) {
        const r = await locationService.getAll({
          page: 1,
          limit: 20,
          level: lv,
          q: kw || undefined,
        });
        results.push(...(r.items || []));
      }
      setItems(results);
    } finally {
      setLoading(false);
    }
  };

  // load khi đổi childLevel
  useEffect(() => {
    setKeyword("");
    fetchParents("");
  }, [childLevel, disabled]);

  // debounce khi gõ
  useEffect(() => {
    const t = setTimeout(() => fetchParents(keyword), 350);
    return () => clearTimeout(t);
  }, [keyword]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!openList) return;
      const target = e.target as HTMLElement;
      const root = inputRef.current?.closest("[data-parentpicker-root]");
      if (root && !root.contains(target)) setOpenList(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openList]);

  const canPickParent = parentLevels.length > 0 && !disabled;

  return (
    <div data-parentpicker-root>
  <label className="text-sm font-medium text-slate-700">Thuộc khu vực (cấp cha)</label>

      {/* ô nhập */}
      <div className="mt-1 flex items-start gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
          <input
            ref={inputRef}
            disabled={!canPickParent}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setOpenList(true)}
            placeholder={
              canPickParent ? placeholder : "Cấp này không cần/không có cấp cha"
            }
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-slate-50 disabled:text-slate-400"
          />
          {/* dropdown */}
          {openList && canPickParent && (
            <div className="absolute z-20 mt-2 w-full max-h-56 overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="px-3 py-2 text-sm text-slate-500 flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Đang tải...
                </div>
              ) : items.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500">
                  Không có kết quả
                </div>
              ) : (
                <ul className="divide-y">
                  {items.map((it) => (
                    <li key={it.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(it);
                          setOpenList(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-emerald-50"
                      >
                        <div className="font-medium">{it.name}</div>
                        <div className="text-xs text-slate-500">
                          {it.slug} · {viLabel(it.level)}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* chip hiển thị parent đã chọn */}
        {value ? (
          <div className="shrink-0 flex items-center gap-2 rounded-lg border px-3 py-2 bg-slate-50">
            <span className="text-sm">Đã chọn:</span>
            <span className="text-sm font-medium">{value.name}</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-slate-500 hover:text-red-600"
              aria-label="Xoá mục cha"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}
      </div>

      {/* gợi ý cấp hợp lệ */}
      {parentLevels.length > 0 ? (
        <p className="mt-1 text-xs text-slate-500">
          Cấp cha hợp lệ: <b>{parentLevels.map(viLabel).join(", ")}</b>
        </p>
      ) : (
        <p className="mt-1 text-xs text-slate-400">Mục này không có cấp cha.</p>
      )}
    </div>
  );
}
