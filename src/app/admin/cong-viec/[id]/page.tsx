"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { taskService } from '@/services/taskService';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import { PlusCircle, Edit3, Clock, Play, Hourglass, CheckCircle, XCircle, AlertTriangle, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { buildingService } from '@/services/buildingService';
import { apartmentService } from '@/services/apartmentService';
import UploadPicker from '@/components/UploadPicker';

export default function AdminTaskEditPage(){
  const params = useParams();
  const idParam = (params as any)?.id as string | undefined;
  const isCreate = !idParam || idParam === 'create' || idParam === 'new';
  const router = useRouter();

  const [form, setForm] = useState<any>({ buildingId: '', apartmentId: '', title: '', description: '', group: '', type: '', priority: 'normal', status: 'chua_lam', dueDate: '', assignee: '', attachments: '' });
  const [buildings, setBuildings] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(()=>{ (async ()=>{ try { const b = await buildingService.getAll({ page:1, limit:500 }); setBuildings((b as any)?.items ?? (b as any)?.data ?? b ?? []); } catch(e){ setBuildings([]); } })(); if (!isCreate) fetchOne(); }, []);

  const fetchOne = async ()=>{
    try{
      setLoading(true);
      const r = await taskService.getById(Number(idParam));
      const data = (r as any)?.data ?? r;
      setForm({ buildingId: data.buildingId ?? '', apartmentId: data.apartmentId ?? '', title: data.title ?? '', description: data.description ?? '', group: data.group ?? '', type: data.type ?? '', priority: data.priority ?? 'normal', status: data.status ?? 'chua_lam', dueDate: data.dueDate ? new Date(data.dueDate).toISOString().slice(0,10) : '', assignee: data.assignee ?? '', attachments: data.attachments ?? '' });
      if (data.buildingId) {
        const a = await apartmentService.getAll({ page:1, limit:1000, buildingId: Number(data.buildingId) });
        setApartments((a as any)?.items ?? (a as any)?.data ?? a ?? []);
      }
    }catch(e){ console.error(e); toast.error('Không tải được công việc'); } finally { setLoading(false); }
  };

  const save = async ()=>{
    if (!form.buildingId) return toast.error('Tòa nhà không được để trống');
    if (!form.apartmentId) return toast.error('Căn hộ không được để trống');
    if (!form.title || String(form.title).trim()==='') return toast.error('Tiêu đề không được để trống');
    if (!form.dueDate || String(form.dueDate).trim() === '') return toast.error('Hạn hoàn thành không được để trống');
    try{
      setLoading(true);
      const payload = { ...form };
      if (isCreate) await taskService.create(payload);
      else await taskService.update(Number(idParam), payload);
      toast.success('Đã lưu');
      router.push('/admin/cong-viec');
    }catch(e){ console.error(e); toast.error('Lưu thất bại'); } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-screen-xl">
  <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-300/80">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" /> 
            <div>
                <p className="text-sm text-slate-500">{isCreate? 'Thêm' : 'Chỉnh sửa'}</p>
                <h1 className="text-lg font-semibold">{isCreate? 'Tạo công việc' : 'Cập nhật công việc'}</h1>
            </div>
          </div>
          <div>
            <button onClick={save} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white"><CheckCircle className="w-5 h-5"/> Lưu</button>
          </div>
        </div>
      </div>

  <div className="grid grid-cols-1 gap-6 mt-4">
  <div className="bg-white rounded-xl border border-slate-300/80 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm">Tòa nhà<span className="text-red-500 ml-1">*</span></label>
              <select value={String(form.buildingId ?? '')} onChange={async (e)=>{ const v = Number(e.target.value) || ''; setForm((s:any)=>({...s, buildingId: v, apartmentId:''})); if (v) { const a = await apartmentService.getAll({ page:1, limit:1000, buildingId: v }); setApartments((a as any)?.items ?? (a as any)?.data ?? a ?? []); } }} className="mt-1 h-10 w-full border border-slate-300/80 rounded px-3">
                <option value="">-- Chọn tòa nhà --</option>
                {buildings.map(b=> <option key={b.id} value={String(b.id)}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm">Căn hộ<span className="text-red-500 ml-1">*</span></label>
              <select value={String(form.apartmentId ?? '')} onChange={(e)=>setForm((s:any)=>({...s, apartmentId: Number(e.target.value) || ''}))} className="mt-1 h-10 w-full border border-slate-300/80 rounded px-3">
                <option value="">-- Chọn căn hộ --</option>
                {apartments.map(a=> <option key={a.id} value={String(a.id)}>{a.title || a.code}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm">Tiêu đề<span className="text-red-500 ml-1">*</span></label>
              <input value={form.title} onChange={(e)=>setForm((s:any)=>({...s, title: e.target.value}))} className="mt-1 h-10 w-full border border-slate-300/80 rounded px-3" />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm">Mô tả</label>
              <textarea value={form.description} onChange={(e)=>setForm((s:any)=>({...s, description: e.target.value}))} className="mt-1 w-full border border-slate-300/80 rounded px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm">Nhóm công việc</label>
              <input value={form.group} onChange={(e)=>setForm((s:any)=>({...s, group: e.target.value}))} className="mt-1 h-10 w-full border border-slate-300/80 rounded px-3" />
            </div>

            <div>
              <label className="block text-sm">Loại công việc</label>
              <input value={form.type} onChange={(e)=>setForm((s:any)=>({...s, type: e.target.value}))} className="mt-1 h-10 w-full border border-slate-300/80 rounded px-3" />
            </div>

            <div>
              <label className="block text-sm">Mức độ ưu tiên</label>
              <select value={form.priority} onChange={(e)=>setForm((s:any)=>({...s, priority: e.target.value}))} className="mt-1 h-10 w-full border border-slate-300/80 rounded px-3">
                <option value="normal">Bình thường</option>
                <option value="low">Thấp</option>
                <option value="high">Cao</option>
              </select>
            </div>

            <div>
              <label className="block text-sm">Trạng thái</label>
              <select value={form.status} onChange={(e)=>setForm((s:any)=>({...s, status: e.target.value}))} className="mt-1 h-10 w-full border border-slate-300/80 rounded px-3">
                <option value="chua_lam">Chưa làm</option>
                <option value="dang_lam">Đang làm</option>
                <option value="cho_nghiem_thu">Chờ nghiệm thu</option>
                <option value="da_nghiem_thu">Đã nghiệm thu</option>
                <option value="khong_dat">Không đạt</option>
                <option value="qua_han">Quá hạn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm">Hạn hoàn thành<span className="text-red-500 ml-1">*</span></label>
              <input type="date" value={form.dueDate} onChange={(e)=>setForm((s:any)=>({...s, dueDate: e.target.value}))} className="mt-1 h-10 w-full border border-slate-300/80 rounded px-3" />
            </div>

            <div>
              <label className="block text-sm">Người thực hiện</label>
              <input value={form.assignee} onChange={(e)=>setForm((s:any)=>({...s, assignee: e.target.value}))} className="mt-1 h-10 w-full border border-slate-300/80 rounded px-3" />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm">Đính kèm</label>
              <UploadPicker value={form.attachments || null} onChange={(v)=>setForm((s:any)=>({...s, attachments: v || ''}))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 