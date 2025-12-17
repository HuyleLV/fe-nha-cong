"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CustomSunEditor from '@/app/admin/components/customSunEditor';
import { notificationService } from '@/services/notificationService';
import UploadPicker from '@/components/UploadPicker';
import { Bell, CheckCircle2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { buildingService } from '@/services/buildingService';
import { apartmentService } from '@/services/apartmentService';


export default function AdminNotificationEditPage(){
  const params = useParams();
  const idParam = (params as any)?.id as string | undefined;
  const isCreate = !idParam || idParam === 'create' || idParam === 'new';
  const router = useRouter();

  const [form, setForm] = useState<any>({ title: '', content: '', attachments: '', recipientType: 'apartment', buildingId: undefined, apartmentId: undefined });
  const [buildings, setBuildings] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);

  useEffect(()=>{ if (!isCreate) fetchOne(); }, []);
  useEffect(()=>{ fetchBuildings(); }, []);
  useEffect(()=>{ if(form.recipientType==='apartment' && form.buildingId){ fetchApartments(Number(form.buildingId)); } else { setApartments([]); setForm((s:any)=>({...s, apartmentId: undefined})); } }, [form.recipientType, form.buildingId]);

  const fetchOne = async ()=>{
    try{
      const r = await notificationService.getById(Number(idParam));
      const data = (r as any)?.data ?? r;
      setForm({ title: data.title ?? '', content: data.content ?? '', attachments: data.attachments ?? '', recipientType: data.recipientType || 'apartment', buildingId: data.buildingId, apartmentId: data.apartmentId });
    }catch(e){ console.error(e); toast.error('Không tải được thông báo'); }
  };

  const fetchBuildings = async ()=>{
    try{
      const r = await buildingService.getAll({ page: 1, limit: 1000 });
      const payload = (r as any) ?? {};
      const data = payload.items ?? payload.data ?? payload;
      setBuildings(Array.isArray(data)? data: []);
    }catch(e){ console.error(e); }
  };

  const fetchApartments = async (buildingId: number)=>{
    try{
      const r = await apartmentService.getAll({ buildingId, page: 1, limit: 1000 });
      const payload = (r as any) ?? {};
      const data = payload.items ?? payload.data ?? payload;
      setApartments(Array.isArray(data)? data: []);
    }catch(e){ console.error(e); }
  };

  const save = async ()=>{
    if (!form.title || String(form.title).trim()==='') return toast.error('Tiêu đề không được để trống');
    const plain = (form.content || '').replace(/<[^>]*>/g,'').trim();
    if (!plain) return toast.error('Nội dung không được để trống');
    if (!form.recipientType) return toast.error('Vui lòng chọn người nhận');
    if (form.recipientType==='building'){
      if (!form.buildingId) return toast.error('Vui lòng chọn tòa nhà');
    } else if (form.recipientType==='apartment'){
      if (!form.buildingId) return toast.error('Vui lòng chọn tòa nhà');
      if (!form.apartmentId) return toast.error('Vui lòng chọn căn hộ');
    }
    try{
      const payload = { title: form.title, content: form.content, attachments: form.attachments, recipientType: form.recipientType, buildingId: form.buildingId ? Number(form.buildingId) : undefined, apartmentId: form.apartmentId ? Number(form.apartmentId) : undefined };
      if (isCreate) await notificationService.create(payload);
      else await notificationService.update(Number(idParam), payload);
      toast.success('Đã lưu');
      router.push('/admin/thong-bao');
    }catch(e){ console.error(e); toast.error('Lưu thất bại'); }
  };

  return (
    <div className="mx-auto max-w-screen-xl">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" /> 
            <div>
                <p className="text-sm text-slate-500">{isCreate? 'Thêm' : 'Chỉnh sửa'}</p>
                <h1 className="text-lg font-semibold">{isCreate? 'Tạo thông báo' : 'Cập nhật thông báo'}</h1>
            </div>
          </div>
          <div>
            <button onClick={save} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white"><CheckCircle2 className="w-5 h-5"/> Lưu</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Tiêu đề<span className="text-red-500 ml-1">*</span></label>
            <input value={form.title} onChange={(e)=>setForm((s:any)=>({...s, title: e.target.value}))} className="mt-2 h-11 w-full border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Người nhận<span className="text-red-500 ml-1">*</span></label>
              <select value={form.recipientType} onChange={(e)=>setForm((s:any)=>({...s, recipientType: e.target.value }))} className="mt-2 h-11 w-full border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="apartment">Theo căn hộ</option>
                <option value="building">Theo tòa nhà</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Tòa nhà<span className="text-red-500 ml-1">*</span></label>
              <select value={form.buildingId || ''} onChange={(e)=>setForm((s:any)=>({...s, buildingId: e.target.value || undefined }))} className="mt-2 h-11 w-full border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">-- Chọn tòa nhà --</option>
                {buildings.map((b:any)=> (
                  <option key={b.id} value={b.id}>{b.id} - {b.name || b.code || b.address || ''}</option>
                ))}
              </select>
            </div>
            {form.recipientType==='apartment' && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Căn hộ<span className="text-red-500 ml-1">*</span></label>
                <select value={form.apartmentId || ''} onChange={(e)=>setForm((s:any)=>({...s, apartmentId: e.target.value || undefined }))} className="mt-2 h-11 w-full border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50" disabled={!form.buildingId}>
                  <option value="">-- Chọn căn hộ --</option>
                  {apartments.map((a:any)=> (
                    <option key={a.id} value={a.id}>{a.id} - {a.name || a.code || a.number || ''}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700">Nội dung<span className="text-red-500 ml-1">*</span></label>
            <div className="mt-2">
              <CustomSunEditor value={form.content} onChange={(c: string) => setForm((s: any) => ({ ...s, content: c }))} />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm">Đính kèm</label>
            <UploadPicker value={form.attachments || null} onChange={(v)=>setForm((s:any)=>({...s, attachments: v || ''}))} />
          </div>
        </div>
      </div>
    </div>
  );
}
