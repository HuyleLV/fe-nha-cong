"use client";

import React, { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from '@/components/AdminTable';
import Link from 'next/link';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { vehicleService } from '@/services/vehicleService';
import { toast } from 'react-toastify';

export default function AdminPhuongTienPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await vehicleService.getAll({ page: 1, limit: 200 });
      setItems(res.items || []);
    } catch (err) { setItems([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="p-6">
      <Panel title="Phương tiện" actions={(
        <Link href="/admin/khach-hang/phuong-tien/create" className="inline-flex items-center gap-2 bg-emerald-600 text-white p-2 rounded-md" title="Thêm phương tiện"><PlusCircle className="w-5 h-5" /></Link>
      )}>
        <p className="text-sm text-slate-600 mb-4">Quản lý phương tiện liên quan đến khách (admin).</p>
        <AdminTable headers={["Mã", "Loại", "Dòng xe", "Màu", "Biển số", "Chủ xe", "Tòa nhà", "Căn hộ", "Hành động"]}>
          {items.length === 0 ? (
            <tr><td colSpan={9} className="py-6 text-center text-slate-500 dark:text-slate-400">{loading ? 'Đang tải...' : 'Chưa có phương tiện'}</td></tr>
          ) : items.map((it, idx) => (
            <tr key={it.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="py-3 text-sm text-slate-700 dark:text-slate-200">{items.length - idx}</td>
              <td className="py-3 text-sm text-slate-700 dark:text-slate-200">{it.type || '-'}</td>
              <td className="py-3 text-sm text-slate-700 dark:text-slate-200">{it.model || '-'}</td>
              <td className="py-3 text-sm text-slate-700 dark:text-slate-200">{it.color || '-'}</td>
              <td className="py-3 text-sm text-slate-700 dark:text-slate-200">{it.plateNumber || '-'}</td>
              <td className="py-3 text-sm text-slate-700 dark:text-slate-200">{it.ownerName || '-'}</td>
              <td className="py-3 text-sm text-slate-700 dark:text-slate-200">{it.buildingId ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700 dark:text-slate-200">{it.apartmentId ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700 dark:text-slate-200 text-center">
                <div className="inline-flex items-center gap-2">
                  <Link href={`/admin/khach-hang/phuong-tien/${it.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa"><Edit3 className="w-4 h-4" /></Link>
                  <button onClick={() => { setTargetId(it.id); setConfirmOpen(true); }} className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        <ConfirmModal
          open={confirmOpen}
          title="Xóa phương tiện"
          message={`Bạn có chắc muốn xóa phương tiện #${targetId ?? ''}?`}
          onCancel={() => { setConfirmOpen(false); setTargetId(null); }}
          onConfirm={async () => {
            if (!targetId) return;
            try {
              await vehicleService.remove(targetId);
              toast.success('Xóa phương tiện thành công');
              await load();
            } catch (err: any) {
              console.error(err);
              toast.error(err?.response?.data?.message ?? 'Xóa thất bại');
            } finally {
              setConfirmOpen(false);
              setTargetId(null);
            }
          }}
        />
      </Panel>

      {/* create/edit page will be used instead of a modal */}
    </div>
  );
}

