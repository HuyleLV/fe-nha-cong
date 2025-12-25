"use client";
import React, { useEffect, useState } from 'react';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import AdminTable from '@/components/AdminTable';
import Link from 'next/link';
import { PlusCircle, Eye, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import Pagination from '@/components/Pagination';
import { serviceRequestService } from '@/services/serviceRequestService';
import { toast } from 'react-toastify';
import { formatMoneyVND } from '@/utils/format-number';
import { serviceRequestStatusLabel } from '@/utils/status';

export default function YeuCauDichVuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [meta, setMeta] = useState<any>({});

  const load = async (p: number = 1) => {
    setLoading(true);
    try {
      const res = await serviceRequestService.getAll({ page: p, limit });
      setItems(res.items || []);
      setMeta(res.meta || {});
      setPage(p);
    } catch (err) { setItems([]); setMeta({}); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(page); }, []);

  return (
    <div className="p-6">
      <Panel title="Yêu cầu dịch vụ" actions={(
        <Link href="/quan-ly-chu-nha/cu-dan/yeu-cau-dich-vu/create" className="inline-flex items-center gap-2 bg-emerald-600 text-white p-2 rounded-md" title="Tạo yêu cầu"><PlusCircle className="w-5 h-5" /></Link>
      )}>
        <p className="text-sm text-slate-600 mb-4">Danh sách yêu cầu dịch vụ liên quan đến cư dân.</p>

        {/* Status statistic blocks */}
        {(() => {
          const STATUS_LIST = [
            { key: 'pending', label: 'Chờ xử lý', bg: 'bg-slate-50', accent: 'bg-slate-600' },
            { key: 'in_progress', label: 'Đang xử lý', bg: 'bg-amber-50', accent: 'bg-amber-600' },
            { key: 'done', label: 'Hoàn thành', bg: 'bg-emerald-50', accent: 'bg-emerald-600' },
            { key: 'cancelled', label: 'Hủy', bg: 'bg-red-50', accent: 'bg-red-600' },
          ];

          const counts = useMemo(() => {
            const map: Record<string, number> = {};
            STATUS_LIST.forEach(s => map[s.key] = 0);
            for (const it of items) {
              const k = it.status ?? 'pending';
              if (map[k] !== undefined) map[k]++;
            }
            return map;
          }, [items]);

          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {STATUS_LIST.map(s => (
                <button key={s.key} className={`flex items-center gap-3 p-3 rounded-lg shadow-sm hover:shadow-md transition text-sm ${s.bg}`} title={s.label}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${s.accent}`}></div>
                  <div className="text-left">
                    <div className="text-xs text-slate-500">{s.label}</div>
                    <div className="text-lg font-semibold">{counts[s.key] ?? 0}</div>
                  </div>
                </button>
              ))}
            </div>
          );
        })()}

        <AdminTable headers={["Mã","Tiêu đề","Tòa nhà","Căn hộ","Khách hàng","Giá","Thời gian yêu cầu","Trạng thái","Hành động"]}>
          {items.length === 0 ? (
            <tr><td colSpan={9} className="py-6 text-center text-slate-500">{loading ? 'Đang tải...' : 'Chưa có yêu cầu dịch vụ'}</td></tr>
          ) : items.map((it, idx) => (
            <tr key={it.id} className="border-b">
              <td className="py-3 text-sm text-slate-700">{items.length - idx}</td>
              <td className="py-3 text-sm text-slate-700">{it.title || '-'}</td>
              <td className="py-3 text-sm text-slate-700">{it.buildingName ?? it.building?.name ?? (it.buildingId ? `#${it.buildingId}` : '-')}</td>
              <td className="py-3 text-sm text-slate-700">{it.apartmentName ?? it.apartment?.name ?? it.apartment?.code ?? (it.apartmentId ? `#${it.apartmentId}` : '-')}</td>
              <td className="py-3 text-sm text-slate-700">
                {it.customer?.id ? (
                  <div className="flex flex-col">
                    <span className="truncate">{it.customer.name ?? '-'}</span>
                    <span className="text-sm text-slate-500">{it.customer.phone ?? '-'}</span>
                  </div>
                ) : (it.customerId || it.customerName) ? (
                  <div className="flex flex-col">
                    <span className="truncate">{it.customerName ?? '-'}</span>
                    <span className="text-sm text-slate-500">-</span>
                  </div>
                ) : '-'}
              </td>
              <td className="py-3 text-sm text-slate-700">{it.amount != null ? formatMoneyVND(it.amount) : '-'}</td>
              <td className="py-3 text-sm text-slate-700">{it.requestedAt ? new Date(it.requestedAt).toLocaleString() : '-'}</td>
              <td className="py-3 text-sm text-slate-700">{serviceRequestStatusLabel(it.status)}</td>
              <td className="py-3 text-sm text-slate-700 text-center">
                <div className="inline-flex items-center gap-2">
                      <Link href={`/quan-ly-chu-nha/cu-dan/yeu-cau-dich-vu/${it.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Xem"><Eye className="w-4 h-4"/></Link>
                      <button onClick={async () => {
                        if (!confirm('Bạn có chắc muốn xóa yêu cầu này không?')) return;
                        try {
                          await serviceRequestService.remove(it.id);
                          toast.success('Xóa yêu cầu thành công');
                          await load(page);
                        } catch (err: any) { console.error(err); toast.error(err?.response?.data?.message ?? 'Xóa thất bại'); }
                      }} className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700" title="Xóa"><Trash2 className="w-4 h-4"/></button>
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

