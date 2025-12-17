"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { taskService } from '@/services/taskService';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import AdminTable from '@/components/AdminTable';
import Pagination from '@/components/Pagination';
import { PlusCircle, Edit3, Clock, Play, Hourglass, CheckCircle, XCircle, AlertTriangle, Save } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminTaskEditPage(){
  const params = useParams();
  const idParam = (params as any)?.id as string | undefined;
  const isCreate = !idParam || idParam === 'create' || idParam === 'new';
  const router = useRouter();

  const [form, setForm] = useState<any>({ title: '', status: '', buildingId: undefined, apartmentId: undefined, dueDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ if (!isCreate) fetchOne(); }, []);

  const fetchOne = async ()=>{
    if (isCreate) return;
    try{
      setLoading(true);
      const r = await taskService.getById(Number(idParam));
      const data = (r as any)?.data ?? r;
      setForm({ title: data.title ?? '', status: data.status ?? '', buildingId: data.buildingId, apartmentId: data.apartmentId, dueDate: data.dueDate ? (new Date(data.dueDate)).toISOString().slice(0,10) : '' });
    }catch(e){ console.error(e); toast.error('Không tải được công việc'); } finally { setLoading(false); }
  };

  const save = async ()=>{
    if (!form.title || String(form.title).trim()==='') return toast.error('Tiêu đề không được để trống');
    try{
      setLoading(true);
      const payload = { title: form.title, status: form.status, buildingId: form.buildingId, apartmentId: form.apartmentId, dueDate: form.dueDate || null };
      if (isCreate) await taskService.create(payload);
      else await taskService.update(Number(idParam), payload);
      toast.success('Đã lưu');
      router.push('/admin/cong-viec');
    }catch(e){ console.error(e); toast.error('Lưu thất bại'); } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-screen-xl">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
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

      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Tiêu đề</label>
              <input value={form.title} onChange={(e)=>setForm((s:any)=>({...s, title: e.target.value}))} className="mt-2 h-11 w-full border border-slate-200 rounded-lg px-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Trạng thái</label>
              <input value={form.status} onChange={(e)=>setForm((s:any)=>({...s, status: e.target.value}))} className="mt-2 h-11 w-full border border-slate-200 rounded-lg px-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Hạn</label>
              <input type="date" value={form.dueDate} onChange={(e)=>setForm((s:any)=>({...s, dueDate: e.target.value}))} className="mt-2 h-11 w-full border border-slate-200 rounded-lg px-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 