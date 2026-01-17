"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { depositService } from '@/services/depositService';
import UploadPicker from '@/components/UploadPicker';
import { buildingService } from '@/services/buildingService';
import { apartmentService } from '@/services/apartmentService';
import type { Building } from '@/type/building';
import type { Apartment } from '@/type/apartment';
import { toast } from 'react-toastify';
import { userService } from '@/services/userService';
import type { User } from '@/type/user';
import { Save, CheckCircle2, ChevronRight } from 'lucide-react';
import Spinner from '@/components/spinner';

type FormData = {
  status?: string;
  buildingId?: number | string;
  apartmentId?: number | string;
  customerId?: number | string;
  customerInfo?: string;
  occupantsCount?: number;
  rentAmount?: number;
  depositAmount?: number;
  depositDate?: string;
  moveInDate?: string;
  billingStartDate?: string;
  contractDuration?: string;
  rentFrom?: string;
  rentTo?: string;
  paymentCycle?: string;
  account?: string;
  note?: string;
  attachments?: any;
};

export default function DepositEditPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id as string | undefined;
  const id = idParam === 'new' ? undefined : (idParam ? Number(idParam) : undefined);
  const isEdit = useMemo(() => typeof id !== 'undefined' && !Number.isNaN(id), [id]);

  const [loading, setLoading] = useState<boolean>(Boolean(isEdit));

  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting, dirtyFields, errors } } = useForm<FormData>({
    defaultValues: { status: 'pending', buildingId: undefined, apartmentId: undefined, customerId: undefined, customerInfo: '', occupantsCount: 1, rentAmount: 0, depositAmount: 0, depositDate: '', moveInDate: '', billingStartDate: '', contractDuration: '', rentFrom: '', rentTo: '', paymentCycle: '', account: '', note: '', attachments: '' }
  });

  const inputCls = "h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white";

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [meId, setMeId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await buildingService.getAll({ page: 1, limit: 200 });
        setBuildings(res.items ?? []);
      } catch (err) {
        console.error('Không thể tải tòa nhà', err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await userService.getProfile();
        if (me && (me as any).id) setMeId((me as any).id);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const params: any = { page: 1, limit: 1000 };
        if (meId) params.ownerId = meId;
        const res = await userService.listAdminUsers(params);
        setCustomers((res.data ?? []) as User[]);
      } catch (err) {
        console.error('Không thể tải khách hàng', err);
      }
    })();
  }, [meId]);

  useEffect(() => {
    const bId = watch('buildingId');
    if (!bId) {
      setApartments([]);
      return;
    }
    (async () => {
      try {
        const res = await apartmentService.getAll({ page: 1, limit: 500, buildingId: Number(bId) });
        setApartments(res.items ?? []);
      } catch (err) {
        console.error('Không thể tải căn hộ', err);
        setApartments([]);
      }
    })();
  }, [watch('buildingId')]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      try {
        const res = await depositService.get(Number(id));
        const d = res?.data ?? res;
        reset({
          status: d.status ?? 'pending',
          buildingId: d.buildingId ?? undefined,
          apartmentId: d.apartmentId ?? undefined,
          customerId: d.customerId ?? undefined,
          customerInfo: d.customerInfo ?? '',
          occupantsCount: d.occupantsCount ?? 1,
          rentAmount: d.rentAmount ?? 0,
          depositAmount: d.depositAmount ?? 0,
          depositDate: d.depositDate ? new Date(d.depositDate).toISOString().slice(0, 10) : '',
          moveInDate: d.moveInDate ? new Date(d.moveInDate).toISOString().slice(0, 10) : '',
          billingStartDate: d.billingStartDate ? new Date(d.billingStartDate).toISOString().slice(0, 10) : '',
          contractDuration: d.contractDuration ?? '',
          rentFrom: d.rentFrom ?? '',
          rentTo: d.rentTo ?? '',
          paymentCycle: d.paymentCycle ?? '',
          account: d.account ?? '',
          note: d.note ?? '',
          attachments: d.attachments ?? ''
        });
      } catch (err) {
        console.error(err);
        toast.error('Không thể tải dữ liệu đặt cọc');
        router.push('/admin/khach-hang/dat-coc');
      } finally { setLoading(false); }
    })();
  }, [id, isEdit, reset, router]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload: any = { ...data };
      const intFields = ['buildingId', 'apartmentId', 'customerId', 'occupantsCount', 'contractDuration', 'paymentCycle'];
      for (const f of intFields) {
        const v = (payload as any)[f];
        if (v === '' || v === null || v === undefined) {
          delete (payload as any)[f];
        } else {
          const n = Number(v);
          if (!Number.isNaN(n)) (payload as any)[f] = n;
        }
      }
      if (payload.rentAmount !== undefined && payload.rentAmount !== null && payload.rentAmount !== '') payload.rentAmount = Number(payload.rentAmount);
      if (payload.depositAmount !== undefined && payload.depositAmount !== null && payload.depositAmount !== '') payload.depositAmount = Number(payload.depositAmount);

      if (isEdit) {
        await depositService.update(Number(id), payload);
        toast.success('Cập nhật đặt cọc thành công');
      } else {
        const created = await depositService.create(payload);
        if (created && (created as any).id) {
          toast.success('Tạo đặt cọc thành công');
        } else if (created && (created as any).message) {
          toast.info((created as any).message);
          return;
        }
      }
      router.push('/admin/khach-hang/dat-coc');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi lưu đặt cọc');
    }
  };

  const handleSave = async () => {
    try {
      await handleSubmit(onSubmit)();
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi khi lưu dữ liệu');
    }
  };

  if (isEdit && loading) return <div className="min-h-[260px] grid place-items-center"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-screen-xl">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">{isEdit ? 'Sửa đặt cọc' : 'Tạo đặt cọc mới'}</p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">{isEdit ? `Sửa đặt cọc #${id}` : 'Tạo đặt cọc'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmitting ? (<><Spinner /> <span>Đang lưu…</span></>) : (<><CheckCircle2 className="w-5 h-5" /> <span>{isEdit ? 'Cập nhật' : 'Tạo mới'}</span></>)}
            </button>
            <button type="button" onClick={() => router.push('/admin/khach-hang/dat-coc')} className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">Hủy</button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 p-4">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-slate-700">Chi tiết đặt cọc</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEdit && (
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Mã đặt cọc</label>
                    <div className="text-sm text-slate-700 font-medium">#{id}</div>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Trạng thái</label>
                  <select className={inputCls} {...register('status')}>
                    <option value="pending">Chờ ký hợp đồng</option>
                    <option value="signed">Đã ký hợp đồng</option>
                    <option value="cancelled">Bỏ cọc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Tòa nhà</label>
                  <select
                    className={inputCls}
                    {...register('buildingId')}
                    value={watch('buildingId') ?? ''}
                    onChange={(e) => setValue('buildingId', e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">-- Chọn tòa nhà --</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} (#{b.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Căn hộ</label>
                  <select className={inputCls} {...register('apartmentId')} value={watch('apartmentId') ?? ''} onChange={(e) => setValue('apartmentId', e.target.value ? Number(e.target.value) : undefined)}>
                    <option value="">-- Chọn căn hộ --</option>
                    {apartments.map((a) => (
                      <option key={a.id} value={a.id}>{a.title ?? `#${a.id}`}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Khách</label>
                  <select className={inputCls} {...register('customerId')} value={watch('customerId') ?? ''} onChange={(e) => setValue('customerId', e.target.value ? Number(e.target.value) : undefined)}>
                    <option value="">-- Chọn khách --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name ?? `#${c.id}`} {c.phone ? `— ${c.phone}` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Số người ở</label>
                  <input type="number" className={inputCls} {...register('occupantsCount')} />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Tiền thuê</label>
                  <input type="number" className={inputCls} {...register('rentAmount')} />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Tiền cọc</label>
                  <input type="number" className={inputCls} {...register('depositAmount')} />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Ngày đặt cọc</label>
                  <input type="date" className={inputCls} {...register('depositDate', { required: 'Vui lòng chọn ngày đặt cọc' })} />
                  {errors.depositDate && <div className="text-sm text-red-600 mt-1">{errors.depositDate.message}</div>}
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Ngày chuyển vào</label>
                  <input type="date" className={inputCls} {...register('moveInDate', { required: 'Vui lòng chọn ngày chuyển vào' })} />
                  {errors.moveInDate && <div className="text-sm text-red-600 mt-1">{errors.moveInDate.message}</div>}
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Ngày bắt đầu tính tiền</label>
                  <input type="date" className={inputCls} {...register('billingStartDate', { required: 'Vui lòng chọn ngày bắt đầu tính tiền' })} />
                  {errors.billingStartDate && <div className="text-sm text-red-600 mt-1">{errors.billingStartDate.message}</div>}
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Thời gian hợp đồng</label>
                  <select className={inputCls} {...register('contractDuration')}>
                    {Array.from({ length: 12 }).map((_, i) => {
                      const m = i + 1;
                      return (
                        <option key={m} value={String(m)}>{m} tháng</option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Thuê từ ngày</label>
                  <input type="date" className={inputCls} {...register('rentFrom', { required: 'Vui lòng chọn ngày thuê từ' })} />
                  {errors.rentFrom && <div className="text-sm text-red-600 mt-1">{errors.rentFrom.message}</div>}
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Thuê đến ngày</label>
                  <input type="date" className={inputCls} {...register('rentTo', { required: 'Vui lòng chọn ngày thuê đến' })} />
                  {errors.rentTo && <div className="text-sm text-red-600 mt-1">{errors.rentTo.message}</div>}
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Chu kỳ thanh toán</label>
                  <select className={inputCls} {...register('paymentCycle')}>
                    {Array.from({ length: 12 }).map((_, i) => {
                      const m = i + 1;
                      return (
                        <option key={m} value={String(m)}>{m} tháng</option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Tài khoản</label>
                  <input className={inputCls} {...register('account')} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-600 mb-1">Ghi chú</label>
                  <textarea className="w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 p-3 bg-white" {...register('note')} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-600 mb-1">Tệp đính kèm</label>
                  <UploadPicker value={watch('attachments')} onChange={(v) => setValue('attachments', v)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
