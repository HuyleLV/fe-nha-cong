"use client";

import React, { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from '@/components/AdminTable';
import { userService } from '@/services/userService';
import Link from 'next/link';
import { Edit3, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

type Row = { id: number; name: string; email?: string; phone?: string; note?: string; customerStatus?: string | null };

export default function HopDongPage(){
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userService.listAdminUsers({ page: 1, limit: 200, customerStatus: 'contract' });
      const users = res.data ?? [];
      setRows((users as any[]).map(u => ({ id: u.id, name: u.name ?? '', email: u.email ?? '', phone: u.phone ?? '', note: u.note ?? '', customerStatus: u.customerStatus ?? null })));
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (r: Row) => {
    if (!confirm(`Xóa khách hàng "${r.name}" ?`)) return;
    try {
      await userService.deleteAdminUser(r.id);
      toast.success('Đã xóa');
      await load();
    } catch (err) { console.error(err); toast.error('Lỗi khi xóa'); }
  };

  // status change removed from this page

  return (
    <div className="p-6">
      <Panel title="Hợp đồng">
        <p className="text-sm text-slate-600 mb-4">Quản lý hợp đồng thuê giữa chủ nhà và khách.</p>

        <AdminTable headers={["Tên","Email","Điện thoại","Ghi chú","Hành động"]} loading={loading} emptyText="Chưa có hợp đồng">
          {rows.map(r => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-3">{r.name}</td>
              <td className="px-4 py-3">{r.email}</td>
              <td className="px-4 py-3">{r.phone}</td>
              <td className="px-4 py-3">{r.note}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <Link href={`/quan-ly-chu-nha/khach-hang/khach-hang/${r.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa">
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
      </Panel>
    </div>
  );
}
