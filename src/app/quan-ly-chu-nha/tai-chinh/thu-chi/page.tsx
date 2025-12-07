"use client";

"use client";

import React, { useEffect, useState } from 'react';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import AdminTable from '@/components/AdminTable';
import Pagination from '@/components/Pagination';
import { thuChiService } from '@/services/thuChiService';
import { buildingService } from '@/services/buildingService';
import { useRouter } from 'next/navigation';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';

export default function ThuChiPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [buildings, setBuildings] = useState<any[]>([]);

  const load = async (page = 1, limit = 10) => {
    try {
      const res = await thuChiService.list({ page, limit });
      const payload = (res as any) ?? {};
      const data = payload.items ?? payload.data ?? payload;
      const m = payload.meta ?? { page, limit, totalPages: Array.isArray(data) ? Math.ceil(data.length / limit) : 1, total: Array.isArray(data) ? data.length : 0 };
      setItems(Array.isArray(data) ? data : []);
      setMeta(m);
    } catch (err) {
      setItems([]);
      setMeta({ page: 1, limit: 10, totalPages: 1, total: 0 });
    }
  };

  useEffect(() => {
    load(meta.page, meta.limit);
    (async () => {
      const b = await buildingService.getAll({ page: 1, limit: 500 });
      setBuildings((b as any)?.items ?? (b as any)?.data ?? b ?? []);
    })();
  }, []);

  return (
    <div className="p-6">
      <Panel
        title="Thu chi"
        actions={(
          <button onClick={() => router.push('/quan-ly-chu-nha/tai-chinh/thu-chi/create')} className="inline-flex items-center gap-2 bg-emerald-600 text-white p-2 rounded-md" title="Thêm thu chi">
            <PlusCircle className="w-5 h-5" />
          </button>
        )}
      >
        <AdminTable headers={["ID","Loại","Tiêu đề","Tòa nhà","Căn hộ","Ngày","Số mục","Hành động"]}>
          {items.length === 0 ? (
            <tr><td colSpan={8} className="py-6 text-center text-slate-500">Chưa có phiếu thu/chi</td></tr>
          ) : items.map((r:any, idx:number) => (
            <tr key={r.id} className="border-b">
              <td className="py-3 text-sm text-slate-700">{r.id}</td>
              <td className="py-3 text-sm text-slate-700">{r.type === 'thu' ? 'Phiếu thu' : 'Phiếu chi'}</td>
              <td className="py-3 text-sm text-slate-700">{r.title}</td>
              <td className="py-3 text-sm text-slate-700">{r.buildingId ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700">{r.apartmentId ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700">{r.date ? new Date(r.date).toISOString().slice(0,10) : '-'}</td>
              <td className="py-3 text-sm text-slate-700">{(r.items||[]).length}</td>
              <td className="py-3 text-sm text-slate-700 text-center">
                <div className="inline-flex items-center gap-2">
                  <button onClick={() => router.push(`/quan-ly-chu-nha/tai-chinh/thu-chi/${r.id}`)} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa"><Edit3 className="w-4 h-4"/></button>
                  <button onClick={async()=>{ if (!confirm('Xóa?')) return; await thuChiService.remove(r.id); load(); }} className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700" title="Xóa"><Trash2 className="w-4 h-4"/></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={(p)=> load(p, meta.limit)} />
      </Panel>
    </div>
  );
}
