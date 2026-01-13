"use client";

import React, { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import { serviceRequestService } from '@/services/serviceRequestService';
import Pagination from '@/components/Pagination';
import { serviceRequestStatusLabel } from '@/utils/status';
import AdminTable from '@/components/AdminTable';
import { toast } from 'react-toastify';

type Item = any;
const TYPE_LABEL: Record<string, string> = { fire: 'Báo cháy', repair: 'Sửa chữa' };

export default function YeuCauIndexPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<'fire' | 'repair' | ''>('');

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await serviceRequestService.getAll({ page: p, limit });
      setItems(res.items ?? []);
      setTotal(res.meta?.total ?? 0);
      setPage(res.meta?.page ?? p);
    } catch (err) {
      console.error(err);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const handleCreate = async (t: 'fire' | 'repair') => {
    if (creating) return;
    setCreating(t);
    try {
      const title = t === 'fire' ? 'Báo cháy' : 'Báo sửa chữa';
      await serviceRequestService.create({ type: t, title });
      toast.success('Đã gửi yêu cầu tới quản trị');
      await load(1);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || e?.message || 'Gửi yêu cầu thất bại');
    } finally {
      setCreating('');
    }
  };

  return (
    <div className="p-6">
      <Panel title="Trang yêu cầu">
        <p className="text-sm text-slate-600">Nhấn nút bên dưới để gửi yêu cầu tới quản trị. Tất cả yêu cầu sẽ hiển thị chung trong bảng.</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => handleCreate('fire')}
            disabled={!!creating}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg text-white font-semibold text-base md:text-lg ${creating === 'fire' ? 'bg-red-600 shadow-lg shadow-red-200' : 'bg-red-500/90 hover:bg-red-600'} disabled:opacity-60`}>
            Báo cháy
          </button>

          <button
            onClick={() => handleCreate('repair')}
            disabled={!!creating}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg text-white font-semibold text-base md:text-lg ${creating === 'repair' ? 'bg-emerald-600 shadow-lg shadow-emerald-200' : 'bg-emerald-500 hover:bg-emerald-600'} disabled:opacity-60`}>
            Báo sửa chữa
          </button>
        </div>

        <div className="mt-6">
          <AdminTable
            headers={["#", "Thời gian", "Loại", "Tiêu đề", "Tòa nhà", "Căn hộ", "Trạng thái"]}
            loading={loading}
            emptyText="Không có dữ liệu"
          >
            {!loading && items.map((it: Item) => (
              <tr key={it.id}>
                <td className="px-4 py-3">{it.id}</td>
                <td className="px-4 py-3">{it.requestedAt ? new Date(it.requestedAt).toLocaleString() : (it.createdAt ? new Date(it.createdAt).toLocaleString() : '-')}</td>
                <td className="px-4 py-3">{TYPE_LABEL[it.type as string] ?? (it.type ?? '-')}</td>
                <td className="px-4 py-3 text-left">{it.title}</td>
                <td className="px-4 py-3">{it.buildingId ?? '-'}</td>
                <td className="px-4 py-3">{it.apartmentId ?? '-'}</td>
                <td className="px-4 py-3">{serviceRequestStatusLabel(it.status)}</td>
              </tr>
            ))}
          </AdminTable>

          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={(p) => { setPage(p); load(p); }}
          />
        </div>
      </Panel>
    </div>
  );
}
