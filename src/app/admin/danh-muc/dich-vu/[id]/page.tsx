"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, CheckCircle2, ChevronRight } from 'lucide-react';
import Spinner from '@/components/spinner';
import { useForm } from 'react-hook-form';
import { ServiceItem } from '@/type/service';
import { serviceService } from '@/services/serviceService';
import { buildingService } from '@/services/buildingService';
import { toast } from 'react-toastify';

export default function AdminServiceEditPage() {
  const params = useParams();
  const id = params?.id ?? '';
  const router = useRouter();
  const isEdit = useMemo(() => id !== 'create' && id !== 'new', [id]);
  const [loading, setLoading] = useState<boolean>(Boolean(isEdit));

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ServiceItem>({
    defaultValues: { name: '', feeType: 'service_fee', priceType: 'fixed', taxRate: '0', buildingId: undefined, note: '', unitPrice: '', unit: '' } as any
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      try {
        const s = await serviceService.get(Number(id));
        const data = s ?? {};
        reset({
          name: data.name ?? '',
          feeType: data.feeType ?? 'service_fee',
          priceType: data.priceType ?? 'fixed',
          taxRate: data.taxRate ?? '0',
          buildingId: data.buildingId ?? undefined,
          note: data.note ?? '',
          unitPrice: data.unitPrice ?? '',
          unit: data.unit ?? ''
        } as any);
      } catch (err) {
        console.error(err);
        toast.error('Không thể tải dịch vụ');
        router.replace('/admin/danh-muc/dich-vu');
      } finally { setLoading(false); }
    })();
  }, [id, isEdit, reset, router]);

  const [buildings, setBuildings] = useState<any[]>([]);
  const [buildingsLoading, setBuildingsLoading] = useState(false);
  useEffect(() => {
    (async () => {
      setBuildingsLoading(true);
      try {
        const res = await buildingService.getAll({ page: 1, limit: 200 });
        setBuildings(res.items || []);
      } catch (err) { setBuildings([]); }
      finally { setBuildingsLoading(false); }
    })();
  }, []);

  const onSubmit = async (data: ServiceItem) => {
    try {
      const payload: any = { ...data };
      if (payload.buildingId !== undefined && payload.buildingId !== null && payload.buildingId !== '') {
        const n = Number(payload.buildingId);
        if (!Number.isNaN(n)) payload.buildingId = n;
      }
      if (!isEdit) {
        const created = await serviceService.create(payload);
        if (created && (created as any).id) {
          toast.success('Tạo dịch vụ thành công');
          router.push('/admin/danh-muc/dich-vu');
          return;
        }
        toast.info((created as any)?.message ?? 'Đã tạo (không chắc chắn)');
        return;
      }

      await serviceService.update(Number(id), payload);
      toast.success('Cập nhật dịch vụ thành công');
      router.push('/admin/danh-muc/dich-vu');
    } catch (err: any) {
      console.error(err);
      const serverMsg = err?.response?.data?.message ?? err?.message;
      if (serverMsg) toast.error(String(serverMsg)); else toast.error('Lỗi khi lưu dịch vụ');
    }
  };

  if (isEdit && loading) return <div className="min-h-[260px] grid place-items-center"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-screen-lg">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">{isEdit ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới'}</p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">{isEdit ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ'}</h1>
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
            <button type="button" onClick={() => router.push('/admin/danh-muc/dich-vu')} className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">Hủy</button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 p-4">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-slate-700">Thông tin dịch vụ</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-600 mb-1">Tên dịch vụ <span className="text-red-600">*</span></label>
                  <input className="h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white" placeholder="VD: Tiền điện, Internet..." {...register('name', { required: 'Vui lòng nhập tên dịch vụ' })} />
                  {errors.name && <div className="text-sm text-red-600 mt-1">{(errors.name as any).message}</div>}
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Loại phí <span className="text-red-600">*</span></label>
                  <select className="h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white" {...register('feeType', { required: 'Vui lòng chọn loại phí' })}>
                    <option value="rent">Tiền nhà</option>
                    <option value="deposit">Tiền cọc</option>
                    <option value="water">Tiền nước</option>
                    <option value="electric">Tiền điện</option>
                    <option value="internet">Tiền internet</option>
                    <option value="cleaning">Tiền vệ sinh</option>
                    <option value="management_fee">Tiền phí quản lý</option>
                    <option value="parking">Tiền gửi xe</option>
                    <option value="service_fee">Tiền phí dịch vụ</option>
                    <option value="laundry">Tiền phí giặt sấy</option>
                    <option value="room_transfer_fee">Tiền phí nhượng phòng</option>
                    <option value="other">Khác</option>
                  </select>
                  {errors.feeType && <div className="text-sm text-red-600 mt-1">{(errors.feeType as any).message}</div>}
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Loại đơn giá <span className="text-red-600">*</span></label>
                  <select className="h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white" {...register('priceType', { required: 'Vui lòng chọn loại đơn giá' })}>
                    <option value="meter_fixed">Đơn giá cố định theo đồng hồ</option>
                    <option value="meter_quota">Đơn giá định mức theo đồng hồ</option>
                    <option value="fixed">Đơn giá cố định theo tháng</option>
                    <option value="percent">Đơn giá biến động</option>
                    <option value="quantity_quota">Định mức theo số lượng</option>
                  </select>
                  {errors.priceType && <div className="text-sm text-red-600 mt-1">{(errors.priceType as any).message}</div>}
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Đơn giá (VNĐ)</label>
                  <input type="number" step="0.01" min={0} className="h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white" placeholder="VD: 150000" {...register('unitPrice')} />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Đơn vị tính</label>
                  <select className="h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white" {...register('unit') }>
                    <option value="">-- Chọn đơn vị --</option>
                    <option value="phong">Phòng</option>
                    <option value="giuong">Giường</option>
                    <option value="kwh">Kwh</option>
                    <option value="m3">m3</option>
                    <option value="m2">m2</option>
                    <option value="xe">Xe</option>
                    <option value="luot">Lượt/Lần</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Thuế suất (%) <span className="text-red-600">*</span></label>
                  <input type="number" step="0.01" min={0} className="h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white" placeholder="0" {...register('taxRate', { 
                    required: 'Vui lòng nhập thuế suất',
                    validate: (v) => {
                      if (v === undefined || v === null || v === '') return 'Vui lòng nhập thuế suất';
                      const num = Number(v);
                      if (Number.isNaN(num)) return 'Thuế suất phải là số';
                      if (num < 0) return 'Thuế suất không được âm';
                      return true;
                    }
                  })} />
                  {errors.taxRate && <div className="text-sm text-red-600 mt-1">{(errors.taxRate as any).message}</div>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-600 mb-1">Tòa nhà sử dụng <span className="text-red-600">*</span></label>
                  <select className="h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white" {...register('buildingId', { required: 'Vui lòng chọn tòa nhà' })} disabled={buildingsLoading}>
                    {buildingsLoading ? (
                      <option value="">Đang tải…</option>
                    ) : (
                      <>
                        {buildings.map(b => (<option key={b.id} value={String(b.id)}>{`${b.id}-${String((b as any).name ?? (b as any).title ?? b.id)}`}</option>))}
                      </>
                    )}
                  </select>
                  {errors.buildingId && <div className="text-sm text-red-600 mt-1">{(errors.buildingId as any).message}</div>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-600 mb-1">Ghi chú</label>
                  <textarea className="w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 p-3 bg-white" {...register('note')} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
