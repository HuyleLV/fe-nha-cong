"use client";
import React, { useEffect, useState } from 'react';
import { jobApplicationService } from '@/services/jobApplicationService';
import { JobApplication } from '@/type/jobApplication';
import Spinner from '@/components/spinner';
import AdminTable from '@/components/AdminTable';

const STATUS_LABELS: Record<string,string> = { new: 'Mới', reviewed: 'Đã xem', contacted: 'Đã liên hệ', rejected: 'Từ chối' };
const STATUS_ORDER = ['new','reviewed','contacted','rejected'];

export default function AdminJobApplicationTable({ jobId }: { jobId?: number }) {
  const [items,setItems] = useState<JobApplication[]>([]);
  const [loading,setLoading] = useState(false);
  const [status,setStatus] = useState<string>('');
  const [q,setQ] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await jobApplicationService.adminList({ jobId, status: status || undefined, q: q || undefined, limit: 100 });
      // Sort by status priority then createdAt desc
      const sorted = [...items].sort((a,b)=>{
        const sa = STATUS_ORDER.indexOf(a.status||'new');
        const sb = STATUS_ORDER.indexOf(b.status||'new');
        if (sa !== sb) return sa - sb;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setItems(sorted);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */}, [status, q, jobId]);

  const updateStatus = async (id: number, next: string) => {
    const prev = items;
    setItems(items.map(i=> i.id===id ? { ...i, status: next } : i));
    try { await jobApplicationService.adminUpdate(id, { status: next }); }
    catch { setItems(prev); }
  };

  const remove = async (id: number) => {
    if (!confirm('Xoá đơn ứng tuyển này?')) return;
    const prev = items;
    setItems(items.filter(i=>i.id!==id));
    try { await jobApplicationService.adminRemove(id); }
    catch { setItems(prev); }
  };

  // Modal state
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [note, setNote] = useState('');
  const [detailStatus, setDetailStatus] = useState('');

  const openDetail = async (id: number) => {
    setSelectedId(id); setDetailLoading(true); setSelected(null);
    try {
      const app = await jobApplicationService.adminGet(id);
      setSelected(app);
      setNote(app.internalNote || '');
      setDetailStatus(app.status || 'new');
    } finally { setDetailLoading(false); }
  };

  const saveDetail = async () => {
    if (!selectedId) return;
    const prev = items;
    setItems(items.map(i=> i.id===selectedId ? { ...i, status: detailStatus, internalNote: note } : i));
    try {
      await jobApplicationService.adminUpdate(selectedId, { status: detailStatus, internalNote: note });
      setSelected(selected ? { ...selected, status: detailStatus, internalNote: note } : selected);
    } catch {
      setItems(prev);
    }
  };

  const closeDetail = () => { setSelectedId(null); setSelected(null); setNote(''); setDetailStatus(''); };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-3">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm tên / email / sđt" className="px-4 py-2.5 border rounded-xl w-72 focus:ring-2 focus:ring-emerald-400 outline-none" />
          <select value={status} onChange={e=>setStatus(e.target.value)} className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none">
            <option value="">Tất cả trạng thái</option>
            {STATUS_ORDER.map(s=> <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[14px]">Làm mới</button>
        </div>
      </div>
      <AdminTable
        headers={['ID','Ứng viên','Liên hệ','CV','Lời nhắn','Trạng thái','Thời gian','Hành động']}
        loading={loading}
        emptyText="Chưa có đơn ứng tuyển"
      >
        {items.map(app => {
          const statusColor = app.status === 'new' ? 'bg-amber-50 text-amber-700 border border-amber-200' : app.status === 'reviewed' ? 'bg-slate-100 text-slate-700 border border-slate-200' : app.status === 'contacted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200';
          return (
            <tr key={app.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3 font-mono text-[12px]">{app.id}</td>
              <td className="px-5 py-3">
                <div className="font-medium text-[14px] leading-tight">{app.name}</div>
                {app.email && <div className="text-[12px] text-slate-500">{app.email}</div>}
              </td>
              <td className="px-5 py-3 text-[13px]">{app.phone || <span className="text-slate-400">—</span>}</td>
              <td className="px-5 py-3 text-[13px]">
                {app.cvUrl ? <a href={(process.env.NEXT_PUBLIC_API_URL || '') + app.cvUrl} target="_blank" className="inline-flex items-center gap-1 text-emerald-600 hover:underline">Tải CV</a> : <span className="text-slate-400">—</span>}
              </td>
              <td className="px-5 py-3 text-[13px] max-w-[420px]">
                <div className="line-clamp-2 whitespace-pre-wrap leading-snug">{app.message || '—'}</div>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <select value={app.status || 'new'} onChange={e=>updateStatus(app.id, e.target.value)} className="px-2.5 py-1.5 rounded-md border text-[12px] bg-white">
                    {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[12px] font-medium ${statusColor}`}>{STATUS_LABELS[app.status || 'new']}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-[12px] text-slate-600">{new Date(app.createdAt).toLocaleString()}</td>
              <td className="px-5 py-3">
                <div className="flex flex-wrap gap-2">
                  <button onClick={()=>openDetail(app.id)} className="inline-flex items-center h-9 px-3 rounded-md text-[13px] bg-slate-100 hover:bg-slate-200">Xem</button>
                  <button onClick={()=>remove(app.id)} className="inline-flex items-center h-9 px-3 rounded-md text-[13px] bg-rose-50 text-rose-600 hover:bg-rose-100">Xoá</button>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>
      {selectedId !== null && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeDetail} />
          <div className="relative z-[310] w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-semibold">Chi tiết đơn #{selectedId}</h3>
              <button onClick={closeDetail} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100">Đóng</button>
            </div>
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {detailLoading && <div className="text-center p-6"><Spinner /></div>}
              {!detailLoading && selected && (
                <>
                  <div className="grid grid-cols-2 gap-5 text-[14px]">
                    <div>
                      <div className="text-slate-500">Họ tên</div>
                      <div className="font-medium">{selected.name}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Email</div>
                      <div>{selected.email || '-'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">SĐT</div>
                      <div>{selected.phone || '-'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">CV</div>
                      <div>{selected.cvUrl ? <a href={(process.env.NEXT_PUBLIC_API_URL || '') + selected.cvUrl} target="_blank" className="text-emerald-600 hover:underline">Mở CV</a> : '-'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Trạng thái</div>
                      <select value={detailStatus} onChange={e=>setDetailStatus(e.target.value)} className="mt-1 px-3 py-2 border rounded-md text-[13px]">
                        {STATUS_ORDER.map(s=> <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="text-slate-500">Thời gian</div>
                      <div>{new Date(selected.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1 text-[14px]">Lời nhắn ứng viên</div>
                    <div className="rounded-lg border p-4 text-[14px] whitespace-pre-wrap max-h-40 overflow-y-auto bg-slate-50">{selected.message || '-'}</div>
                  </div>
                  <div>
                    <label className="text-slate-500 mb-1 text-[14px]">Ghi chú nội bộ</label>
                    <textarea value={note} onChange={e=>setNote(e.target.value)} rows={4} className="w-full rounded-lg border p-3 text-[14px]" placeholder="Nhập ghi chú cho HR..." />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={saveDetail} className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Lưu</button>
                    <button onClick={closeDetail} className="px-4 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300">Đóng</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}