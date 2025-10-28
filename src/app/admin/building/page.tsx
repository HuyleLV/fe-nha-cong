"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Calendar as CalendarIcon, Eye } from "lucide-react";
import AdminTable from "@/components/AdminTable";
import Pagination from "@/components/Pagination";
import { buildingService } from "@/services/buildingService";
import { Building, BuildingStatus } from "@/type/building";
import { locationService } from "@/services/locationService";
import type { Location } from "@/type/location";

const inputCls =
  "h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white";

function BuildingAdminListInner() {
  const router = useRouter();
  const sp = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Building[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; pageCount: number }>({ total: 0, page: 1, limit: 10, pageCount: 1 });
  const [locations, setLocations] = useState<Location[]>([]);

  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || 10);
  const q = sp.get("q") || "";
  const status = (sp.get("status") || undefined) as BuildingStatus | undefined;
  const locationId = sp.get("locationId") ? Number(sp.get("locationId")) : undefined;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await buildingService.getAll({ page, limit, q: q || undefined, status, locationId });
        setItems(res.items);
        setMeta(res.meta);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, limit, q, status, locationId]);

  // Load locations to render select options for filter
  useEffect(() => {
    (async () => {
      try {
        const res = await locationService.getAll({ page: 1, limit: 100 });
        setLocations(res.items || []);
      } catch {}
    })();
  }, []);

  const onFilterChange = (next: Partial<{ q: string; status: string; locationId: number; page: number }>) => {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined || v === null || v === "") params.delete(k);
      else params.set(k, String(v));
    }
    router.push(`/admin/building?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Quản lý Tòa Nhà</h1>
        <Link
          href="/admin/building/create"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" /> Tạo tòa nhà
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className={`${inputCls} pl-9`}
              placeholder="Tìm theo tên/địa chỉ"
              defaultValue={q}
              onKeyDown={(e) => {
                if (e.key === "Enter") onFilterChange({ q: (e.target as HTMLInputElement).value, page: 1 });
              }}
            />
          </div>
        </div>
        <select
          className={inputCls}
          defaultValue={status || ""}
          onChange={(e) => onFilterChange({ status: e.target.value || undefined, page: 1 })}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
          <option value="draft">draft</option>
        </select>
        <select
          className={inputCls}
          defaultValue={locationId || ""}
          onChange={(e) => onFilterChange({ locationId: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
        >
          <option value="">Tất cả khu vực</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name ?? `#${l.id}`}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <AdminTable
        headers={["ID", "Tên tòa", "Khu vực", "Số tầng", "Số căn", "Trạng thái", "Hành động"]}
        loading={loading}
      >
        {items.map((b) => (
          <tr key={b.id} className="hover:bg-slate-50">
            <td className="px-4 py-3">{b.id}</td>
            <td className="px-4 py-3">
              <div className="flex flex-col">
                <span className="font-medium text-slate-800">{b.name}</span>
                <span className="text-xs text-slate-500">/{b.slug}</span>
                {b.address && <span className="text-xs text-slate-500">{b.address}</span>}
              </div>
            </td>
            <td className="px-4 py-3">{b.locationId ?? "-"}</td>
            <td className="px-4 py-3">{b.floors}</td>
            <td className="px-4 py-3">{b.units}</td>
            <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs bg-slate-100">{b.status}</span></td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/building/${b.id}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs"
                  title="Xem chi tiết tòa nhà"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Chi tiết</span>
                </Link>
                <Link
                  href={`/admin/building/${b.id}/calendar`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs"
                  title="Xem lịch đặt phòng của tòa nhà"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Xem lịch</span>
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Pagination
        page={meta.page}
        totalPages={meta.pageCount}
        onPrev={() => onFilterChange({ page: Math.max(1, meta.page - 1) })}
        onNext={() => onFilterChange({ page: Math.min(meta.pageCount, meta.page + 1) })}
        onPageChange={(p) => onFilterChange({ page: p })}
      />
    </div>
  );
}

export default function BuildingAdminListPage() {
  return (
    <Suspense fallback={<div className="min-h-[300px] grid place-items-center">Đang tải…</div>}>
      <BuildingAdminListInner />
    </Suspense>
  );
}
