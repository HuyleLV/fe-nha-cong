"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notificationService } from '@/services/notificationService';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import AdminTable from '@/components/AdminTable';
import Pagination from '@/components/Pagination';
import { PlusCircle, Edit3 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminNotificationListPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const load = async (page = 1, limit = 10) => {
    try {
      const r = await notificationService.list({ page, limit });
      const payload = (r as any) ?? {};
      const data = payload.items ?? payload.data ?? payload;
      const m = payload.meta ?? { page, limit, totalPages: Array.isArray(data) ? Math.ceil(data.length / limit) : 1, total: Array.isArray(data) ? data.length : 0 };
      setItems(Array.isArray(data) ? data : []);
      setMeta(m);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải thông báo');
      setItems([]);
      setMeta({ page: 1, limit: 10, totalPages: 1, total: 0 });
    }
  };

  useEffect(() => { load(meta.page, meta.limit); }, []);

  return (
    <div className="p-6">
      <Panel
        title="Thông báo"
        actions={(
          <button onClick={() => router.push('/admin/thong-bao/create')} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white" title="Thêm thông báo" aria-label="Thêm thông báo">
            <PlusCircle className="w-5 h-5" />
          </button>
        )}
      >
        <AdminTable headers={["ID","Tiêu đề","Ngày","Hành động"]}>
          {items.length === 0 ? (
            <tr><td colSpan={4} className="py-6 text-center text-slate-500">Chưa có thông báo</td></tr>
          ) : items.map((it:any)=> (
            <tr key={it.id} className="border-b">
              <td className="py-3 text-sm text-slate-700">{it.id}</td>
              <td className="py-3 text-sm text-slate-700">{it.title}</td>
              <td className="py-3 text-sm text-slate-700">{it.createdAt ? new Date(it.createdAt).toLocaleString() : ''}</td>
              <td className="py-3 text-sm text-slate-700 text-center">
                <button onClick={() => router.push(`/admin/thong-bao/${it.id}`)} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa">
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
