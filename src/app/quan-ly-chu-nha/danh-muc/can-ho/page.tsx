"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Panel from "../../components/Panel";
import AdminTable from "@/components/AdminTable";
import Pagination from "@/components/Pagination";
import Spinner from "@/components/spinner";
import { PlusCircle, Edit3, Trash2, CheckCircle, Key, Clock, Calendar as CalendarIcon } from "lucide-react";
import { apartmentService } from "@/services/apartmentService";
import { toast } from "react-toastify";

type Row = {
  id: number;
  title: string;
  roomCode?: string | null;
  bedrooms?: number;
  rentPrice?: string;
  depositAmount?: string | number | null;
  areaM2?: string | null;
  // flexible occupancy fields may come from backend in different names
  occupancyRaw?: any;
};

function occupancyOf(a: any): "occupied" | "reserved" | "vacant" {
  // common possible fields
  const raw = a?.occupancyStatus || a?.roomStatus || a?.rentalStatus || a?.availability || a?.status || a?.occupancy || a?.tenantId || a?.isOccupied || a?.isReserved || a?.reserved;
  if (!raw) return "vacant";
  const s = String(raw).toLowerCase();
  if (s.includes("occup") || s.includes("occupied") || s.includes("rented") || s === "1" || raw === true) return "occupied";
  if (s.includes("reserv") || s.includes("reserved") || s.includes("deposit") || s.includes("cọc") ) return "reserved";
  if (s.includes("vacant") || s.includes("empty") || s === "0") return "vacant";
  return "vacant";
}

export default function Page() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; pageCount: number }>({ total: 0, page: 1, limit: 10, pageCount: 1 });

  const [countOccupied, setCountOccupied] = useState<number | null>(null);
  const [countReserved, setCountReserved] = useState<number | null>(null);
  const [countVacant, setCountVacant] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"occupied"|"reserved"|"vacant"|undefined>(undefined);

  const fetch = async (p = page, l = limit) => {
    setLoading(true);
    try {
      const res = await apartmentService.getAll({ page: p, limit: l });
      const mapped = (res.items || []).map((a: any) => ({
        id: a.id,
        title: a.title || a.roomCode || `#${a.id}`,
        roomCode: a.roomCode ?? String(a.id),
        bedrooms: a.bedrooms,
        rentPrice: a.rentPrice,
        depositAmount: (a as any).depositAmount ?? (a as any).deposit ?? null,
        areaM2: a.areaM2 ?? null,
        occupancyRaw: a,
      }));
      setItems(mapped);
      if (res.meta) {
        const m = res.meta as any;
        const total = typeof m.total === 'number' ? m.total : mapped.length;
        const lim = typeof m.limit === 'number' ? m.limit : l;
        const pg = typeof m.page === 'number' ? m.page : p;
        setMeta({ total, page: pg, limit: lim, pageCount: Math.max(1, Math.ceil((total || mapped.length) / (lim || l))) });
      } else {
        setMeta({ total: mapped.length, page: p, limit: l, pageCount: Math.max(1, Math.ceil(mapped.length / l)) });
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Không thể tải danh sách căn hộ");
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      setCountOccupied(null); setCountReserved(null); setCountVacant(null);
      // fetch a larger set to compute occupancy counts (owner-scoped endpoint assumed)
      const res = await apartmentService.getAll({ page: 1, limit: 1000 });
      const all = res.items || [];
      let occ = 0, resv = 0, vac = 0;
      for (const a of all) {
        const o = occupancyOf(a);
        if (o === 'occupied') occ++;
        else if (o === 'reserved') resv++;
        else vac++;
      }
      setCountOccupied(occ); setCountReserved(resv); setCountVacant(vac);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => { fetch(page, limit); }, [page, limit]);
  useEffect(() => { fetchCounts(); }, []);

  // filtered view for occupancy
  const displayed = statusFilter ? items.filter(it => occupancyOf(it.occupancyRaw) === statusFilter) : items;

  const router = useRouter();

  return (
    <div className="p-6">
      <Panel title="Quản lý Căn hộ" actions={(
        <button onClick={() => router.push('/quan-ly-chu-nha/danh-muc/can-ho/create')} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md" title="Thêm căn hộ"><PlusCircle className="w-5 h-5"/></button>
      )}>

        {/* summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <button
            type="button"
            onClick={() => { setStatusFilter(undefined); setPage(1); }}
            className={`w-full flex items-center gap-4 p-4 rounded-lg shadow-sm ${statusFilter === undefined ? 'bg-slate-100 ring-2 ring-emerald-200' : 'bg-slate-50'}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 shadow-sm"><Clock className="w-6 h-6" /></div>
            <div className="flex-1 text-left">
              <div className="text-sm text-slate-500 font-medium">Tất cả căn hộ</div>
              <div className="text-2xl font-semibold text-slate-800">{meta?.total ?? (loading ? <Spinner/> : 0)}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setStatusFilter('occupied'); setPage(1); }}
            className={`w-full flex items-center gap-4 p-4 rounded-lg shadow-sm ${statusFilter === 'occupied' ? 'bg-green-100 ring-2 ring-green-300' : 'bg-green-50'}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-50 text-green-700 shadow-sm"><Key className="w-6 h-6" /></div>
            <div className="flex-1 text-left">
              <div className="text-sm text-slate-700 font-medium">Đang thuê</div>
              <div className="text-2xl font-semibold text-green-700">{countOccupied === null ? <Spinner/> : countOccupied}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setStatusFilter('reserved'); setPage(1); }}
            className={`w-full flex items-center gap-4 p-4 rounded-lg shadow-sm ${statusFilter === 'reserved' ? 'bg-amber-100 ring-2 ring-amber-300' : 'bg-amber-50'}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-50 text-amber-700 shadow-sm"><CheckCircle className="w-6 h-6" /></div>
            <div className="flex-1 text-left">
              <div className="text-sm text-slate-700 font-medium">Đang cọc</div>
              <div className="text-2xl font-semibold text-amber-700">{countReserved === null ? <Spinner/> : countReserved}</div>
            </div>
          </button>
        </div>

        <AdminTable headers={["Mã","Tên căn hộ","Loại căn hộ","Giá thuê","Đặt cọc","Diện tích","Trạng thái","Hành động"]}>
          {loading ? (
            <tr><td colSpan={8} className="py-6 text-center text-sm text-slate-500">Đang tải danh sách căn hộ...</td></tr>
          ) : displayed.length === 0 ? (
            <tr><td colSpan={8} className="py-6 text-center text-sm text-slate-500">Không có căn hộ</td></tr>
          ) : displayed.map((it) => (
            <tr key={it.id} className="text-[14px]">
              <td className="px-4 py-3 text-center">{it.roomCode ?? it.id}</td>
              <td className="px-4 py-3 font-medium text-left">{it.title}</td>
              <td className="px-4 py-3 text-center">{it.bedrooms ? `${it.bedrooms} PN` : 'Studio'}</td>
              <td className="px-4 py-3 text-center">{it.rentPrice ? Number(String(it.rentPrice)).toLocaleString('vi-VN') : '-'} đ</td>
              <td className="px-4 py-3 text-center">{it.depositAmount ?? '-'}</td>
              <td className="px-4 py-3 text-center">{it.areaM2 ?? '-'}</td>
              <td className="px-4 py-3 text-center">
                <span className={`px-2 py-0.5 rounded text-sm ${occupancyOf(it.occupancyRaw) === 'occupied' ? 'bg-rose-100 text-rose-700' : occupancyOf(it.occupancyRaw) === 'reserved' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {occupancyOf(it.occupancyRaw) === 'occupied' ? 'Đang thuê' : occupancyOf(it.occupancyRaw) === 'reserved' ? 'Đang cọc' : 'Đang trống'}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="inline-flex items-center gap-2">
                  <button onClick={() => router.push(`/quan-ly-chu-nha/danh-muc/can-ho/${it.id}`)} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa"><Edit3 className="w-4 h-4"/></button>
                  <button onClick={() => router.push(`/quan-ly-chu-nha/danh-muc/can-ho/${it.id}/calendar`)} className="inline-flex items-center justify-center p-2 rounded-md bg-sky-600 text-white hover:bg-sky-700" title="Xem lịch"><CalendarIcon className="w-4 h-4"/></button>
                  <button onClick={async () => { try { if (!confirm('Bạn có chắc muốn xóa căn hộ này?')) return; await apartmentService.delete(it.id); toast.success('Xóa thành công'); fetch(page, limit); fetchCounts(); } catch (e: any) { toast.error(e?.message || 'Xóa thất bại'); } }} className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700" title="Xóa"><Trash2 className="w-4 h-4"/></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>

        <div className="mt-4">
          <Pagination page={page} totalPages={meta?.pageCount ?? 1} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(meta?.pageCount ?? 1, p + 1))} onPageChange={(p) => setPage(p)} />
        </div>

      </Panel>
    </div>
  );
}
