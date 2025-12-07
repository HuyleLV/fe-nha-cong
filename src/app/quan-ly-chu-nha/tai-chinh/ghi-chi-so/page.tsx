"use client";

import React, { useEffect, useState } from "react";
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from '@/components/AdminTable';
import Pagination from '@/components/Pagination';
import { meterReadingService } from '@/services/meterReadingService';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function GhiChiSoListPage(){
  const translateMeterType = (t?: string) => {
    if (!t) return '';
    if (t === 'electricity') return 'Công tơ điện';
    if (t === 'water') return 'Công tơ nước';
    return t;
  };
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const router = useRouter();

  const load = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await meterReadingService.list({ page, limit });
      const payload = (res as any) ?? {};
      const data = payload.items ?? payload.data ?? payload;
      const m = payload.meta ?? { page, limit, totalPages: Array.isArray(data) ? Math.ceil(data.length / limit) : 1, total: Array.isArray(data) ? data.length : 0 };
      setRows(Array.isArray(data) ? data : []);
      setMeta(m);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách');
      setRows([]);
      setMeta({ page: 1, limit: 10, totalPages: 1, total: 0 });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(meta.page, meta.limit); }, []);

  const onDelete = async (id: number) => {
    if (!confirm('Xoá ghi chỉ số này?')) return;
    try {
      await meterReadingService.remove(id);
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Không xoá được');
    }
  };

  return (
    <div className="p-6">
      <Panel title="Ghi chỉ số">
          <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">Danh sách các bản ghi chỉ số của bạn.</p>
          <div>
            <button onClick={() => router.push('/quan-ly-chu-nha/tai-chinh/ghi-chi-so/create')} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md" title="Thêm mới"><PlusCircle className="w-5 h-5"/></button>
          </div>
        </div>

        <AdminTable headers={["ID", "Tòa nhà", "Căn hộ", "Loại", "Chỉ số đầu", "Chỉ số cuối", "Tháng", "Ngày chốt", "Hành động"]} loading={loading}>
          {rows.length === 0 ? null : rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-3 text-left">{r.id}</td>
              <td className="px-4 py-3 text-left">{r.buildingName ?? r.buildingId}</td>
              <td className="px-4 py-3 text-left">{r.apartmentTitle ?? r.apartmentId}</td>
              <td className="px-4 py-3 text-left">{translateMeterType(r.meterType)}</td>
              <td className="px-4 py-3 text-left">{(r.items && r.items[0] && r.items[0].previousIndex) ? String(r.items[0].previousIndex).replace(/\.00$/,'') : ''}</td>
              <td className="px-4 py-3 text-left">{(r.items && r.items[0] && r.items[0].newIndex) ? String(r.items[0].newIndex).replace(/\.00$/,'') : ''}</td>
              <td className="px-4 py-3 text-left">{r.period}</td>
              <td className="px-4 py-3 text-left">{r.readingDate ? new Date(r.readingDate).toLocaleDateString() : ''}</td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button title="Sửa" onClick={() => router.push(`/quan-ly-chu-nha/tai-chinh/ghi-chi-so/${r.id}`)} className="p-2 rounded bg-emerald-600 text-white">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button title="Xoá" onClick={() => onDelete(r.id)} className="p-2 rounded bg-red-600 text-white">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        <div className="mt-4">
          <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={(p) => load(p, meta.limit)} />
        </div>
      </Panel>
    </div>
  );
}
