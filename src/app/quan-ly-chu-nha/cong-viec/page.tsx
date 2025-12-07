"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { taskService } from '@/services/taskService';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import AdminTable from '@/components/AdminTable';
import Pagination from '@/components/Pagination';
import { PlusCircle, Edit3 } from 'lucide-react';

export default function TaskListPage(){
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });

  const load = async (page = 1, limit = 10) => {
    try {
      const r = await taskService.list({ page, limit });
      const payload = (r as any) ?? {};
      const data = payload.items ?? payload.data ?? payload;
      const m = payload.meta ?? { page, limit, totalPages: Array.isArray(data) ? Math.ceil(data.length / limit) : 1, total: Array.isArray(data) ? data.length : 0 };
      setItems(Array.isArray(data) ? data : []);
      setMeta(m);
    } catch (err) {
      setItems([]);
      setMeta({ page: 1, limit: 10, totalPages: 1, total: 0 });
    }
  };

  useEffect(()=>{ load(meta.page, meta.limit); }, []);

  return (
    <div className="p-6">
      <Panel
        title="Công việc"
        actions={(
          <button onClick={() => router.push('/quan-ly-chu-nha/cong-viec/create')} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white" title="Thêm công việc" aria-label="Thêm công việc">
            <PlusCircle className="w-5 h-5" />
          </button>
        )}
      >
  <AdminTable headers={["ID","Tiêu đề","Tòa nhà","Căn hộ","Hạn","Hành động"]}>
          {items.length === 0 ? (
            <tr><td colSpan={6} className="py-6 text-center text-slate-500">Chưa có công việc</td></tr>
          ) : items.map((it:any)=> (
            <tr key={it.id} className="border-b">
              <td className="py-3 text-sm text-slate-700">{it.id}</td>
              <td className="py-3 text-sm text-slate-700">{it.title}</td>
              <td className="py-3 text-sm text-slate-700">{it.buildingId ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700">{it.apartmentId ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700">{it.dueDate ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700 text-center">
                <button onClick={() => router.push(`/quan-ly-chu-nha/cong-viec/${it.id}`)} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa">
                  <Edit3 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={(p)=> load(p, meta.limit)} />
      </Panel>
    </div>
  );
}
