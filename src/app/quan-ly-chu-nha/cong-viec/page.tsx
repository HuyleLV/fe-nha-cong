"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { taskService } from '@/services/taskService';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import AdminTable from '@/components/AdminTable';
import Pagination from '@/components/Pagination';
import { PlusCircle, Edit3, Clock, Play, Hourglass, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
        {/* Status summary blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {
            (()=>{
              // categorize statuses from items (best-effort matching)
              const keys = { todo: 0, doing: 0, pending: 0, done: 0, failed: 0, overdue: 0 };
              const norm = (s:any) => (s || '') .toString().toLowerCase();
              const keyOf = (it:any) => {
                const s = norm(it.status ?? it.state ?? it.progress ?? it.stage ?? it.type);
                if(!s) return 'todo';
                if(s.includes('chua') || s.includes('chờ') || s.includes('todo') || s.includes('new') || s.includes('pending')) return 'todo';
                if(s.includes('dang') || s.includes('doing') || s.includes('in_progress') || s.includes('progress')) return 'doing';
                if(s.includes('nghiem') || s.includes('accept') || s.includes('waiting')) return 'pending';
                if(s.includes('da') || s.includes('done') || s.includes('completed') || s.includes('accepted')) return 'done';
                if(s.includes('khong') || s.includes('ko') || s.includes('fail') || s.includes('rejected')) return 'failed';
                if(s.includes('qua') || s.includes('over') || s.includes('late') || s.includes('overdue')) return 'overdue';
                return 'todo';
              };
              items.forEach((it:any)=>{ const k = keyOf(it); keys[k] = (keys[k] || 0) + 1; });
              const blocks = [
                { key: 'todo', label: 'Chưa làm', count: keys.todo, icon: <Clock className="w-4 h-4 text-slate-600" />, color: 'slate' },
                { key: 'doing', label: 'Đang làm', count: keys.doing, icon: <Play className="w-4 h-4 text-emerald-600" />, color: 'emerald' },
                { key: 'pending', label: 'Chờ nghiệm thu', count: keys.pending, icon: <Hourglass className="w-4 h-4 text-amber-600" />, color: 'amber' },
                { key: 'done', label: 'Đã nghiệm thu', count: keys.done, icon: <CheckCircle className="w-4 h-4 text-green-600" />, color: 'green' },
                { key: 'failed', label: 'Không đạt', count: keys.failed, icon: <XCircle className="w-4 h-4 text-rose-500" />, color: 'rose' },
                { key: 'overdue', label: 'Quá hạn', count: keys.overdue, icon: <AlertTriangle className="w-4 h-4 text-rose-600" />, color: 'rose' },
              ];

              return blocks.map(b => (
                <div key={b.key} className={`rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-${b.color}-50/40 p-4 min-h-[90px]`}>
                  <div className="text-xs text-slate-500">{b.label}</div>
                  <div className="mt-1 flex items-center gap-2">
                    {b.icon}
                    <div className="text-xl font-semibold text-slate-900">{b.count}</div>
                  </div>
                </div>
              ));
            })()
          }
        </div>

  <AdminTable headers={["ID","Tiêu đề","Trạng thái","Tòa nhà","Căn hộ","Hạn","Hành động"]}>
          {items.length === 0 ? (
            <tr><td colSpan={7} className="py-6 text-center text-slate-500">Chưa có công việc</td></tr>
          ) : items.map((it:any)=> (
            <tr key={it.id} className="border-b">
              <td className="py-3 text-sm text-slate-700">{it.id}</td>
              <td className="py-3 text-sm text-slate-700">{it.title}</td>
              <td className="py-3 text-sm">
                {
                  (()=>{
                    const s = (it.status || '').toString().toLowerCase();
                    if(!s || s.includes('chua')) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-800">Chưa làm</span>;
                    if(s.includes('dang')) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800">Đang làm</span>;
                    if(s.includes('cho') || s.includes('nghiem')) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-50 text-amber-800">Chờ nghiệm thu</span>;
                    if(s.includes('da') || s.includes('nghiem')) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-800">Đã nghiệm thu</span>;
                    if(s.includes('khong') || s.includes('ko') || s.includes('fail')) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-rose-50 text-rose-700">Không đạt</span>;
                    if(s.includes('qua') || s.includes('over')) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-rose-50 text-rose-700">Quá hạn</span>;
                    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-800">{it.status}</span>;
                  })()
                }
              </td>
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
