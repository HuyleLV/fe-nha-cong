"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from "@/components/AdminTable";
import Pagination from "@/components/Pagination";
import Spinner from "@/components/spinner";
import { PlusCircle, Edit3, Trash2, CheckCircle, Key, Clock, Calendar as CalendarIcon } from "lucide-react";
import { apartmentService } from "@/services/apartmentService";
import { toast } from "react-toastify";
import { fNumber } from '@/utils/format-number';
import ConfirmModal from "@/components/ConfirmModal";

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
  roomStatus?: string | null;
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

function roomStatusKey(a: any): 'sap_trong' | 'o_ngay' | 'het_phong' {
  const raw = (a?.roomStatus ?? a?.room_status ?? a?.occupancyStatus ?? a?.availability ?? null);
  if (raw) {
    const s = String(raw).toLowerCase();
    if (s === 'sap_trong' || s.includes('sap') || s.includes('sắp') || s.includes('coming')) return 'sap_trong';
    if (s === 'o_ngay' || s.includes('o_ngay') || s.includes('ở') || s.includes('available') || s.includes('vacant')) return 'o_ngay';
    if (s === 'het_phong' || s.includes('het') || s.includes('hết') || s.includes('occupied') || s.includes('rented')) return 'het_phong';
  }
  // fallback: infer from occupancy
  const occ = occupancyOf(a);
  if (occ === 'occupied') return 'het_phong';
  if (occ === 'reserved') return 'sap_trong';
  return 'o_ngay';
}

export default function Page() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; pageCount: number }>({ total: 0, page: 1, limit: 10, pageCount: 1 });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetApartment, setTargetApartment] = useState<Row | null>(null);

  const [countOccupied, setCountOccupied] = useState<number | null>(null);
  const [countReserved, setCountReserved] = useState<number | null>(null);
  const [countVacant, setCountVacant] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'sap_trong'|'o_ngay'|'het_phong'|undefined>(undefined);

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
        roomStatus: a.roomStatus ?? a.room_status ?? null,
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
      // fetch a larger set to compute occupancy counts (admin-scoped endpoint assumed)
      const res = await apartmentService.getAll({ page: 1, limit: 1000 });
      const all = res.items || [];
      let sap = 0, ngay = 0, het = 0;
      for (const a of all) {
        const k = roomStatusKey(a);
        if (k === 'het_phong') het++;
        else if (k === 'sap_trong') sap++;
        else ngay++;
      }
      setCountOccupied(het); setCountReserved(sap); setCountVacant(ngay);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => { fetch(page, limit); }, [page, limit]);
  useEffect(() => { fetchCounts(); }, []);

  // filtered view for room status
  const displayed = statusFilter ? items.filter(it => roomStatusKey(it.occupancyRaw) === statusFilter) : items;

  const router = useRouter();

  return (
    <div className="p-6">
      <Panel title="Quản lý Căn hộ" actions={(
        <button onClick={() => router.push('/admin/danh-muc/can-ho/create')} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md" title="Thêm căn hộ"><PlusCircle className="w-5 h-5"/></button>
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
            onClick={() => { setStatusFilter('het_phong'); setPage(1); }}
            className={`w-full flex items-center gap-4 p-4 rounded-lg shadow-sm ${statusFilter === 'het_phong' ? 'bg-rose-100 ring-2 ring-rose-300' : 'bg-rose-50'}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-rose-50 text-rose-700 shadow-sm"><Key className="w-6 h-6" /></div>
            <div className="flex-1 text-left">
              <div className="text-sm text-slate-700 font-medium">Hết phòng</div>
              <div className="text-2xl font-semibold text-rose-700">{countOccupied === null ? <Spinner/> : countOccupied}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setStatusFilter('sap_trong'); setPage(1); }}
            className={`w-full flex items-center gap-4 p-4 rounded-lg shadow-sm ${statusFilter === 'sap_trong' ? 'bg-amber-100 ring-2 ring-amber-300' : 'bg-amber-50'}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-50 text-amber-700 shadow-sm"><CheckCircle className="w-6 h-6" /></div>
            <div className="flex-1 text-left">
              <div className="text-sm text-slate-700 font-medium">Sắp trống</div>
              <div className="text-2xl font-semibold text-amber-700">{countReserved === null ? <Spinner/> : countReserved}</div>
            </div>
          </button>
        </div>

        <AdminTable headers={["Mã","Tên căn hộ","Loại căn hộ","Giá thuê","Đặt cọc","Diện tích","Chủ nhà","Trạng thái","Đã duyệt","Hành động"]}>
          {loading ? (
            <tr><td colSpan={10} className="py-6 text-center text-sm text-slate-500">Đang tải danh sách căn hộ...</td></tr>
          ) : displayed.length === 0 ? (
            <tr><td colSpan={10} className="py-6 text-center text-sm text-slate-500">Không có căn hộ</td></tr>
          ) : displayed.map((it) => (
            <tr key={it.id} className="text-[14px]">
              <td className="px-4 py-3 text-center">{it.roomCode ?? it.id}</td>
              <td className="px-4 py-3 font-medium text-left">{it.title}</td>
              <td className="px-4 py-3 text-center">{it.bedrooms ? `${it.bedrooms} PN` : 'Studio'}</td>
              <td className="px-4 py-3 text-center">{it.rentPrice ? fNumber(Number(String(it.rentPrice))) : '-'} đ</td>
              <td className="px-4 py-3 text-center">{it.depositAmount ?? '-'}</td>
              <td className="px-4 py-3 text-center">{it.areaM2 ?? '-'}</td>
              <td className="px-4 py-3 text-left">
                {(() => {
                  const raw = it.occupancyRaw as any;
                  const ownerId = raw?.owner?.id ?? raw?.user?.id ?? raw?.ownerId ?? raw?.hostId ?? null;
                  const ownerName = raw?.owner?.name ?? raw?.user?.name ?? raw?.ownerName ?? raw?.hostName ?? '';
                  return (
                    <div className="text-sm text-slate-800">
                      <div className="font-medium">{ownerName || '-'}</div>
                      {ownerId ? <div className="text-xs text-slate-500">ID: {ownerId}</div> : null}
                    </div>
                  );
                })()}
              </td>
              <td className="px-4 py-3 text-center">
                {(() => {
                  const k = roomStatusKey(it.occupancyRaw);
                  const label = k === 'het_phong' ? 'Hết phòng' : k === 'sap_trong' ? 'Sắp trống' : 'Ở ngay';
                  const cls = k === 'het_phong' ? 'bg-rose-100 text-rose-700' : k === 'sap_trong' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
                  return <span className={`px-2 py-0.5 rounded text-sm ${cls}`}>{label}</span>;
                })()}
              </td>
              <td className="px-4 py-3 text-center">
                {(() => {
                  const raw = it.occupancyRaw as any;
                  // Prefer explicit approval flag added on backend. Accept both camelCase and snake_case.
                  const approvedFlag = raw?.isApproved ?? raw?.is_approved;
                  const ok = Boolean(approvedFlag);
                  return (
                    <span className={`px-2 py-0.5 rounded text-sm ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {ok ? 'Đã duyệt' : 'Chưa duyệt'}
                    </span>
                  );
                })()}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="inline-flex items-center gap-2">
                  <button onClick={() => router.push(`/admin/danh-muc/can-ho/${it.id}`)} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa"><Edit3 className="w-4 h-4"/></button>
                  <button onClick={() => router.push(`/admin/danh-muc/can-ho/${it.id}/calendar`)} className="inline-flex items-center justify-center p-2 rounded-md bg-sky-600 text-white hover:bg-sky-700" title="Xem lịch"><CalendarIcon className="w-4 h-4"/></button>
                  <button onClick={() => { setTargetApartment(it); setConfirmOpen(true); }} className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700" title="Xóa"><Trash2 className="w-4 h-4"/></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>

        <div className="mt-4">
          <Pagination page={page} totalPages={meta?.pageCount ?? 1} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(meta?.pageCount ?? 1, p + 1))} onPageChange={(p) => setPage(p)} />
        </div>

      </Panel>
        <ConfirmModal
          open={confirmOpen}
          title="Xóa căn hộ"
          message={`Bạn có chắc muốn xóa căn hộ '${targetApartment?.title ?? targetApartment?.id ?? ''}'?`}
          onCancel={() => { setConfirmOpen(false); setTargetApartment(null); }}
          onConfirm={async () => {
            if (!targetApartment) return;
            try {
              await apartmentService.delete(targetApartment.id);
              toast.success('Xóa thành công');
              fetch(page, limit);
              fetchCounts();
            } catch (e: any) {
              toast.error(e?.message || 'Xóa thất bại');
            } finally {
              setConfirmOpen(false);
              setTargetApartment(null);
            }
          }}
        />
    </div>
  );
}
