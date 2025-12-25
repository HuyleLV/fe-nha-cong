"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import { useForm } from 'react-hook-form';
import { serviceRequestService } from '@/services/serviceRequestService';
import { buildingService } from '@/services/buildingService';
import { apartmentService } from '@/services/apartmentService';
import { contractService } from '@/services/contractService';
import Spinner from '@/components/spinner';
import { toast } from 'react-toastify';
import { Save, CheckCircle2 } from 'lucide-react';

export default function ServiceRequestEditPage() {
  const params = useParams();
  const id = params?.id ?? '';
  const router = useRouter();
  const isEdit = useMemo(() => id !== 'create' && id !== 'new', [id]);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<any>({ defaultValues: { title: '', description: '', amount: undefined, requestedAt: '', status: 'pending', buildingId: undefined, apartmentId: undefined, customerId: undefined } });

  const [loading, setLoading] = useState<boolean>(Boolean(isEdit));
  // dependent selects data
  const [buildings, setBuildings] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [apartmentsLoading, setApartmentsLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (isEdit) {
        setLoading(true);
        try {
          const it = await serviceRequestService.get(Number(id));
          reset({
            title: it?.title ?? '',
            description: it?.description ?? '',
            amount: it?.amount ?? undefined,
            requestedAt: it?.requestedAt ? new Date(it.requestedAt).toISOString().slice(0,16) : '',
            status: it?.status ?? 'pending',
            buildingId: it?.buildingId ?? undefined,
            apartmentId: it?.apartmentId ?? undefined,
            customerId: it?.customerId ?? undefined,
          });
          // preload apartments/customers if building/apartment exist
          if (it?.buildingId) {
            try { const aRes = await apartmentService.getAll({ page:1, limit:500, buildingId: it.buildingId }); setApartments(aRes.items || []); } catch { setApartments([]); }
          }
          if (it?.apartmentId) {
            try {
              setCustomersLoading(true);
              const cRes = await contractService.list({ page:1, limit:500, apartmentId: it.apartmentId });
              const items = cRes.data || [];
              const mapped = items.map((c:any) => {
                if (c.customer) return { id: c.customer.id, name: c.customer.name ?? c.customer.email ?? `#${c.customer.id}`, phone: c.customer.phone ?? '' };
                if (c.customerId) return { id: c.customerId, name: c.customerName ?? `#${c.customerId}`, phone: c.customerPhone ?? '' };
                return null;
              }).filter(Boolean) as any[];
              // unique by id
              const uniq: any[] = [];
              const seen = new Set();
              for (const m of mapped) {
                if (!seen.has(m.id)) { seen.add(m.id); uniq.push(m); }
              }
              setCustomers(uniq);
            } catch (e) { setCustomers([]); }
            finally { setCustomersLoading(false); }
          }
        } catch (err) { console.error(err); toast.error('Không thể tải yêu cầu dịch vụ'); router.back(); }
        finally { setLoading(false); }
      }
    })();
  }, [id]);

  useEffect(() => {
    // load buildings on mount
    (async () => {
      try {
        const b = await buildingService.getAll({ page:1, limit:500 });
        setBuildings(b.items || []);
      } catch (e) { setBuildings([]); }
    })();
  }, []);

  const inputCls = "h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white";

  const loadApartments = async (buildingId?: number) => {
    if (!buildingId) { setApartments([]); return; }
    try {
      setApartmentsLoading(true);
      const res = await apartmentService.getAll({ page:1, limit:500, buildingId });
      setApartments(res.items || []);
    } catch (e) { setApartments([]); }
    finally { setApartmentsLoading(false); }
  };

  const loadCustomersForApartment = async (apartmentId?: number) => {
    setCustomers([]);
    if (!apartmentId) return;
    try {
      setCustomersLoading(true);
      const cRes = await contractService.list({ page:1, limit:500, apartmentId });
      const items = cRes.data || [];
      const mapped = items.map((c:any) => {
        if (c.customer) return { id: c.customer.id, name: c.customer.name ?? c.customer.email ?? `#${c.customer.id}`, phone: c.customer.phone ?? '' };
        if (c.customerId) return { id: c.customerId, name: c.customerName ?? `#${c.customerId}`, phone: c.customerPhone ?? '' };
        return null;
      }).filter(Boolean) as any[];
      const uniq: any[] = [];
      const seen = new Set();
      for (const m of mapped) { if (!seen.has(m.id)) { seen.add(m.id); uniq.push(m); } }
      setCustomers(uniq);
    } catch (e) { setCustomers([]); }
    finally { setCustomersLoading(false); }
  };

  const onSubmit = async (data: any) => {
    try {
      const payload: any = {
        title: data.title || null,
        description: data.description || null,
        amount: data.amount ?? null,
        requestedAt: data.requestedAt ? new Date(data.requestedAt).toISOString() : null,
        status: data.status || 'pending',
        buildingId: data.buildingId ?? null,
        apartmentId: data.apartmentId ?? null,
        customerId: data.customerId ?? null,
      };

      if (!isEdit) {
        await serviceRequestService.create(payload);
        toast.success('Tạo yêu cầu dịch vụ thành công');
        router.push('/quan-ly-chu-nha/cu-dan/yeu-cau-dich-vu');
        return;
      }

      await serviceRequestService.update(Number(id), payload);
      toast.success('Cập nhật yêu cầu dịch vụ thành công');
      router.push('/quan-ly-chu-nha/cu-dan/yeu-cau-dich-vu');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? 'Lỗi khi lưu yêu cầu');
    }
  };

  if (isEdit && loading) return <div className="min-h-[240px] grid place-items-center"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-screen-lg">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">{isEdit ? 'Chỉnh sửa yêu cầu dịch vụ' : 'Tạo yêu cầu dịch vụ'}</p>
              <h1 className="text-lg font-semibold text-slate-800">{isEdit ? 'Chỉnh sửa yêu cầu dịch vụ' : 'Tạo yêu cầu dịch vụ'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(onSubmit)()}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmitting ? (<><Spinner /> <span>Đang lưu…</span></>) : (<><CheckCircle2 className="w-5 h-5" /> <span>{isEdit ? 'Cập nhật' : 'Tạo mới'}</span></>)}
            </button>
            <button
              type="button"
              onClick={() => {
                // prefer going back to previous page; fallback to the list
                if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/quan-ly-chu-nha/cu-dan/yeu-cau-dich-vu');
                }
              }}
              className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
            >Hủy</button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 p-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tiêu đề <span className="text-red-600">*</span></label>
              <input className="h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white" {...register('title', { required: 'Vui lòng nhập tiêu đề' })} />
              {errors.title && <div className="text-sm text-red-600 mt-1">{(errors.title as any).message}</div>}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Tòa nhà <span className="text-red-600">*</span></label>
              {/** register and keep custom onChange to load apartments */}
              {(() => {
                const reg = register('buildingId', { required: 'Vui lòng chọn tòa nhà' });
                return (
                  <select
                    {...reg}
                    className={inputCls}
                    value={String(watch('buildingId') ?? '')}
                    onChange={(e) => {
                      reg.onChange(e as any);
                      const v = e.target.value === '' ? undefined : Number(e.target.value);
                      // reset downstream
                      setValue('apartmentId', undefined as any);
                      setApartments([]);
                      setValue('customerId', undefined as any);
                      setCustomers([]);
                      if (v) loadApartments(v);
                    }}
                  >
                    <option value="">— Chọn tòa nhà —</option>
                    {buildings.map((b: any) => (<option key={b.id} value={String(b.id)}>{b.name || b.title || `#${b.id}`}</option>))}
                  </select>
                );
              })()}
              {errors.buildingId && <div className="text-sm text-red-600 mt-1">{(errors.buildingId as any).message}</div>}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Căn hộ <span className="text-red-600">*</span></label>
              {(() => {
                const reg = register('apartmentId', { required: 'Vui lòng chọn căn hộ' });
                return (
                  <select
                    {...reg}
                    className={inputCls}
                    value={String(watch('apartmentId') ?? '')}
                    onChange={(e) => {
                      reg.onChange(e as any);
                      const v = e.target.value === '' ? undefined : Number(e.target.value);
                      setValue('customerId', undefined as any);
                      setCustomers([]);
                      if (v) loadCustomersForApartment(v);
                    }}
                    disabled={!watch('buildingId') || apartmentsLoading}
                  >
                    <option value="">— Chọn căn hộ —</option>
                    {apartmentsLoading ? (<option>Đang tải...</option>) : apartments.map((a:any) => (<option key={a.id} value={String(a.id)}>{a.name ?? a.title ?? a.code ?? `#${a.id}`}</option>))}
                  </select>
                );
              })()}
              {errors.apartmentId && <div className="text-sm text-red-600 mt-1">{(errors.apartmentId as any).message}</div>}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Khách hàng</label>
              <select
                className={inputCls}
                value={String(watch('customerId') ?? '')}
                onChange={(e) => setValue('customerId', e.target.value === '' ? undefined as any : Number(e.target.value) as any)}
                disabled={!watch('apartmentId') || customersLoading}
              >
                <option value="">— Chọn khách hàng —</option>
                {customersLoading ? (<option>Đang tải...</option>) : customers.map(c => (<option key={c.id} value={String(c.id)}>{c.name}{c.phone ? ' • ' + c.phone : ''}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Giá</label>
              <input type="number" className="h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white" {...register('amount')} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Mô tả</label>
              <textarea className="w-full rounded-lg border border-slate-300/80 px-3 py-2" rows={4} {...register('description')}></textarea>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Thời gian yêu cầu</label>
              <input type="datetime-local" className="h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white" {...register('requestedAt')} />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Trạng thái</label>
              <select className="h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white" {...register('status')}>
                <option value="pending">Chờ xử lý</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="done">Hoàn thành</option>
                <option value="cancelled">Hủy</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
