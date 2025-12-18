"use client";

import React, { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from '@/components/AdminTable';
import { depositService } from '@/services/depositService';
import { userService } from '@/services/userService';
import Link from 'next/link';
import { Edit3, Trash2, PlusCircle, List as ListIcon, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { buildingService } from '@/services/buildingService';
import { apartmentService } from '@/services/apartmentService';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import { fNumber } from '@/utils/format-number';

type Row = { id: number; status?: string; buildingId?: number; apartmentId?: number; customerInfo?: string; customerName?: string | null; customerPhone?: string | null; depositDate?: string; rentAmount?: number; depositAmount?: number };

export default function DatCocAdminPage(){
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);

  const [filter, setFilter] = useState<'all'|'pending'|'signed'|'cancelled'>('all');

  const load = async (p = page) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit };
      // admin: do not restrict by ownerId so we see all deposits
      const res = await depositService.list(params);
      const data = res.data ?? [];
      const meta = res.meta ?? {};
      setTotal(meta.total ?? 0);
      setPage(meta.page ?? p);
      setRows((data as any[]).map(d => ({ id: d.id, status: d.status, buildingId: d.buildingId, apartmentId: d.apartmentId, customerInfo: d.customerInfo, customerName: (d as any).customerName ?? null, customerPhone: (d as any).customerPhone ?? null, depositDate: d.depositDate, rentAmount: d.rentAmount, depositAmount: d.depositAmount })));
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []);

  // preload buildings and apartments for display mapping
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [bRes, aRes] = await Promise.all([
          buildingService.getAll({ page: 1, limit: 200 }),
          apartmentService.getAll({ page: 1, limit: 1000 }),
        ]);
        if (!mounted) return;
        setBuildings(bRes.items || []);
        setApartments(aRes.items || []);
      } catch (e) {
        // ignore errors; we'll fall back to ids
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onDelete = async (r: Row) => {
    if (!confirm(`Xóa đặt cọc #${r.id} ?`)) return;
    try {
      await depositService.remove(r.id!);
      toast.success('Đã xóa');
      await load();
    } catch (err) { console.error(err); toast.error('Lỗi khi xóa'); }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await depositService.update(id, { status });
      toast.success('Cập nhật trạng thái thành công');
      await load();
    } catch (err) { console.error(err); toast.error('Không thể cập nhật trạng thái'); }
  };

  return (
    <div className="p-6">
      <Panel title="Đặt cọc" actions={(
        <Link href={`/admin/khach-hang/dat-coc/new`} title="Tạo đặt cọc" aria-label="Tạo đặt cọc" className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white">
          <PlusCircle className="w-5 h-5" />
        </Link>
      )}>
        <p className="text-sm text-slate-600 mb-4">Quản lý các khoản đặt cọc của khách hàng (admin).</p>

        <div className="grid grid-cols-4 gap-3 mb-4 items-stretch">
          {(() => {
            const total = rows.length;
            const pending = rows.filter(r => (r.status ?? 'pending') === 'pending').length;
            const signed = rows.filter(r => r.status === 'signed').length;
            const cancelled = rows.filter(r => r.status === 'cancelled').length;
            const box = (title: string, count: number, key: 'all'|'pending'|'signed'|'cancelled') => {
              const isActive = filter === key;
              const base = isActive ? 'ring-1 ring-slate-200 shadow-md' : 'shadow-sm';
              if (key === 'all') {
                return (
                  <button key={key} onClick={() => setFilter(key)} className={`h-full w-full p-4 rounded flex items-center gap-3 ${base} bg-slate-50`}>
                    <div className="rounded-md bg-emerald-50 p-2">
                      <ListIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-slate-500">{title}</div>
                      <div className="text-2xl font-semibold mt-1">{count}</div>
                    </div>
                  </button>
                );
              }
              if (key === 'pending') {
                return (
                  <button key={key} onClick={() => setFilter(key)} className={`h-full w-full p-4 rounded flex items-center gap-3 ${base} bg-amber-50`}>
                    <div className="rounded-md bg-amber-50 p-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-slate-500">{title}</div>
                      <div className="text-2xl font-semibold mt-1">{count}</div>
                    </div>
                  </button>
                );
              }
              if (key === 'signed') {
                return (
                  <button key={key} onClick={() => setFilter(key)} className={`h-full w-full p-4 rounded flex items-center gap-3 ${base} bg-emerald-50`}>
                    <div className="rounded-md bg-emerald-50 p-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-slate-500">{title}</div>
                      <div className="text-2xl font-semibold mt-1">{count}</div>
                    </div>
                  </button>
                );
              }
              return (
                <button key={key} onClick={() => setFilter(key)} className={`h-full w-full p-4 rounded flex items-center gap-3 ${base} bg-rose-50`}>
                  <div className="rounded-md bg-rose-50 p-2">
                    <XCircle className="h-5 w-5 text-rose-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-slate-500">{title}</div>
                    <div className="text-2xl font-semibold mt-1">{count}</div>
                  </div>
                </button>
              );
            };
            return [
              box('Tất cả', total, 'all'),
              box('Chờ ký hợp đồng', pending, 'pending'),
              box('Đã ký hợp đồng', signed, 'signed'),
              box('Bỏ cọc', cancelled, 'cancelled'),
            ];
          })()}
        </div>

        <AdminTable headers={["Mã đặt cọc","Trạng thái","Tòa nhà","Căn hộ","Khách hàng","Giá thuê","Giá cọc","Ngày cọc","Hành động"]} loading={loading} emptyText="Chưa có đặt cọc">
          {rows.filter(r => filter === 'all' ? true : ((r.status ?? 'pending') === filter)).map(r => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-3">#{r.id}</td>
              <td className="px-4 py-3">
                <select value={r.status ?? 'pending'} onChange={(e) => updateStatus(r.id!, e.target.value)} className="rounded border px-2 py-1 text-sm">
                  <option value="pending">Chờ ký hợp đồng</option>
                  <option value="signed">Đã ký hợp đồng</option>
                  <option value="cancelled">Bỏ cọc</option>
                </select>
              </td>
              <td className="px-4 py-3">{(() => {
                const b = buildings.find(b => b.id === r.buildingId);
                if (b) return `#${b.id} • ${b.name}`;
                return r.buildingId ? `#${r.buildingId}` : '';
              })()}</td>
              <td className="px-4 py-3">{(() => {
                const a = apartments.find(a => a.id === r.apartmentId);
                if (a) return `#${a.id} • ${a.title}`;
                return r.apartmentId ? `#${r.apartmentId}` : '';
              })()}</td>
              <td className="px-4 py-3">{(() => {
                if ((r as any).customerName) return `${(r as any).customerName}${(r as any).customerPhone ? ' • ' + (r as any).customerPhone : ''}`;
                try {
                  const c = typeof r.customerInfo === 'string' && r.customerInfo ? JSON.parse(r.customerInfo) : r.customerInfo;
                  if (c && (c.name || c.phone)) return `${c.name || ''}${c.phone ? ' • ' + c.phone : ''}`;
                  return String(r.customerInfo ?? '');
                } catch { return String(r.customerInfo ?? ''); }
              })()}</td>
              <td className="px-4 py-3">{typeof r.rentAmount === 'number' ? fNumber(r.rentAmount) : (r.rentAmount ?? '')}</td>
              <td className="px-4 py-3">{typeof r.depositAmount === 'number' ? fNumber(r.depositAmount) : (r.depositAmount ?? '')}</td>
              <td className="px-4 py-3">{r.depositDate ? new Date(r.depositDate).toLocaleDateString() : ''}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <Link href={`/admin/khach-hang/dat-coc/${r.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa">
                    <Edit3 className="w-4 h-4 text-white" />
                  </Link>
                  <button title="Xóa" onClick={() => onDelete(r)} className="p-2 rounded bg-red-500 hover:bg-red-600">
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={page} limit={limit} total={total} onPageChange={(p) => load(p)} />
      </Panel>
    </div>
  );
}

