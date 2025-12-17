"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import { buildingService } from '@/services/buildingService';
import { apartmentService } from '@/services/apartmentService';
import { contractService } from '@/services/contractService';
import { thuChiService } from '@/services/thuChiService';
import UploadPicker from '@/components/UploadPicker';
import AdminTable from '@/components/AdminTable';
import { CheckCircle2, Save, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminThuChiEditPage() {
  const params = useParams();
  const idParam = (params as any)?.id as string | undefined;
  const isCreate = !idParam || idParam === 'create' || idParam === 'new';
  const router = useRouter();

  const [form, setForm] = useState<any>({
    type: 'thu',
    buildingId: '',
    apartmentId: '',
    contractId: '',
    title: '',
    payerName: '',
    account: '',
    date: new Date().toISOString().slice(0,10),
    note: '',
    items: [],
    attachments: ''
  });

  const [buildings, setBuildings] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const b = await buildingService.getAll({ page:1, limit:500 });
      setBuildings((b as any)?.items ?? (b as any)?.data ?? b ?? []);
    })();
    if (!isCreate) fetchOne();
  }, []);

  const fetchOne = async () => {
    if (isCreate) return;
    try {
      const res = await thuChiService.getById(Number(idParam));
      const data = (res as any)?.data ?? res;
      setForm({
        type: data.type ?? 'thu',
        buildingId: data.buildingId ?? '',
        apartmentId: data.apartmentId ?? '',
        contractId: data.contractId ?? '',
        title: data.title ?? '',
        payerName: data.payerName ?? '',
        account: data.account ?? '',
        date: data.date ? new Date(data.date).toISOString().slice(0,10) : '',
        note: data.note ?? '',
        items: (data.items ?? []).map((it:any)=>({ id: it.id, category: it.category, amount: it.amount, startDate: it.startDate ? new Date(it.startDate).toISOString().slice(0,10) : '', endDate: it.endDate ? new Date(it.endDate).toISOString().slice(0,10) : '' })),
        attachments: data.attachments ?? ''
      });
      if (data.buildingId) {
        const a = await apartmentService.getAll({ page:1, limit:1000, buildingId: Number(data.buildingId) });
        setApartments((a as any)?.items ?? (a as any)?.data ?? a ?? []);
      }
      if (data.apartmentId) {
        const c = await contractService.list({ page:1, limit:200, apartmentId: Number(data.apartmentId) });
        setContracts((c as any)?.items ?? (c as any)?.data ?? c ?? []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không tải được phiếu thu/chi');
    }
  };

  const save = async () => {
    const errors: string[] = [];
    if (!form.buildingId) errors.push('Tòa nhà không được để trống');
    if (!form.apartmentId) errors.push('Căn hộ không được để trống');
    if (!form.title || String(form.title).trim() === '') errors.push('Tiêu đề không được để trống');
    if (!form.payerName || String(form.payerName).trim() === '') errors.push('Tên người nộp không được để trống');
    if (!form.date) errors.push('Ngày thực thu không được để trống');
    const items = form.items || [];
    if (!items || items.length === 0) {
      errors.push('Phải có ít nhất 1 hạng mục');
    } else {
      items.forEach((it:any, idx:number) => {
        if (!it.category || String(it.category).trim() === '') errors.push(`Hạng mục #${idx+1}: tên không được để trống`);
        if (it.amount === undefined || it.amount === null || String(it.amount).trim() === '') errors.push(`Hạng mục #${idx+1}: số tiền không được để trống`);
        else if (isNaN(Number(String(it.amount).replace(/,/g, '')))) errors.push(`Hạng mục #${idx+1}: số tiền không hợp lệ`);
      });
    }

    if (errors.length) { toast.error(errors.join('. ')); return; }

    try {
      const payload = { ...form };
      payload.items = (form.items || []).map((it:any)=>({ category: it.category, amount: it.amount || null, startDate: it.startDate || null, endDate: it.endDate || null }));
      if (isCreate) await thuChiService.create(payload);
      else await thuChiService.update(Number(idParam), payload);
      toast.success('Đã lưu');
      router.push('/admin/tai-chinh/thu-chi');
    } catch (err) {
      console.error(err);
      toast.error('Lưu thất bại');
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" /> 
            <div>
                <p className="text-sm text-slate-500">{isCreate? 'Thêm phiếu' : 'Chỉnh sửa phiếu'}</p>
                <h1 className="text-lg font-semibold">{isCreate? 'Tạo phiếu thu/chi' : 'Cập nhật phiếu'}</h1>
            </div>
          </div>
          <div>
            <button onClick={save} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white"><CheckCircle2 className="w-5 h-5"/> Lưu</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm">Loại</label>
              <select value={form.type} onChange={(e)=>setForm((s:any)=>({...s, type: e.target.value}))} className="mt-1 h-10 w-full border border-slate-200 rounded px-3">
                <option value="thu">Phiếu thu</option>
                <option value="chi">Phiếu chi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Tòa nhà<span className="text-red-500 ml-1">*</span></label>
              <select value={String(form.buildingId ?? '')} onChange={async (e)=>{ const v = Number(e.target.value) || ''; setForm((s:any)=>({...s, buildingId: v, apartmentId:'', contractId:'', items: [] })); if (v) { const a = await apartmentService.getAll({ page:1, limit:1000, buildingId: v }); setApartments((a as any)?.items ?? (a as any)?.data ?? a ?? []); } }} className="mt-1 h-10 w-full border border-slate-200 rounded px-3">
                <option value="">-- Chọn tòa nhà --</option>
                {buildings.map(b=> <option key={b.id} value={String(b.id)}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm">Căn hộ<span className="text-red-500 ml-1">*</span></label>
              <select value={String(form.apartmentId ?? '')} onChange={async (e)=>{ const v = Number(e.target.value) || ''; setForm((s:any)=>({...s, apartmentId: v, contractId:'', items: [] })); if (v) { const c = await contractService.list({ page:1, limit:200, apartmentId: v }); setContracts((c as any)?.items ?? (c as any)?.data ?? c ?? []); } }} className="mt-1 h-10 w-full border border-slate-200 rounded px-3">
                <option value="">-- Chọn căn hộ --</option>
                {apartments.map(a=> <option key={a.id} value={String(a.id)}>{a.title || a.code}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm">Hợp đồng</label>
              <select value={String(form.contractId ?? '')} onChange={(e)=>{ const v = e.target.value === '' ? '' : Number(e.target.value); setForm((s:any)=>({...s, contractId: v})); }} className="mt-1 h-10 w-full border border-slate-200 rounded px-3">
                <option value="">-- Chọn hợp đồng --</option>
                {contracts.map(c=> <option key={c.id} value={String(c.id)}>{c.id + (c.code || c.name ? ' - ' + (c.code || c.name) : '')}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm">Tiêu đề<span className="text-red-500 ml-1">*</span></label>
              <input value={form.title} onChange={(e)=>setForm((s:any)=>({...s, title: e.target.value}))} className="mt-1 h-10 w-full border border-slate-200 rounded px-3" />
            </div>

            <div>
              <label className="block text-sm">Tên người nộp<span className="text-red-500 ml-1">*</span></label>
              <input value={form.payerName} onChange={(e)=>setForm((s:any)=>({...s, payerName: e.target.value}))} className="mt-1 h-10 w-full border border-slate-200 rounded px-3" />
            </div>

            <div>
              <label className="block text-sm">Tài khoản</label>
              <input value={form.account} onChange={(e)=>setForm((s:any)=>({...s, account: e.target.value}))} className="mt-1 h-10 w-full border border-slate-200 rounded px-3" />
            </div>

            <div>
              <label className="block text-sm">Ngày thực thu</label>
              <input type="date" value={form.date} onChange={(e)=>setForm((s:any)=>({...s, date: e.target.value}))} className="mt-1 h-10 w-full border border-slate-200 rounded px-3" />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm">Ghi chú</label>
              <textarea value={form.note} onChange={(e)=>setForm((s:any)=>({...s, note: e.target.value}))} className="mt-1 w-full border border-slate-200 rounded px-3 py-2" />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm">Đính kèm</label>
              <UploadPicker value={form.attachments || null} onChange={(v)=>setForm((s:any)=>({...s, attachments: v || ''}))} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Hạng mục</h3>
            <button className="inline-flex items-center gap-2 bg-slate-700 text-white p-2 rounded-md" onClick={()=> setForm((s:any)=>({...s, items: [...(s.items||[]), { category: '', amount: '', startDate: '', endDate: '' }]}))}>Thêm</button>
          </div>
          <AdminTable headers={[
            <>Hạng mục<span className="text-red-500 ml-1">*</span></>,
            <>Số tiền<span className="text-red-500 ml-1">*</span></>,
            'Ngày bắt đầu',
            'Ngày kết thúc',
            ''
          ]}>
            {(form.items || []).length === 0 ? null : (form.items || []).map((it:any, idx:number)=> (
              <tr key={idx} className="border-t">
                <td className="px-4 py-3"><input value={it.category} onChange={(e)=>{ const v=e.target.value; setForm((s:any)=>{ const arr=[...s.items]; arr[idx]={...arr[idx], category: v}; return {...s, items: arr}; }) }} className="w-full border border-slate-200 rounded px-3" /></td>
                <td className="px-4 py-3"><input value={it.amount} onChange={(e)=>{ const v=e.target.value; setForm((s:any)=>{ const arr=[...s.items]; arr[idx]={...arr[idx], amount: v}; return {...s, items: arr}; }) }} className="w-full border border-slate-200 rounded px-3" /></td>
                <td className="px-4 py-3"><input type="date" value={it.startDate} onChange={(e)=>{ const v=e.target.value; setForm((s:any)=>{ const arr=[...s.items]; arr[idx]={...arr[idx], startDate: v}; return {...s, items: arr}; }) }} className="w-full border border-slate-200 rounded px-3" /></td>
                <td className="px-4 py-3"><input type="date" value={it.endDate} onChange={(e)=>{ const v=e.target.value; setForm((s:any)=>{ const arr=[...s.items]; arr[idx]={...arr[idx], endDate: v}; return {...s, items: arr}; }) }} className="w-full border border-slate-200 rounded px-3" /></td>
                <td className="px-4 py-3 text-right"><button className="p-2 rounded bg-red-600 text-white" onClick={()=> setForm((s:any)=>{ const arr=[...s.items]; arr.splice(idx,1); return {...s, items: arr}; })}> <Trash2 className="w-4 h-4" /> </button></td>
              </tr>
            ))}
          </AdminTable>
        </div>
      </div>
    </div>
  );
}
