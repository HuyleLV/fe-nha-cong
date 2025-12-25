"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import { useForm } from 'react-hook-form';
import { userService } from '@/services/userService';
import { toast } from 'react-toastify';
import { Save, CheckCircle2, ChevronRight } from 'lucide-react';
import Spinner from '@/components/spinner';
import UploadPicker from '@/components/UploadPicker';

type FormData = {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  note?: string;
  gender?: 'male'|'female'|'other'|'';
  avatar?: string | null;
  idCardFront?: string | null;
  idCardBack?: string | null;
  dateOfBirth?: string | null;
  idCardNumber?: string | null;
  idIssueDate?: string | null;
  idIssuePlace?: string | null;
  address?: string | null;
};

export default function AdminCustomerLeadEditPage() {
  const params = useParams();
  const id = params?.id ?? '';
  const router = useRouter();
  const isEdit = useMemo(() => id !== 'create' && id !== 'new', [id]);
  const [loading, setLoading] = useState<boolean>(Boolean(isEdit));
  const [meId, setMeId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting, dirtyFields } } = useForm<FormData>({
    defaultValues: { name: '', email: '', phone: '', password: '', note: '', gender: '', avatar: null, idCardFront: null, idCardBack: null, dateOfBirth: '', idCardNumber: null, idIssueDate: '', idIssuePlace: '', address: '' }
  });

  const inputCls = "h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white";

  useEffect(() => {
    (async () => {
      try {
        const me = await userService.getMe();
        if (me && (me as any).id) setMeId((me as any).id);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      try {
        const u = await userService.getAdminUser(Number(id));
        reset({
          name: u.name ?? '',
          email: u.email ?? '',
          phone: u.phone ?? '',
          password: '',
          note: (u as any).note ?? '',
          gender: (u as any).gender ?? '',
          avatar: (u as any).avatar ?? (u as any).avatarUrl ?? null,
          idCardFront: (u as any).idCardFront ?? null,
          idCardBack: (u as any).idCardBack ?? null,
          dateOfBirth: (u as any).dateOfBirth ?? '',
          idCardNumber: (u as any).idCardNumber ?? null,
          idIssueDate: (u as any).idIssueDate ?? '',
          idIssuePlace: (u as any).idIssuePlace ?? '',
          address: (u as any).address ?? '',
        });
      } catch (err) {
        console.error(err);
        toast.error('Không thể tải thông tin khách hàng');
        router.replace('/admin/khach-hang/khach-tiem-nang');
      } finally { setLoading(false); }
    })();
  }, [id, isEdit, reset, router]);

  const onSubmit = async (data: FormData) => {
    try {
      if (!isEdit) {
        // Client-side duplicate checks (optional) to give faster feedback
        if (data.email) {
          try {
            const params: any = { q: data.email, limit: 5 };
            if (meId) params.ownerId = meId;
            const found = await userService.listAdminUsers(params);
            const exists = (found.data || []).some(u => String(u.email || '').toLowerCase() === String(data.email).toLowerCase());
            if (exists) {
              toast.error('Email đã tồn tại, vui lòng sử dụng email khác');
              return;
            }
          } catch (err) { console.warn('Email uniqueness check failed', err); }
        }

        if (data.phone) {
          try {
            const params2: any = { q: data.phone, limit: 5 };
            if (meId) params2.ownerId = meId;
            const found = await userService.listAdminUsers(params2);
            const norm = String(data.phone).replace(/\s+/g, '');
            const exists = (found.data || []).some(u => String(u.phone || '').replace(/\s+/g, '') === norm);
            if (exists) {
              toast.error('Số điện thoại đã tồn tại, vui lòng sử dụng số khác');
              return;
            }
          } catch (err) { console.warn('Phone uniqueness check failed', err); }
        }

        const created = await userService.createAdminUser({
          email: data.email ?? '',
          password: data.password,
          role: 'customer',
          name: data.name,
          phone: data.phone,
          ownerId: meId ?? undefined,
          note: data.note ?? undefined,
          gender: data.gender ?? undefined,
          avatar: data.avatar ?? undefined,
          idCardFront: data.idCardFront ?? undefined,
          idCardBack: data.idCardBack ?? undefined,
          idCardNumber: data.idCardNumber ?? undefined,
          dateOfBirth: data.dateOfBirth ?? undefined,
          idIssueDate: data.idIssueDate ?? undefined,
          idIssuePlace: data.idIssuePlace ?? undefined,
          address: data.address ?? undefined,
        });

        if (created && typeof created === 'object' && typeof (created as any).id !== 'undefined') {
          toast.success('Tạo khách hàng thành công');
          router.push('/admin/khach-hang/khach-tiem-nang');
          return;
        }

        if (created && (created as any).message) {
          toast.info(String((created as any).message));
          return;
        }
      }

      await userService.updateAdminUser(Number(id), {
        email: data.email ?? undefined,
        name: data.name ?? undefined,
        phone: data.phone ?? undefined,
        note: data.note ?? undefined,
        gender: data.gender ?? undefined,
        avatar: data.avatar ?? undefined,
        idCardFront: data.idCardFront ?? undefined,
        idCardBack: data.idCardBack ?? undefined,
        idCardNumber: data.idCardNumber ?? undefined,
        dateOfBirth: data.dateOfBirth ?? undefined,
        idIssueDate: data.idIssueDate ?? undefined,
        idIssuePlace: data.idIssuePlace ?? undefined,
        address: data.address ?? undefined,
      });
      toast.success('Cập nhật khách hàng thành công');
      // Go back to previous page if possible so admin returns to where they started editing.
      if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
        router.back();
      } else {
        // fallback to the admin customers list
        router.push('/admin/khach-hang/khach-tiem-nang');
      }
    } catch (err: any) {
      console.error(err);
      const serverMsg = err?.response?.data?.message ?? err?.message;
      if (serverMsg) {
        toast.success(String(serverMsg));
      } else {
        toast.error('Lỗi khi lưu khách hàng');
      }
    }
  };

  const handleSave = async () => {
    try {
      const valid = await Promise.resolve(true);
      if (!valid) {
        toast.error('Vui lòng kiểm tra lại thông tin');
        return;
      }
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
              <p className="text-sm text-slate-500">{isEdit ? 'Chỉnh sửa khách hàng' : 'Tạo khách hàng mới'}</p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">{isEdit ? 'Chỉnh sửa khách hàng' : 'Tạo khách hàng'}</h1>
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
            <button type="button" onClick={() => router.push('/admin/khach-hang/khach-tiem-nang')} className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">Hủy</button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 p-4">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-slate-700">Thông tin khách hàng</h3>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Họ và tên</label>
                        <input className={inputCls + ' text-lg font-medium'} {...register('name', { required: 'Vui lòng nhập tên' })} />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{String((errors.name as any)?.message || 'Bắt buộc')}</p>}
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Điện thoại</label>
                        <input className={inputCls} {...register('phone')} />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Email</label>
                        <input className={inputCls} {...register('email', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' } })} />
                        {errors.email && <p className="text-red-600 text-sm mt-1">{String((errors.email as any)?.message)}</p>}
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Ngày sinh</label>
                        <input type="date" className={inputCls} {...register('dateOfBirth')} />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Giới tính</label>
                        <select className={inputCls} {...register('gender')}>
                          <option value="">-- Chọn --</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Số CCCD/CMND</label>
                        <input className={inputCls} {...register('idCardNumber')} />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Nơi cấp</label>
                        <input className={inputCls} {...register('idIssuePlace')} />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Ngày cấp</label>
                        <input type="date" className={inputCls} {...register('idIssueDate')} />
                      </div>

                      <div>
                        { !isEdit && (
                          <div>
                            <label className="block text-sm text-slate-600 mb-1">Mật khẩu</label>
                            <input className={inputCls} {...register('password', { minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' } })} type="password" />
                            {errors.password && <p className="text-red-600 text-sm mt-1">{String((errors.password as any)?.message)}</p>}
                          </div>
                        )}
                      </div>

                    { !isEdit && (
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Mật khẩu</label>
                        <input className={inputCls} {...register('password', { minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' } })} type="password" />
                        {errors.password && <p className="text-red-600 text-sm mt-1">{String((errors.password as any)?.message)}</p>}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm text-slate-600 mb-1">Địa chỉ</label>
                    <input className={inputCls} {...register('address')} />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm text-slate-600 mb-1">Ghi chú</label>
                    <textarea className="w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 p-3 bg-white" {...register('note')} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h4 className="font-semibold text-slate-700">Hồ sơ định danh (Ảnh đại diện - CCCD/CMND)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 items-start">
              <div className="col-span-1">
                <label className="block text-sm text-slate-600 mb-2">Ảnh đại diện</label>
                <div className="rounded-lg overflow-hidden bg-slate-50">
                  <UploadPicker value={watch('avatar') as string | null} onChange={(v) => setValue('avatar', Array.isArray(v) ? (v[0] || null) : v)} aspectClass="aspect-[1/1]" />
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-sm text-slate-600 mb-2">Mặt trước CCCD/CMND</label>
                <div className="rounded-lg overflow-hidden bg-slate-50">
                  <UploadPicker value={watch('idCardFront') as string | null} onChange={(v) => setValue('idCardFront', Array.isArray(v) ? (v[0] || null) : v)} aspectClass="aspect-[4/3]" />
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-sm text-slate-600 mb-2">Mặt sau CCCD/CMND</label>
                <div className="rounded-lg overflow-hidden bg-slate-50">
                  <UploadPicker value={watch('idCardBack') as string | null} onChange={(v) => setValue('idCardBack', Array.isArray(v) ? (v[0] || null) : v)} aspectClass="aspect-[4/3]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
