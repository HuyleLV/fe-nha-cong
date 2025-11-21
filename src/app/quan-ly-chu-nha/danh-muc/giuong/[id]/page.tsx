"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { Save, CheckCircle2, Info, ChevronRight } from "lucide-react";
import Spinner from "@/components/spinner";
import { bedService } from "@/services/bedService";
import { apartmentService } from '@/services/apartmentService';
import { buildingService } from '@/services/buildingService';
import { Apartment } from '@/type/apartment';

type Form = {
  name: string;
  rentPrice: string;
  depositAmount?: string;
  status?: string;
  buildingId?: number | null;
  apartmentId?: number | null;
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

export default function BedFormPage() {
  const { id } = useParams() as { id: string };
  const isEdit = useMemo(() => id !== "create", [id]);
  const router = useRouter();

  const { register, handleSubmit, reset, control, setValue, formState: { isSubmitting, errors, dirtyFields } } = useForm<Form>({
    defaultValues: { name: "", rentPrice: "0", depositAmount: "", status: 'active', buildingId: undefined, apartmentId: undefined },
  });

  const [loading, setLoading] = useState<boolean>(isEdit);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      try {
        const b = await bedService.getById(Number(id));
        const strip = (v?: string | null) => (v == null ? '' : String(v).replace(/\.0+$/, ''));
        // determine building of apartment (if any) so we can preload apartments for that building
        let buildingId: number | undefined = undefined;
        if ((b as any).apartmentId) {
          try {
            const apt = await apartmentService.getById((b as any).apartmentId);
            buildingId = (apt as any).buildingId ?? undefined;
          } catch (e) {
            buildingId = undefined;
          }
        }
        if (buildingId) {
          // load apartments for this building so apartment select has options
          setLoadingApartments(true);
          try {
            const res = await apartmentService.getAll({ buildingId, page: 1, limit: 200 });
            setApartments(res.items || []);
          } catch (err) {
            setApartments([]);
          } finally {
            setLoadingApartments(false);
          }
        }
        reset({ name: b.name || "", rentPrice: strip(b.rentPrice) || "0", depositAmount: b.depositAmount != null ? strip(b.depositAmount) : "", status: b.status || 'active', buildingId: buildingId ?? undefined, apartmentId: (b as any).apartmentId ?? undefined });
      } catch (err) {
        toast.error('Không tải được giường');
        router.replace('/quan-ly-chu-nha/danh-muc/giuong');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, reset, router]);

  useEffect(() => {
    (async () => {
      setLoadingBuildings(true);
      try {
        const res = await buildingService.getAll({ page: 1, limit: 200 });
        setBuildings(res.items || []);
      } catch (err) {
        setBuildings([]);
      } finally {
        setLoadingBuildings(false);
      }
    })();
  }, []);

  const loadApartmentsForBuilding = async (buildingId?: number) => {
    setLoadingApartments(true);
    try {
      if (!buildingId) {
        setApartments([]);
        return;
      }
      const res = await apartmentService.getAll({ buildingId: buildingId, page: 1, limit: 200 });
      setApartments(res.items || []);
    } catch (err) {
      setApartments([]);
    } finally {
      setLoadingApartments(false);
    }
  };

  const onSubmit = async (vals: Form) => {
    try {
      const payload: any = { ...vals };
      if (payload.apartmentId === "" || payload.apartmentId === undefined) payload.apartmentId = undefined;
      if (payload.apartmentId !== undefined && payload.apartmentId !== null) payload.apartmentId = Number(payload.apartmentId);

      if (isEdit) {
        await bedService.update(Number(id), payload);
        toast.success('Cập nhật giường thành công');
        router.push('/quan-ly-chu-nha/danh-muc/giuong');
      } else {
        const created = await bedService.create(payload);
        toast.success('Tạo giường thành công');
        // Redirect to list and include createdId so list can fetch & show it immediately
        router.push(`/quan-ly-chu-nha/danh-muc/giuong?createdId=${created?.id}`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi lưu giường');
    }
  };

  if (isEdit && loading) return <div className="min-h-[300px] grid place-items-center"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">{isEdit ? 'Chỉnh sửa giường' : 'Tạo giường mới'}</p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">{(dirtyFields && Object.keys(dirtyFields).length) ? 'Thay đổi chưa lưu' : (isEdit ? 'Chỉnh sửa giường' : 'Tạo giường')}</h1>
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
            <button type="button" onClick={() => router.push('/quan-ly-chu-nha/danh-muc/giuong')} className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">Hủy</button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Thông tin cơ bản">
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Tên giường</label>
                <input className={inputCls} {...register('name', { required: 'Vui lòng nhập tên giường' })} />
                {errors.name && <p className="text-red-600 text-sm mt-1">{String(errors.name.message)}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Tòa nhà</label>
                  <Controller
                    control={control}
                    name="buildingId"
                    render={({ field }) => (
                      <select
                        className={inputCls}
                        value={field.value === undefined || field.value === null ? "" : String(field.value)}
                        onChange={async (e) => {
                          const v = e.target.value;
                          const parsed = v === "" ? undefined : Number(v);
                          field.onChange(parsed as any);
                          await loadApartmentsForBuilding(parsed as any);
                          // clear apartment when building changes
                          setValue('apartmentId' as any, undefined as any);
                        }}
                      >
                        <option value="">-- Chọn tòa nhà (tuỳ chọn) --</option>
                        {buildings.map(b => (
                          <option key={b.id} value={String(b.id)}>{b.name || b.title || `Tòa nhà #${b.id}`}</option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Căn hộ</label>
                  <Controller
                    control={control}
                    name="apartmentId"
                    render={({ field }) => (
                      <select
                        className={inputCls}
                        value={field.value === undefined || field.value === null ? "" : String(field.value)}
                        onChange={(e) => {
                          const v = e.target.value;
                          field.onChange(v === "" ? undefined : Number(v));
                        }}
                      >
                        <option value="">-- Chọn căn hộ (tuỳ chọn) --</option>
                        {apartments.map(a => (
                          <option key={a.id} value={String(a.id)}>{a.title || a.roomCode || `Căn hộ #${a.id}`}</option>
                        ))}
                      </select>
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Giá thuê (VND)</label>
                  <input inputMode="numeric" className={inputCls} {...register('rentPrice', { required: 'Vui lòng nhập giá thuê' })} />
                  {errors.rentPrice && <p className="text-red-600 text-sm mt-1">{String(errors.rentPrice.message)}</p>}
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Đặt cọc (VND)</label>
                  <input inputMode="numeric" className={inputCls} {...register('depositAmount')} />
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Trạng thái">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Trạng thái</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <select {...field} className={inputCls}>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="draft">Nháp</option>
                  </select>
                )}
              />
            </div>
          </Section>
        </div>
      </form>
    </div>
  );
}
