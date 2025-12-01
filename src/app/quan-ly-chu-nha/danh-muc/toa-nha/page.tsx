"use client";

import React, { useEffect, useState } from "react";
import Panel from "../../components/Panel";
import AdminTable from "@/components/AdminTable";
import { useRouter } from 'next/navigation';
// locationService used to populate province/city/district/street selects
import { locationService } from '@/services/locationService';
import { PlusCircle, Edit3, Trash2, Home, CheckCircle, XCircle, Calendar as CalendarIcon } from "lucide-react";
import Spinner from '@/components/spinner';
import Pagination from '@/components/Pagination';
import { buildingService } from '@/services/buildingService';
import { BuildingStatus } from '@/type/building';
import { toast } from 'react-toastify';

type Item = { id: number; name: string; slug?: string | null; address?: string | null; apartmentCount?: number; paymentDate?: string | null };

type SimpleLocation = { id: number; name?: string | null };

export default function Page() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [districts, setDistricts] = useState<SimpleLocation[]>([]);
  const [streets, setStreets] = useState<SimpleLocation[]>([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [streetsLoading, setStreetsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; pageCount: number }>({ total: 0, page: 1, limit: 10, pageCount: 1 });
  const [countAll, setCountAll] = useState<number | null>(null);
  const [countActive, setCountActive] = useState<number | null>(null);
  const [countInactive, setCountInactive] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<BuildingStatus | undefined>(undefined);

  const fetch = async (pageParam = page, limitParam = limit) => {
    setLoading(true);
    try {
      const res = await buildingService.getAll({ page: pageParam, limit: limitParam, status: statusFilter });
      const mapped = (res.items || []).map((b) => ({ id: b.id, name: b.name, address: b.address, apartmentCount: (b as any).apartmentCount ?? 0, paymentDate: (b as any).paymentDate ?? b.updatedAt }));
      setItems(mapped);
      if (res.meta) setMeta(res.meta);
      else setMeta({ total: mapped.length, page: pageParam, limit: limitParam, pageCount: Math.max(1, Math.ceil((mapped.length || 0) / limitParam)) });
    } catch (e: any) {
      console.error('Failed to load buildings', e);
      toast.error(e?.message || 'Không thể tải tòa nhà');
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      setCountAll(null); setCountActive(null); setCountInactive(null);
      const [allRes, activeRes, inactiveRes] = await Promise.all([
        buildingService.getAll({ page: 1, limit: 1 }),
        buildingService.getAll({ page: 1, limit: 1, status: 'active' }),
        buildingService.getAll({ page: 1, limit: 1, status: 'inactive' }),
      ]);
      setCountAll(allRes.meta?.total ?? (allRes.items || []).length);
      setCountActive(activeRes.meta?.total ?? (activeRes.items || []).length);
      setCountInactive(inactiveRes.meta?.total ?? (inactiveRes.items || []).length);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => { fetch(page, limit); }, [page, limit, statusFilter]);
  useEffect(() => { fetchCounts(); }, []);

  // load districts for filter selects
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setDistrictsLoading(true);
        const res = await locationService.getAll({ level: 'District', limit: 1000 });
        if (!mounted) return;
        setDistricts(res.items.map((i: any) => ({ id: i.id, name: i.name })));
      } catch (e) {
      } finally { if (mounted) setDistrictsLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const onFilterChange = (next: Partial<{ page: number }>) => {
    if (next.page) setPage(next.page);
  };

  const startEdit = (it: Item) => router.push(`/quan-ly-chu-nha/danh-muc/toa-nha/${it.id}`);

  const remove = async (id?: number) => {
    if (!id) return;
    const ok = confirm('Xóa tòa nhà này?');
    if (!ok) return;
    try {
      await buildingService.remove(id);
      toast.success('Xóa tòa nhà thành công');
      await fetch(page, limit);
      await fetchCounts();
    } catch (e: any) {
      toast.error(e?.message || 'Lỗi khi xóa');
    }
  };

  return (
    <div className="p-6">
      <Panel title="Quản lý Tòa nhà" actions={(
        <button onClick={() => router.push('/quan-ly-chu-nha/danh-muc/toa-nha/create')} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md" title="Thêm tòa nhà"><PlusCircle className="w-5 h-5"/></button>
      )}>

        {/* summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <button
            type="button"
            onClick={() => { setStatusFilter(undefined); setPage(1); }}
            aria-pressed={statusFilter === undefined}
            className={`w-full flex items-center gap-4 p-4 rounded-lg shadow-sm transform transition-all ${statusFilter === undefined ? 'bg-slate-100 ring-2 ring-emerald-200' : 'bg-slate-50'}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 shadow-sm"><Home className="w-6 h-6" /></div>
            <div className="flex-1 text-left">
              <div className="text-sm text-slate-500 font-medium">Tất cả tòa nhà</div>
              <div className="text-2xl font-semibold text-slate-800">{countAll === null ? <Spinner /> : countAll}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setStatusFilter('active'); setPage(1); }}
            aria-pressed={statusFilter === 'active'}
            className={`w-full flex items-center gap-4 p-4 rounded-lg shadow-sm transform transition-all ${statusFilter === 'active' ? 'bg-emerald-100 ring-2 ring-emerald-300' : 'bg-emerald-50'}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 shadow-sm"><CheckCircle className="w-6 h-6" /></div>
            <div className="flex-1 text-left">
              <div className="text-sm text-slate-700 font-medium">Đang hoạt động</div>
              <div className="text-2xl font-semibold text-emerald-700">{countActive === null ? <Spinner /> : countActive}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setStatusFilter('inactive'); setPage(1); }}
            aria-pressed={statusFilter === 'inactive'}
            className={`w-full flex items-center gap-4 p-4 rounded-lg shadow-sm transform transition-all ${statusFilter === 'inactive' ? 'bg-rose-100 ring-2 ring-rose-300' : 'bg-rose-50'}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-rose-50 text-rose-600 shadow-sm"><XCircle className="w-6 h-6" /></div>
            <div className="flex-1 text-left">
              <div className="text-sm text-slate-500 font-medium">Ngưng hoạt động</div>
              <div className="text-2xl font-semibold text-rose-600">{countInactive === null ? <Spinner /> : countInactive}</div>
            </div>
          </button>
        </div>

        <AdminTable headers={["Mã","Tên tòa nhà","Địa chỉ","Số căn hộ","Ngày tạo","Hành động"]}>
          {loading ? (
            <tr><td colSpan={6} className="py-6 text-center text-sm text-slate-500">Đang tải danh sách tòa nhà...</td></tr>
          ) : items.length === 0 ? null : items.map((it) => (
            <tr key={it.id}>
              <td className="py-2 text-sm text-slate-700">{it.id}</td>
              <td className="py-2 text-sm text-slate-700">{it.name}</td>
              <td className="py-2 text-sm text-slate-700">{it.address ?? '-'}</td>
              <td className="py-2 text-sm text-slate-700 text-center">{it.apartmentCount ?? 0}</td>
              <td className="py-2 text-sm text-slate-700 text-center">{it.paymentDate ? new Date(it.paymentDate).toLocaleDateString() : '-'}</td>
              <td className="py-2 text-sm text-slate-700 text-center">
                <div className="inline-flex items-center gap-2">
                  <button onClick={() => router.push(`/quan-ly-chu-nha/danh-muc/toa-nha/${it.id}/calendar`)} className="inline-flex items-center justify-center p-2 rounded-md bg-sky-600 text-white hover:bg-sky-700" title="Xem lịch"><CalendarIcon className="w-4 h-4"/></button>
                  <button onClick={() => startEdit(it)} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa"><Edit3 className="w-4 h-4"/></button>
                  <button onClick={() => remove(it.id)} className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700" title="Xóa"><Trash2 className="w-4 h-4"/></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>

        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={meta?.pageCount ?? 1}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(meta?.pageCount ?? 1, p + 1))}
            onPageChange={(p: number) => setPage(p)}
          />
        </div>

      </Panel>
    </div>
  );
}

