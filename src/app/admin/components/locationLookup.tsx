// app/admin/components/LocationLookup.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Loader2, MapPin } from "lucide-react";
import { locationService } from "@/services/locationService";
import { Location, LocationLevel } from "@/type/location";

type Props = {
  value?: Location | null;
  onChange: (loc: Location | null) => void;
  placeholder?: string;
  disabled?: boolean;
  levels?: LocationLevel[] | "all";
  limit?: number;
  allowClear?: boolean;
  autoOpen?: boolean;
};

export default function LocationLookup({
  value,
  onChange,
  placeholder = "Tìm khu vực (tên/slug)…",
  disabled,
  levels = "all",
  limit = 20,
  allowClear = true,
  autoOpen = true,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  /** Tạo danh sách level cần query (1+ lần gọi) */
  const queryLevels = useMemo<LocationLevel[]>(() => {
    if (levels === "all") return ["Province", "City", "District"];
    return levels ?? [];
  }, [levels]);

  const fetchLocations = async (kw: string) => {
    setLoading(true);
    try {
      // Nếu all levels -> tổng hợp nhiều call
      // Chỉ hiển thị cấp quận (District) nên ép level = 'District' bỏ qua cấu hình khác
      const { items } = await locationService.getAll({
        page: 1,
        limit,
        q: kw || undefined,
        level: 'District' as any,
      });
      setItems(items || []);
    } finally {
      setLoading(false);
    }
  };

  // Lần đầu tải
  useEffect(() => {
    fetchLocations("");
  }, [JSON.stringify(queryLevels), limit]);

  useEffect(() => {
    if (value && value.id) {
      setKeyword(value.name || value.slug || "");
    } else if (!value) {
      setKeyword("");
    }
  }, [value?.id]);

  // Debounce khi gõ
  useEffect(() => {
    const t = setTimeout(() => fetchLocations(keyword), 350);
    return () => clearTimeout(t);
  }, [keyword]);

  // Đóng khi click ra ngoài
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as HTMLElement;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const handleRootClick = () => {
    if (disabled) return;
    setOpen(true);
    inputRef.current?.focus();
  };

  return (
  <div ref={rootRef} className="relative" onClick={handleRootClick}>
      <label className="text-sm font-medium text-slate-700">Khu vực (Location)</label>

      <div className="mt-1 flex items-start gap-2">
        {/* Input tìm kiếm */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
          <input
            ref={inputRef}
            disabled={disabled}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => autoOpen && setOpen(true)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-slate-50 disabled:text-slate-400"
            aria-expanded={open}
            aria-haspopup="listbox"
          />

          {/* Dropdown list */}
          {open && !disabled && (
            <div
              className="absolute z-20 mt-2 w-full max-h-96 overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm"
              role="listbox"
            >
              {loading ? (
                <div className="px-3 py-2 text-sm text-slate-500 flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Đang tải...
                </div>
              ) : items.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500">Không có kết quả</div>
              ) : (
                <ul className="divide-y">
                  {items.map((it) => (
                    <li key={it.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(it);
                          setOpen(false);
                          setKeyword(it.name || it.slug || "");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-emerald-50"
                        role="option"
                        aria-selected={value?.id === it.id}
                      >
                        <div className="font-medium flex items-center gap-2">
                          <MapPin className="size-4 text-emerald-600" />
                          {it.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {it.slug} · {it.level}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Chip hiển thị giá trị đã chọn */}
        {value ? (
          <div className="shrink-0 flex items-center gap-2 rounded-lg border px-3 py-2 bg-slate-50">
            <span className="text-sm">Đã chọn:</span>
            <span className="text-sm font-medium">{value.name}</span>
            {allowClear && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="text-slate-500 hover:text-red-600"
                aria-label="Xoá khu vực"
                title="Xoá khu vực"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Gợi ý filter levels */}
      <p className="mt-1 text-xs text-slate-500">
        Đang tìm theo cấp:{" "}
        <b>
          {levels === "all"
            ? "all"
            : (levels as LocationLevel[]).join(", ")}
        </b>
      </p>
    </div>
  );
}
