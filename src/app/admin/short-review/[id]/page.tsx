"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { buildingService } from '@/services/buildingService';
import { apartmentService } from '@/services/apartmentService';
import { Save, CheckCircle2 } from 'lucide-react';
import VideoUploadPicker from '@/components/VideoUploadPicker';
import UploadPicker from '@/components/UploadPicker';
import { toast } from 'react-toastify';

export default function AdminShortReviewEditPage() {
  const params = useParams();
  const idParam = (params as any)?.id as string | undefined;
  const isCreate = !idParam || idParam === 'create' || idParam === 'new';
  const router = useRouter();

  const [form, setForm] = useState<any>({ buildingId: undefined, apartmentId: undefined, shortVideoUrl: '' });
  const [method, setMethod] = useState<'url' | 'upload'>('url');
  const [buildings, setBuildings] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchBuildings(); if (!isCreate && idParam) fetchOne(); }, []);
  useEffect(() => { if (form.buildingId) fetchApartments(Number(form.buildingId)); else { setApartments([]); setForm((s:any)=>({...s, apartmentId: undefined})); } }, [form.buildingId]);

  const fetchBuildings = async () => {
    try {
      const r = await buildingService.getAll({ page: 1, limit: 1000 });
      const data = r.items ?? [];
      setBuildings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchApartments = async (buildingId: number) => {
    try {
      const r = await apartmentService.getAll({ buildingId, page: 1, limit: 1000 });
      const data = r.items ?? [];
      setApartments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOne = async () => {
    try {
      // idParam expected to be apartment id
      const apt = await apartmentService.getById(Number(idParam));
      const a = (apt as any) ?? {};
      setForm({ buildingId: a.buildingId ?? undefined, apartmentId: a.id, shortVideoUrl: a.shortVideoUrl ?? '', shortVideoThumb: a.shortVideoThumb ?? a.short_thumb ?? '' });
    } catch (e) {
      console.error(e);
      toast.error('Không tải được dữ liệu căn hộ');
    }
  };

  const save = async () => {
    if (!form.buildingId) return toast.error('Vui lòng chọn tòa nhà');
    if (!form.apartmentId) return toast.error('Vui lòng chọn căn hộ');
    if (!form.shortVideoUrl) return toast.error('Vui lòng thêm Short Video (link hoặc tải lên)');
    if (!form.shortVideoThumb) return toast.error('Vui lòng thêm ảnh thumbnail cho Short Video');
    try {
      setLoading(true);
  // Cast to any because ApartmentForm type does not currently include shortVideoUrl
  // but backend accepts it as a field (entity column `short`).
  await apartmentService.update(Number(form.apartmentId), { shortVideoUrl: form.shortVideoUrl || null, shortVideoThumb: form.shortVideoThumb || null } as any);
      toast.success('Đã lưu');
      router.push('/admin/short-review');
    } catch (e) {
      console.error(e);
      toast.error('Lưu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">{isCreate ? 'Thêm' : 'Chỉnh sửa'}</p>
              <h1 className="text-lg font-semibold">{isCreate ? 'Thêm Short Review' : 'Cập nhật Short Review'}</h1>
            </div>
          </div>
          <div>
            <button onClick={save} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-60" disabled={loading || !form.buildingId || !form.apartmentId || !form.shortVideoUrl || !form.shortVideoThumb}><CheckCircle2 className="w-5 h-5" /> Lưu</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-xs">

                <div className="mt-3">
                  <UploadPicker value={form.shortVideoThumb || null} onChange={(val) => setForm((s:any) => ({ ...s, shortVideoThumb: Array.isArray(val) ? (val[0] ?? null) : val }))} aspectClass="aspect-[9/16]" />
                </div>
                <div className="mt-2 text-sm text-slate-500">Hoặc dán URL ảnh bên dưới</div>
                <input value={form.shortVideoThumb || ''} onChange={(e)=>setForm((s:any)=>({...s, shortVideoThumb: e.target.value }))} placeholder="https://... (ảnh thumbnail)" className="mt-2 h-11 w-full border border-slate-200 rounded-lg px-3" />
              </div>
            </div>

            {/* Right: form fields */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Tòa nhà</label>
                  <select value={form.buildingId || ''} onChange={(e)=>setForm((s:any)=>({...s, buildingId: e.target.value || undefined }))} className="mt-2 h-11 w-full border border-slate-200 rounded-lg px-3">
                    <option value="">-- Chọn tòa nhà --</option>
                    {buildings.map((b:any) => (<option key={b.id} value={b.id}>{b.id} - {b.name || b.code || b.address || ''}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Căn hộ</label>
                  <select value={form.apartmentId || ''} onChange={(e)=>setForm((s:any)=>({...s, apartmentId: e.target.value || undefined }))} className="mt-2 h-11 w-full border border-slate-200 rounded-lg px-3" disabled={!form.buildingId}>
                    <option value="">-- Chọn căn hộ --</option>
                    {apartments.map((a:any) => (<option key={a.id} value={a.id}>{a.id} - {a.title || a.roomCode || ''}</option>))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700">Short Video</label>
                <div className="mt-2 flex items-center gap-2">
                  <button type="button" onClick={()=>setMethod('url')} className={`px-3 py-1 rounded ${method==='url' ? 'bg-sky-600 text-white' : 'bg-slate-100'}`}>Nhập link</button>
                  <button type="button" onClick={()=>setMethod('upload')} className={`px-3 py-1 rounded ${method==='upload' ? 'bg-sky-600 text-white' : 'bg-slate-100'}`}>Tải lên</button>
                </div>

                <div className="mt-3">
                  {method === 'url' ? (
                    <input value={form.shortVideoUrl || ''} onChange={(e)=>setForm((s:any)=>({...s, shortVideoUrl: e.target.value }))} placeholder="https://... or youtube link" className="mt-0 h-11 w-full border border-slate-200 rounded-lg px-3" />
                  ) : (
                    <VideoUploadPicker value={form.shortVideoUrl || null} onChange={(v)=>setForm((s:any)=>({...s, shortVideoUrl: v }))} />
                  )}
                </div>

                <div className="mt-4 text-sm text-slate-600">Lưu ý: Short video nên là clip portrait 9:16, kích thước tối đa 25MB.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
