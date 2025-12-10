"use client";

import React, { useEffect, useMemo, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from '@/components/AdminTable';
import { userService } from '@/services/userService';
import Link from 'next/link';
import { Edit3, Trash2, UserPlus, Calendar, ShoppingCart, FileText, FileCheck, XCircle, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';

type StatusKey = 'new'|'appointment'|'sales'|'deposit_form'|'contract'|'failed';

type Row = { id: number; name: string; email?: string; phone?: string; note?: string; customerStatus?: StatusKey | null };

const STATUS_LIST: { key: StatusKey; label: string; bg?: string; accent?: string; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { key: 'new', label: 'Khách mới', bg: 'bg-slate-50', accent: 'bg-slate-600', icon: UserPlus },
  { key: 'appointment', label: 'Hẹn khách', bg: 'bg-emerald-50', accent: 'bg-emerald-600', icon: Calendar },
  { key: 'sales', label: 'Tư vấn bán hàng', bg: 'bg-blue-50', accent: 'bg-blue-600', icon: ShoppingCart },
  { key: 'deposit_form', label: 'Viết phiếu cọc', bg: 'bg-yellow-50', accent: 'bg-yellow-600', icon: FileText },
  { key: 'contract', label: 'Ký hợp đồng', bg: 'bg-emerald-50', accent: 'bg-emerald-600', icon: FileCheck },
  { key: 'failed', label: 'Thất bại', bg: 'bg-red-50', accent: 'bg-red-600', icon: XCircle },
];

export default function KhachTiemNangPage(){
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<StatusKey | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [meId, setMeId] = useState<number | null>(null);
  const load = async (p = page) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit };
      // Khách tiềm năng: customers WITHOUT contract/deposit
      params.hasContractOrDeposit = false;
      if (meId) params.ownerId = meId;
      const res = await userService.listAdminUsers(params);
      const users = res.data ?? [];
      const meta = res.meta ?? {};
      setTotal(meta.total ?? 0);
      setPage(meta.page ?? p);
      const mapped = (users as any[]).map(u => ({ id: u.id, name: u.name ?? '', email: u.email ?? '', phone: u.phone ?? '', note: u.note ?? '', customerStatus: u.customerStatus ?? null }));
      const statusKeys = STATUS_LIST.map(s => s.key);
      const filtered = mapped.filter(m => statusKeys.includes((m.customerStatus ?? 'new') as StatusKey));
      setRows(filtered);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [meId]);

  useEffect(() => {
    // load current user id to scope lists to this host
    (async () => {
      try {
        const me = await userService.getMe();
        if (me && me.id) setMeId(me.id);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    STATUS_LIST.forEach(s => map[s.key] = 0);
    for (const r of rows) {
      const k = r.customerStatus ?? 'new';
      if (map[k] !== undefined) map[k]++;
    }
    return map;
  }, [rows]);

  const onDelete = async (r: Row) => {
    if (!confirm(`Xóa khách hàng \"${r.name}\" ?`)) return;
    try {
      await userService.deleteAdminUser(r.id);
      toast.success('Đã xóa');
      await load();
    } catch (err) { console.error(err); toast.error('Lỗi khi xóa'); }
  };

  const onChangeStatus = async (id: number, status: StatusKey | null) => {
    try {
      await userService.updateAdminUser(id, { customerStatus: status ?? undefined });
      toast.success('Cập nhật trạng thái');
      await load();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const displayRows = filter ? rows.filter(r => r.customerStatus === filter) : rows;

  return (
    <div className="p-6">
      <Panel title="Khách tiềm năng" actions={(
        <Link href="/quan-ly-chu-nha/khach-hang/cu-dan/create" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-md h-8" title="Thêm khách hàng">
          <PlusCircle className="w-4 h-4" />
        </Link>
      )}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">Danh sách các khách tiềm năng.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          {STATUS_LIST.map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(filter === s.key ? null : s.key)}
              className={`flex items-center gap-3 p-3 rounded-lg shadow-sm hover:shadow-md transition text-sm ${filter === s.key ? 'ring-2 ring-emerald-200' : (s.bg ?? 'bg-white')}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${s.accent ?? 'bg-slate-400'}`}>
                  {s.icon ? <s.icon className="w-5 h-5" /> : s.label.charAt(0)}
                </div>
              <div className="text-left">
                <div className="text-xs text-slate-500">{s.label}</div>
                <div className="text-lg font-semibold">{counts[s.key] ?? 0}</div>
              </div>
            </button>
          ))}
        </div>

        <AdminTable headers={["Mã khách hàng", "Tên","Email","Điện thoại","Ghi chú","Trạng thái","Hành động"]} loading={loading} emptyText="Chưa có khách tiềm năng">
          {displayRows.map(r => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-3 text-left">{r.id}</td>
              <td className="px-4 py-3">{r.name}</td>
              <td className="px-4 py-3">{r.email}</td>
              <td className="px-4 py-3">{r.phone}</td>
              <td className="px-4 py-3">{r.note}</td>
              <td className="px-4 py-3">
                <select
                  value={r.customerStatus ?? 'new'}
                  onChange={(e) => onChangeStatus(r.id, e.target.value as StatusKey)}
                  className="rounded-md border px-3 py-1 text-sm bg-white"
                >
                  {STATUS_LIST.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <Link href={`/quan-ly-chu-nha/khach-hang/cu-dan/${r.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa">
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
