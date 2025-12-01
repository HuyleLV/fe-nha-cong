"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import { useForm } from 'react-hook-form';
import { vehicleService } from '@/services/vehicleService';
import { buildingService } from '@/services/buildingService';
import { apartmentService } from '@/services/apartmentService';
import { userService } from '@/services/userService';
import UploadPicker from '@/components/UploadPicker';
import Spinner from '@/components/spinner';
import { toast } from 'react-toastify';
import { Save, CheckCircle2 } from 'lucide-react';

export default function VehicleEditPage(){
  const params = useParams();
  const id = params?.id ?? '';
  const router = useRouter();
  const isEdit = useMemo(() => id !== 'create' && id !== 'new', [id]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<any>({
    defaultValues: { type: '', model: '', color: '', plateNumber: '', ownerName: '', ticketNumber: '', buildingId: undefined, apartmentId: undefined, customerId: undefined, photo: '' }
  });

  const inputCls = "h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white";

  const [loading, setLoading] = useState<boolean>(Boolean(isEdit));
  const [buildings, setBuildings] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const loadBuildings = async () => {
    try { const res = await buildingService.getAll({ page:1, limit:500 }); setBuildings(res.items || []); } catch (err) { setBuildings([]); }
  };
  const loadApartments = async (buildingId?: number) => {
    try { if (!buildingId) { setApartments([]); return; } const res = await apartmentService.getAll({ page:1, limit:1000, buildingId }); setApartments(res.items || []); } catch (err) { setApartments([]); }
  };
  const loadCustomers = async () => {
    try { const res = await userService.listAdminUsers({ page:1, limit:500 }); setCustomers(res.data || []); } catch (err) { setCustomers([]); }
  };

  useEffect(() => {
    (async () => {
      await loadBuildings();
      await loadCustomers();
      if (isEdit) {
        setLoading(true);
        try {
          const v = await vehicleService.get(Number(id));
          const data = v ?? {};
          reset({
            type: data.type ?? '',
            model: data.model ?? '',
            color: data.color ?? '',
            plateNumber: data.plateNumber ?? '',
            ownerName: data.ownerName ?? '',
            ticketNumber: data.ticketNumber ?? '',
            buildingId: data.buildingId ?? undefined,
            apartmentId: data.apartmentId ?? undefined,
            customerId: data.customerId ?? undefined,
            photo: data.photo ?? '',
          });
          if (data.buildingId) await loadApartments(Number(data.buildingId));
        } catch (err) { console.error(err); toast.error('Không thể tải phương tiện'); router.back(); }
        finally { setLoading(false); }
      }
    })();
  }, [id]);

  useEffect(() => {
    const sub = watch((value, { name }) => {
      if (name === 'buildingId') {
        const b = value.buildingId;
        loadApartments(b ? Number(b) : undefined);
      }
    });
    return () => sub.unsubscribe && sub.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: any) => {
    try {
      const payload: any = {
        type: data.type || null,
        model: data.model || null,
        color: data.color || null,
        plateNumber: data.plateNumber || null,
        ownerName: data.ownerName || null,
        ticketNumber: data.ticketNumber || null,
        buildingId: data.buildingId ?? null,
        apartmentId: data.apartmentId ?? null,
        customerId: data.customerId ?? null,
        photo: data.photo || null,
      };

      if (!isEdit) {
        const created = await vehicleService.create(payload);
        toast.success('Tạo phương tiện thành công');
        router.push('/quan-ly-chu-nha/khach-hang/phuong-tien');
        return;
      }

      await vehicleService.update(Number(id), payload);
      toast.success('Cập nhật phương tiện thành công');
      router.push('/quan-ly-chu-nha/khach-hang/phuong-tien');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? 'Lỗi khi lưu phương tiện');
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
              <p className="text-sm text-slate-500">{isEdit ? 'Chỉnh sửa phương tiện' : 'Thêm phương tiện'}</p>
              <h1 className="text-lg font-semibold text-slate-800">{isEdit ? 'Chỉnh sửa phương tiện' : 'Thêm phương tiện'}</h1>
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
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 p-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Loại phương tiện <span className="text-red-600">*</span></label>
              <select className={inputCls} {...register('type', { required: 'Vui lòng chọn loại phương tiện' })}>
                <option value="">-- Chọn loại --</option>
                <option value="oto">Ô tô</option>
                <option value="xe_may">Xe máy</option>
                <option value="xe_dap">Xe đạp</option>
              </select>
              {errors.type && <div className="text-sm text-red-600 mt-1">{(errors.type as any).message}</div>}
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tên dòng xe <span className="text-red-600">*</span></label>
              <input className={inputCls} {...register('model', { required: 'Vui lòng nhập tên dòng xe' })} />
              {errors.model && <div className="text-sm text-red-600 mt-1">{(errors.model as any).message}</div>}
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Màu xe <span className="text-red-600">*</span></label>
              <input className={inputCls} {...register('color', { required: 'Vui lòng nhập màu xe' })} />
              {errors.color && <div className="text-sm text-red-600 mt-1">{(errors.color as any).message}</div>}
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Biển số <span className="text-red-600">*</span></label>
              <input className={inputCls} {...register('plateNumber', { required: 'Vui lòng nhập biển số' })} />
              {errors.plateNumber && <div className="text-sm text-red-600 mt-1">{(errors.plateNumber as any).message}</div>}
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tên chủ xe</label>
              <input className={inputCls} {...register('ownerName')} />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Số vé</label>
              <input className={inputCls} {...register('ticketNumber')} />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Tòa nhà <span className="text-red-600">*</span></label>
              <select className={inputCls} {...register('buildingId', { required: 'Vui lòng chọn tòa nhà' })}>
                <option value="">-- Chọn tòa nhà --</option>
                {buildings.map(b => (<option key={b.id} value={String(b.id)}>{b.name || b.title || `Tòa #${b.id}`}</option>))}
              </select>
              {errors.buildingId && <div className="text-sm text-red-600 mt-1">{(errors.buildingId as any).message}</div>}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Căn hộ <span className="text-red-600">*</span></label>
              <select className={inputCls} {...register('apartmentId', { required: 'Vui lòng chọn căn hộ' })}>
                <option value="">-- Chọn căn hộ --</option>
                {apartments.map(a => (<option key={a.id} value={String(a.id)}>{a.title || `Căn #${a.id}`}</option>))}
              </select>
              {errors.apartmentId && <div className="text-sm text-red-600 mt-1">{(errors.apartmentId as any).message}</div>}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Khách hàng <span className="text-red-600">*</span></label>
              <select className={inputCls} {...register('customerId', { required: 'Vui lòng chọn khách hàng' })}>
                <option value="">-- Chọn khách hàng --</option>
                {customers.map((c: any) => (<option key={c.id} value={String(c.id)}>{c.name || c.email || `#${c.id}`}</option>))}
              </select>
              {errors.customerId && <div className="text-sm text-red-600 mt-1">{(errors.customerId as any).message}</div>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Ảnh phương tiện</label>
              <UploadPicker value={watch('photo') || null} onChange={(v) => setValue('photo', v)} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
