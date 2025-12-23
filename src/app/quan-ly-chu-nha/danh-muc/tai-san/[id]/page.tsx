"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { Save, CheckCircle2, ChevronRight } from "lucide-react";
import Spinner from "@/components/spinner";
import { assetService } from "@/services/assetService";
import { buildingService } from "@/services/buildingService";
import { apartmentService } from "@/services/apartmentService";
import { bedService } from "@/services/bedService";
import UploadPicker from "@/components/UploadPicker";

type Form = {
  name: string;
  brand?: string;
  color?: string;
  modelOrYear?: string;
  origin?: string;
  value?: string;
  quantity?: number;
  status?: string;
  warrantyPeriod?: string;
  purchaseDate?: string;
  manufacturerWarrantyDate?: string;
  ownerWarrantyMonths?: number | '';
  buildingId?: number | null;
  apartmentId?: number | null;
  bedId?: number | null;
  notes?: string;
  images?: string;
};

const inputCls =
  "h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
      <ChevronRight className="w-4 h-4 text-slate-400" />
      <h3 className="font-semibold text-slate-700">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

function ManufacturerWarrantyStatus({ control }: { control: any }) {
  // watch manufacturerWarrantyDate and display whether in warranty
  const mDate = useWatch({ control, name: 'manufacturerWarrantyDate' }) as string | undefined;
  if (!mDate) return null;
  try {
    const today = new Date();
    // normalize to start of day for comparison
    const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(mDate);
    const inWarranty = end >= now;
    return (<div className="mt-2 text-sm font-medium" style={{ color: inWarranty ? '#059669' : '#dc2626' }}>{inWarranty ? 'Còn bảo hành' : 'Hết bảo hành'}</div>);
  } catch (e) {
    return null;
  }
}

export default function AssetFormPage() {
  const { id } = useParams() as { id: string };
  const isEdit = useMemo(() => id !== "create", [id]);
  const router = useRouter();

  const { register, handleSubmit, reset, control, formState: { isSubmitting, errors, dirtyFields } } = useForm<Form>({
    defaultValues: { name: "", brand: "", color: "", modelOrYear: "", origin: "", value: "", quantity: 1, status: 'available', warrantyPeriod: '', purchaseDate: '', manufacturerWarrantyDate: '', ownerWarrantyMonths: '', buildingId: undefined, apartmentId: undefined, bedId: undefined, notes: '', images: '' },
  });

  const [loading, setLoading] = useState<boolean>(isEdit);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await buildingService.getAll({ page: 1, limit: 200 });
        setBuildings(res.items || []);
      } catch (e) {
        setBuildings([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      try {
        const a = await assetService.getById(Number(id));
        const strip = (v?: string | null) => (v == null ? '' : String(v).replace(/\.0+$/, ''));
        reset({
          name: a.name || '',
          brand: a.brand || '',
          color: a.color || '',
          modelOrYear: a.modelOrYear || '',
          origin: a.origin || '',
          value: a.value ? strip(a.value) : '',
          quantity: a.quantity ?? 1,
          status: a.status || 'available',
          warrantyPeriod: a.warrantyPeriod || '',
          purchaseDate: (a as any).purchaseDate ? String((a as any).purchaseDate).split('T')[0] : '',
          manufacturerWarrantyDate: (a as any).manufacturerWarrantyDate ? String((a as any).manufacturerWarrantyDate).split('T')[0] : '',
          ownerWarrantyMonths: (a as any).ownerWarrantyMonths ?? '',
          buildingId: (a as any).buildingId ?? undefined,
          apartmentId: (a as any).apartmentId ?? undefined,
          bedId: (a as any).bedId ?? undefined,
          notes: a.notes || '',
          images: a.images || '',
        });

        // load dependent lists
        if ((a as any).buildingId) {
          const r = await apartmentService.getAll({ buildingId: (a as any).buildingId, page: 1, limit: 200 });
          setApartments(r.items || []);
        }
        if ((a as any).apartmentId) {
          const r2 = await bedService.getAll({ apartmentId: (a as any).apartmentId, page: 1, limit: 200 });
          setBeds(r2.items || []);
        }
      } catch (err) {
        toast.error('Không tải được tài sản');
        router.replace('/quan-ly-chu-nha/danh-muc/tai-san');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, reset, router]);

  const onBuildingChange = async (bid?: number) => {
    if (!bid) {
      setApartments([]); setBeds([]);
      return;
    }
    try {
      const res = await apartmentService.getAll({ buildingId: bid, page: 1, limit: 200 });
      setApartments(res.items || []);
    } catch (e) {
      setApartments([]);
    }
  };

  const onApartmentChange = async (apid?: number) => {
    if (!apid) { setBeds([]); return; }
    try {
      const res = await bedService.getAll({ apartmentId: apid, page: 1, limit: 200 });
      setBeds(res.items || []);
    } catch (e) { setBeds([]); }
  };

  const onSubmit = async (vals: Form) => {
    try {
  const payload: any = { ...vals };
      // normalize numeric fields
      payload.quantity = payload.quantity ? Number(payload.quantity) : 1;
  payload.value = payload.value ? String(payload.value) : undefined;
  // normalize date/warranty fields
  payload.purchaseDate = payload.purchaseDate ? String(payload.purchaseDate) : undefined;
  payload.manufacturerWarrantyDate = payload.manufacturerWarrantyDate ? String(payload.manufacturerWarrantyDate) : undefined;
  payload.ownerWarrantyMonths = payload.ownerWarrantyMonths === '' || payload.ownerWarrantyMonths == null ? undefined : Number(payload.ownerWarrantyMonths);
      if (payload.buildingId === "" || payload.buildingId === undefined) payload.buildingId = undefined;
      if (payload.apartmentId === "" || payload.apartmentId === undefined) payload.apartmentId = undefined;
      if (payload.bedId === "" || payload.bedId === undefined) payload.bedId = undefined;

      if (isEdit) {
        await assetService.update(Number(id), payload);
        toast.success('Cập nhật tài sản thành công');
        router.push('/quan-ly-chu-nha/danh-muc/tai-san');
      } else {
        const created = await assetService.create(payload);
        toast.success('Tạo tài sản thành công');
        router.push('/quan-ly-chu-nha/danh-muc/tai-san');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi lưu tài sản');
    }
  };

  if (isEdit && loading) return <div className="min-h-[300px] grid place-items-center"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-screen-xl">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">{isEdit ? 'Chỉnh sửa tài sản' : 'Tạo tài sản mới'}</p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">{(dirtyFields && Object.keys(dirtyFields).length) ? 'Thay đổi chưa lưu' : (isEdit ? 'Chỉnh sửa tài sản' : 'Tạo tài sản')}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmitting ? (<><Spinner /> <span>Đang lưu…</span></>) : (<><CheckCircle2 className="w-5 h-5" /> <span>{isEdit ? 'Cập nhật' : 'Tạo mới'}</span></>)}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Thông tin cơ bản">
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Tên tài sản</label>
                <input className={inputCls} {...register('name', { required: 'Vui lòng nhập tên tài sản' })} />
                {errors.name && <p className="text-red-600 text-sm mt-1">{String(errors.name.message)}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Thương hiệu</label>
                  <input className={inputCls} {...register('brand')} />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Màu</label>
                  <input className={inputCls} {...register('color')} />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Model / Năm</label>
                  <input className={inputCls} {...register('modelOrYear')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Xuất xứ</label>
                  <input className={inputCls} {...register('origin')} />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Giá trị (VND)</label>
                  <input inputMode="numeric" className={inputCls} {...register('value')} />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Số lượng</label>
                  <input type="number" min={1} className={inputCls} {...register('quantity', { valueAsNumber: true })} />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Ghi chú</label>
                <textarea className="w-full rounded-lg border border-slate-300/80 p-3" rows={4} {...register('notes')} />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Hình ảnh</label>
                <Controller
                  control={control}
                  name="images"
                  render={({ field }) => (
                    <UploadPicker value={field.value || null} onChange={(v) => field.onChange(v || '')} />
                  )}
                />
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Phân vị trí">
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Tòa nhà</label>
                <Controller
                  control={control}
                  name="buildingId"
                  render={({ field }) => (
                    <select className={inputCls} value={field.value === undefined || field.value === null ? "" : String(field.value)} onChange={async (e) => { const v = e.target.value; const parsed = v === "" ? undefined : Number(v); field.onChange(parsed); await onBuildingChange(parsed); }}>
                      <option value="">-- Chọn tòa nhà (tuỳ chọn) --</option>
                      {buildings.map(b => (<option key={b.id} value={String(b.id)}>{b.name || b.title || `Tòa nhà #${b.id}`}</option>))}
                    </select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Phòng</label>
                <Controller
                  control={control}
                  name="apartmentId"
                  render={({ field }) => (
                    <select className={inputCls} value={field.value === undefined || field.value === null ? "" : String(field.value)} onChange={async (e) => { const v = e.target.value; const parsed = v === "" ? undefined : Number(v); field.onChange(parsed); await onApartmentChange(parsed); }}>
                      <option value="">-- Chọn phòng (tuỳ chọn) --</option>
                      {apartments.map(a => (<option key={a.id} value={String(a.id)}>{a.title || a.roomCode || `Căn hộ #${a.id}`}</option>))}
                    </select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Giường</label>
                <Controller
                  control={control}
                  name="bedId"
                  render={({ field }) => (
                    <select className={inputCls} value={field.value === undefined || field.value === null ? "" : String(field.value)} onChange={(e) => { const v = e.target.value; const parsed = v === "" ? undefined : Number(v); field.onChange(parsed); }}>
                      <option value="">-- Chọn giường (tuỳ chọn) --</option>
                      {beds.map(b => (<option key={b.id} value={String(b.id)}>{b.name || `Giường #${b.id}`}</option>))}
                    </select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Trạng thái</label>
                <Controller control={control} name="status" render={({ field }) => (
                  <select {...field} className={inputCls}>
                    <option value="available">Sẵn sàng</option>
                    <option value="in_use">Đang sử dụng</option>
                    <option value="maintenance">Sửa chữa</option>
                    <option value="retired">Hỏng</option>
                  </select>
                )} />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Ngày mua</label>
                <input type="date" className={inputCls} {...register('purchaseDate')} />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Bảo hành của hãng (ngày kết thúc)</label>
                <input type="date" className={inputCls} {...register('manufacturerWarrantyDate')} />
                {/* derived status */}
                <ManufacturerWarrantyStatus control={control} />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Bảo hành chủ nhà (tháng)</label>
                <Controller control={control} name="ownerWarrantyMonths" render={({ field }) => (
                  <select {...field} className={inputCls} value={field.value === undefined || field.value === null ? '' : String(field.value)} onChange={(e) => { const v = e.target.value; field.onChange(v === '' ? '' : Number(v)); }}>
                    <option value="">-- Chọn (1-12 tháng, tuỳ chọn) --</option>
                    {Array.from({ length: 12 }).map((_, i) => (<option key={i+1} value={String(i+1)}>{i+1} tháng</option>))}
                  </select>
                )} />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Thời hạn bảo hành (hiển thị)</label>
                <input className={inputCls} {...register('warrantyPeriod')} />
              </div>
            </div>
          </Section>
        </div>
      </form>
    </div>
  );
}
