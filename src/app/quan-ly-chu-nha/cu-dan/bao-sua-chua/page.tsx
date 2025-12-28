"use client";

"use client";

import React, { useEffect, useState } from 'react';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import AdminTable from '@/components/AdminTable';
import Link from 'next/link';
import { PlusCircle, Eye, Trash2 } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { reportService } from '@/services/reportService';
import { reportStatusLabel } from '@/utils/status';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ConfirmModal';

export default function BaoSuaChuaPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [meta, setMeta] = useState<any>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>('');

  const load = async (p: number = 1) => {
    setLoading(true);
    try {
      const res = await reportService.getAll({ page: p, limit, type: 'repair' });
      setItems(res.items || []);
      setMeta(res.meta || {});
      setPage(p);
    } catch (err) { setItems([]); setMeta({}); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(page); }, []);

  return (
    <div className="p-6">
      <Panel title="Báo sửa chữa" actions={(
        <Link href="/quan-ly-chu-nha/cu-dan/bao-sua-chua/create" className="inline-flex items-center gap-2 bg-emerald-600 text-white p-2 rounded-md" title="Tạo báo sửa"><PlusCircle className="w-5 h-5" /></Link>
      )}>
        <p className="text-sm text-slate-600 mb-4">Nơi cư dân báo sửa chữa các thiết bị/hạng mục.</p>

        <AdminTable headers={["Mã","Tiêu đề","Căn hộ","Người tạo","Giá","Thời gian","Trạng thái","Hành động"]}>
          {items.length === 0 ? (
            <tr><td colSpan={8} className="py-6 text-center text-slate-500">{loading ? 'Đang tải...' : 'Chưa có báo sửa chữa'}</td></tr>
          ) : items.map((it, idx) => (
            <tr key={it.id} className="border-b">
              <td className="py-3 text-sm text-slate-700">{items.length - idx}</td>
              <td className="py-3 text-sm text-slate-700">{it.title || '-'}</td>
              <td className="py-3 text-sm text-slate-700">{it.apartmentName ?? it.apartment?.name ?? (it.apartmentId ? `#${it.apartmentId}` : '-')}</td>
              <td className="py-3 text-sm text-slate-700">{it.customer?.name ?? it.customerName ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700">{it.amount != null ? it.amount : '-'}</td>
              <td className="py-3 text-sm text-slate-700">{it.reportedAt ? new Date(it.reportedAt).toLocaleString() : '-'}</td>
              <td className="py-3 text-sm text-slate-700">{reportStatusLabel(it.status)}</td>
              <td className="py-3 text-sm text-slate-700 text-center">
                <div className="inline-flex items-center gap-2">
                      <Link href={`/quan-ly-chu-nha/cu-dan/bao-sua-chua/${it.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Xem"><Eye className="w-4 h-4"/></Link>
                      <>
                        <button onClick={() => { setConfirmId(it.id); setConfirmMessage('Bạn có chắc muốn xóa yêu cầu này không?'); setConfirmOpen(true); }} className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700" title="Xóa"><Trash2 className="w-4 h-4"/></button>
                        <ConfirmModal open={confirmOpen && confirmId === it.id} message={confirmMessage} onCancel={() => { setConfirmOpen(false); setConfirmId(null); }} onConfirm={async () => {
                          if (!confirmId) return; try { await reportService.remove(confirmId); toast.success('Xóa thành công'); await load(page); } catch (err: any) { console.error(err); toast.error(err?.response?.data?.message ?? 'Xóa thất bại'); } finally { setConfirmOpen(false); setConfirmId(null); }
                        }} />
                      </>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
            <div className="mt-4">
              <Pagination page={meta.page ?? page} limit={meta.limit ?? limit} total={meta.total ?? 0} onPageChange={(p) => load(p)} />
            </div>
      </Panel>
    </div>
  );
}
