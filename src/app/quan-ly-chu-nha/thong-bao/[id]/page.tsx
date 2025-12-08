"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CustomSunEditor from '@/app/admin/components/customSunEditor';
import { notificationService } from '@/services/notificationService';
import UploadPicker from '@/components/UploadPicker';
import { Bell, CheckCircle2, Save } from 'lucide-react';
import { toast } from 'react-toastify';


export default function NotificationEditPage(){
  const params = useParams();
  const idParam = (params as any)?.id as string | undefined;
  const isCreate = !idParam || idParam === 'create' || idParam === 'new';
  const router = useRouter();

  const [form, setForm] = useState<any>({ title: '', content: '', attachments: '' });

  useEffect(()=>{ if (!isCreate) fetchOne(); }, []);

  const fetchOne = async ()=>{
    try{
      const r = await notificationService.getById(Number(idParam));
      const data = (r as any)?.data ?? r;
      setForm({ title: data.title ?? '', content: data.content ?? '', attachments: data.attachments ?? '' });
    }catch(e){ console.error(e); toast.error('Không tải được thông báo'); }
  };

  const save = async ()=>{
    if (!form.title || String(form.title).trim()==='') return toast.error('Tiêu đề không được để trống');
    const plain = (form.content || '').replace(/<[^>]*>/g,'').trim();
    if (!plain) return toast.error('Nội dung không được để trống');
    try{
      const payload = { title: form.title, content: form.content, attachments: form.attachments };
      if (isCreate) await notificationService.create(payload);
      else await notificationService.update(Number(idParam), payload);
      toast.success('Đã lưu');
      router.push('/quan-ly-chu-nha/thong-bao');
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

      <div className="grid grid-cols-1 gap-6 mt-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div>
            <label className="block text-sm">Tiêu đề<span className="text-red-500 ml-1">*</span></label>
            <input value={form.title} onChange={(e)=>setForm((s:any)=>({...s, title: e.target.value}))} className="mt-1 h-10 w-full border border-slate-200 rounded px-3" />
          </div>

          <div className="mt-4">
            <label className="block text-sm">Nội dung<span className="text-red-500 ml-1">*</span></label>
            <CustomSunEditor value={form.content} onChange={(c: string) => setForm((s: any) => ({ ...s, content: c }))} />
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
