"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from "@/components/AdminTable";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { PlusCircle, Edit3, Trash2, Check, X } from "lucide-react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { locationService } from "@/services/locationService";
import { LocationLevel } from "@/type/location";
import Spinner from "@/components/spinner";
import ConfirmModal from "@/components/ConfirmModal";

type District = { id: string; name: string };
type Area = { id: string; name: string; districtId: string; buildingCount?: number };

function KhuVucManager() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [name, setName] = useState("");
  const [districtId, setDistrictId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetArea, setTargetArea] = useState<Area | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { items } = await locationService.getAll({ page: 1, limit: 200, level: "District" as LocationLevel });
        if (mounted) {
          const mapped = Array.isArray(items) ? items.map((it: any) => ({ id: String(it.id), name: it.name ?? String(it.id) })) : [];
          setDistricts(mapped);
        }
      } catch (e) {
        console.log("Failed to load districts from API:", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fetchAreas = async (pageParam = page, limitParam = limit) => {
    setLoading(true);
    try {
      // Admin view: DO NOT restrict by owner — fetch all streets
      const { items, meta } = await locationService.getAll({ page: pageParam, limit: limitParam, level: 'Street' as LocationLevel });
      const mapped = Array.isArray(items) ? items.map((it: any) => ({ id: String(it.id), name: it.name ?? '', districtId: String(it.parent?.id ?? ''), buildingCount: Number(it.buildingCount ?? 0) })) : [];
      setAreas(mapped);
      setTotalPages(meta?.totalPages ?? Math.max(1, Math.ceil((meta?.total ?? mapped.length) / limitParam)));
    } catch (err) {
      console.warn('Failed to load streets', err);
      setAreas([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAreas(page, limit); }, [page, limit]);

  // create/edit moved to route-based pages (src/app/admin/danh-muc/khu-vuc/[id]/page.tsx)

  const remove = async (id: string) => {
    // launch confirm modal
    const found = areas.find(a => a.id === id) ?? null;
    setTargetArea(found);
    setConfirmOpen(true);
  };

  const districtMap = useMemo(() => { const m: Record<string, string> = {}; districts.forEach((d) => (m[d.id] = d.name)); return m; }, [districts]);

  return (
    <div>
      <Panel title="Quản lý khu vực" actions={(
        <Link href="/admin/danh-muc/khu-vuc/create" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md" title="Thêm khu vực">
          <PlusCircle className="w-5 h-5" />
        </Link>
      )}>

        <AdminTable headers={["Mã", "Tên khu vực", "Quận", "Số tòa nhà", "Hành động"]}>
          {loading ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-sm text-slate-500">
                <div className="inline-flex items-center gap-2">
                  <Spinner />
                  Đang tải danh sách khu vực...
                </div>
              </td>
            </tr>
          ) : areas.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-sm text-slate-500">
                Chưa có khu vực nào — hãy thêm bằng nút +
              </td>
            </tr>
          ) : (
            areas.map((a, idx) => (
              <tr key={a.id}>
                <td className="py-2 text-sm text-slate-700">{a.id}</td>
                <td className="py-2 text-sm text-slate-700">{a.name}</td>
                <td className="py-2 text-sm text-slate-700">{districtMap[a.districtId] ?? a.districtId}</td>
                <td className="py-2 text-sm text-slate-700 text-center">{a.buildingCount ?? 0}</td>
                <td className="py-2 text-sm text-slate-700 text-center">
                    <div className="inline-flex items-center gap-2">
                      <Link href={`/admin/danh-muc/khu-vuc/${a.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa">
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => remove(a.id)} className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                </td>
              </tr>
            ))
          )}
        </AdminTable>

        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            onPageChange={(p: number) => setPage(p)}
          />
        </div>

        <ConfirmModal
          open={confirmOpen}
          title="Xóa khu vực"
          message={`Bạn có chắc muốn xóa khu vực '${targetArea?.name ?? ''}'?`}
          onCancel={() => { setConfirmOpen(false); setTargetArea(null); }}
          onConfirm={async () => {
            if (!targetArea) return;
            setActionLoading(true);
            try {
              await locationService.delete(Number(targetArea.id));
              setAreas((cur) => cur.filter((it) => it.id !== targetArea.id));
              toast.success('Xóa khu vực thành công');
            } catch (err: any) {
              toast.error(err?.message ?? 'Lỗi khi xóa');
            } finally {
              setActionLoading(false);
              setConfirmOpen(false);
              setTargetArea(null);
            }
          }}
        />

        {/* Create/edit moved to route pages. Modal removed. */}
      </Panel>
    </div>
  );
}

export default function Page() {
  return (
    <div className="p-6">
      <KhuVucManager />
    </div>
  );
}
