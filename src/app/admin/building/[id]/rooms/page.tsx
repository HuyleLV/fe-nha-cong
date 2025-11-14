"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { buildingService } from "@/services/buildingService";
import { apartmentService } from "@/services/apartmentService";
import type { Building } from "@/type/building";
import type { Apartment } from "@/type/apartment";
// Pagination removed per yêu cầu
import AdminRoomCard from "@/components/AdminRoomCard";

const inputCls =
  "h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white";

function RoomsGridInner() {
  const router = useRouter();
  const params = useParams();
  const sp = useSearchParams();
  const bid = Number(params?.id);

  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Apartment[]>([]);

  // Bỏ phân trang: luôn lấy toàn bộ (giới hạn an toàn 500)
  const page = 1;
  const limit = 500;
  const q = sp.get("q") || "";
  const floorNumber = sp.get("floorNumber") ? Number(sp.get("floorNumber")) : undefined;
  const status = (sp.get("status") || "") as "draft" | "published" | "archived" | "";

  useEffect(() => {
    (async () => {
      try {
        const b = await buildingService.getById(bid);
        setBuilding(b);
      } catch {}
    })();
  }, [bid]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
  const res = await apartmentService.getAll({ buildingId: bid, page, limit, q: q || undefined, floorNumber, status: (status || undefined) as any, sort: "newest" });
  setItems(res.items);
      } finally {
        setLoading(false);
      }
    })();
  }, [bid, q, floorNumber, status]);

  const onFilterChange = (next: Partial<{ q: string; status: string; floorNumber: number }>) => {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined || v === null || v === "") params.delete(k);
      else params.set(k, String(v));
    }
    router.push(`/admin/building/${bid}/rooms?${params.toString()}`);
  };

  const floorsOptions = useMemo(() => {
    const n = Number(building?.floors || 0);
    return Array.from({ length: n }, (_, i) => i + 1);
  }, [building?.floors]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/building" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4" /> Danh sách tòa nhà
          </Link>
          {building && (
            <Link href={`/admin/building/${bid}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
              Xem tòa nhà
            </Link>
          )}
        </div>
        <h1 className="text-xl font-semibold text-slate-800">Phòng dạng lưới • Tòa #{bid}{building?.name ? ` - ${building.name}` : ""}</h1>
      </div>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className={`${inputCls} pl-9`}
              placeholder="Tìm theo mã phòng/tiêu đề"
              defaultValue={q}
              onKeyDown={(e) => {
                if (e.key === "Enter") onFilterChange({ q: (e.target as HTMLInputElement).value });
              }}
            />
          </div>
        </div>
        <select
          className={inputCls}
          defaultValue={floorNumber || ""}
          onChange={(e) => onFilterChange({ floorNumber: e.target.value ? Number(e.target.value) : undefined })}
        >
          <option value="">Tất cả tầng</option>
          {floorsOptions.map((f) => (
            <option key={f} value={f}>Tầng {f}</option>
          ))}
        </select>
        <select
          className={inputCls}
          defaultValue={status}
          onChange={(e) => onFilterChange({ status: e.target.value || undefined })}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="published">Đang cho thuê</option>
          <option value="archived">Lưu trữ</option>
        </select>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="min-h-[200px] grid place-items-center text-slate-500">Đang tải…</div>
        ) : items.length === 0 ? (
          <div className="min-h-[200px] grid place-items-center text-slate-500">Chưa có phòng nào.</div>
        ) : (
          // Group by floor number
          (() => {
            const groups: Record<string, Apartment[]> = {};
            for (const a of items) {
              const fRaw = (a as any).floorNumber;
              const key = typeof fRaw === 'number' && fRaw > 0 ? String(fRaw) : 'KhongXacDinh';
              (groups[key] ||= []).push(a);
            }
            // Sort keys: numeric floors ascending, then unknown at end
            const floorKeys = Object.keys(groups).sort((a,b) => {
              if (a === 'KhongXacDinh') return 1;
              if (b === 'KhongXacDinh') return -1;
              return Number(a) - Number(b);
            });
            return (
              <div className="space-y-8">
                {floorKeys.map(fKey => {
                  const list = groups[fKey];
                  const isUnknown = fKey === 'KhongXacDinh';
                  return (
                    <div key={fKey} className="floor-group">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                          {isUnknown ? 'Không xác định tầng' : `Tầng ${fKey}`}
                        </h2>
                        <span className="text-xs text-slate-500">{list.length} phòng</span>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {list.map(a => <AdminRoomCard key={a.id} apartment={a} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()
        )}
      </div>

      {/* Pagination removed */}
    </div>
  );
}

export default function RoomsGridPage() {
  return (
    <Suspense fallback={<div className="min-h-[300px] grid place-items-center">Đang tải…</div>}>
      <RoomsGridInner />
    </Suspense>
  );
}
