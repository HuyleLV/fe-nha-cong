"use client";

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import { useForm, useFieldArray } from 'react-hook-form';
import type { ContractForm } from '@/type/contract';
import { contractService } from '@/services/contractService';
import { buildingService } from '@/services/buildingService';
import { apartmentService } from '@/services/apartmentService';
import { userService } from '@/services/userService';
import { serviceService } from '@/services/serviceService';
import { toast } from 'react-toastify';
import { Save, CheckCircle2, ChevronRight, PlusCircle, Eye, XCircle } from 'lucide-react';
import { formatMoneyVND } from '@/utils/format-number';
import Spinner from '@/components/spinner';
import AdminTable from '@/components/AdminTable';
import UploadPicker from '@/components/UploadPicker';

// Removed local FormData type

// helper: strip trailing zeros from decimal strings for input/display (e.g. "12.00" -> "12", "12.50" -> "12.5")
function stripTrailingZerosForInput(v?: string | number | null) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (!s.includes('.')) return s;
  let r = s.replace(/0+$/u, '');
  if (r.endsWith('.')) r = r.slice(0, -1);
  return r;
}

export default function ContractEditPage() {
  const params = useParams();
  const id = params?.id ?? '';
  const router = useRouter();
  const isEdit = useMemo(() => id !== 'create' && id !== 'new', [id]);
  const [loading, setLoading] = useState<boolean>(Boolean(isEdit));

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors, isSubmitting } } = useForm<ContractForm>({
    defaultValues: { buildingId: undefined, apartmentId: undefined, customerId: undefined, rentAmount: 0, depositAmount: 0, depositPaid: '0', startDate: '', expiryDate: '', status: 'active', note: '', invoiceTemplate: '', paymentCycle: '1', billingStartDate: '', attachments: [], attachmentsSingle: null, serviceFees: [] }
  });
  const { fields: feeFields, append: appendFee, remove: removeFee, replace: replaceFees } = useFieldArray({ control, name: 'serviceFees' as any });

  const inputCls = "h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white";
  const modalInputCls = "h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white";

  // Modal state for adding a service fee
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [newFee, setNewFee] = useState<{ serviceId?: string; meter?: string; initialIndex?: string; quantity?: string; billingDate?: string; unitPrice?: string; unit?: string }>({});
  const resetFeeModal = () => setNewFee({ serviceId: '', meter: '', initialIndex: '', quantity: '', billingDate: '', unitPrice: '', unit: '' });

  const tUnit = (u?: string | null) => ({
    phong: 'Phòng',
    giuong: 'Giường',
    kwh: 'kWh',
    m3: 'm³',
    m2: 'm²',
    xe: 'Xe',
    luot: 'Lượt/Lần',
  } as Record<string, string>)[String(u ?? '')] ?? (u ?? '');
  
  // Viewer modal state for contract preview
  const [viewerId, setViewerId] = useState<number | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const applyFloatingHide = (hide: boolean) => {
    if (typeof document === 'undefined') return;
    try {
      const root = document.documentElement;
      const body = document.body;
      if (hide) {
        root.classList.add('hide-floating-buttons');
        body.classList.add('hide-floating-buttons');
      } else {
        root.classList.remove('hide-floating-buttons');
        body.classList.remove('hide-floating-buttons');
      }

      // hide floating chat buttons
      const node = document.querySelector('.floating-chat-buttons') as HTMLElement | null;
      if (node) {
        if (hide) {
          node.style.setProperty('display', 'none', 'important');
          node.style.setProperty('visibility', 'hidden', 'important');
          node.setAttribute('aria-hidden', 'true');
        } else {
          node.style.removeProperty('display');
          node.style.removeProperty('visibility');
          node.removeAttribute('aria-hidden');
        }
      }

      // Do not hide parent headers/sidebars here. We'll inject styles into the iframe instead.
    } catch (e) {}
  };

  const injectHideIntoIframe = () => {
    try {
      const iframe = iframeRef.current;
      const doc = iframe?.contentDocument;
      if (!doc) return;
      const existing = doc.getElementById('hide-floating-buttons-style');
      if (existing) return;
      const style = doc.createElement('style');
      style.id = 'hide-floating-buttons-style';
      style.innerHTML = `
        /* hide floating buttons inside iframe */
        .floating-chat-buttons { display: none !important; visibility: hidden !important; pointer-events: none !important; }
        /* hide header and host sidebar inside iframe (print templates may include layout chrome) */
        header { display: none !important; visibility: hidden !important; }
        aside[class*="w-64"], aside.hostSidebar, aside[id*="sidebar"] { display: none !important; visibility: hidden !important; }
      `;
      (doc.head || doc.body || doc.documentElement).appendChild(style);
    } catch (e) {}
  };

  useEffect(() => {
    try {
      applyFloatingHide(!!viewerOpen);
      if (viewerOpen) setTimeout(() => injectHideIntoIframe(), 200);
    } catch (e) {}
    return () => { try { applyFloatingHide(false); } catch (e) {} };
  }, [viewerOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as any).__openContractViewer = (id: number) => { setViewerId(id); setViewerOpen(true); };
    return () => { try { delete (window as any).__openContractViewer; } catch (e) {} };
  }, []);

  const closeViewer = () => { setViewerOpen(false); setViewerId(null); };
  const viewerPrint = () => {
    try {
      applyFloatingHide(true);
      const win = iframeRef.current?.contentWindow;
      const cleanup = () => { try { applyFloatingHide(false); } catch {} };
      if (win) {
        try { win.addEventListener?.('afterprint', cleanup); } catch {}
        win.focus();
        win.print();
        setTimeout(cleanup, 1500);
      } else {
        window.print();
        setTimeout(cleanup, 1500);
      }
    } catch (e) { console.error('Print failed', e); toast.error('Không thể in (hãy mở trang chi tiết để in)'); try { applyFloatingHide(false); } catch {} }
  };

  const downloadDoc = async () => {
    try {
      const doc = iframeRef.current?.contentDocument?.documentElement?.outerHTML ?? '';
      const blob = new Blob([doc], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-${viewerId || 'unknown'}.doc`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { console.error('Download doc failed', e); toast.error('Không thể tải file Word'); }
  };


  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      try {
        const c = await contractService.get(Number(id));
        const data = c ?? {};
        reset({
          buildingId: data.buildingId ?? undefined,
          apartmentId: data.apartmentId ?? undefined,
          customerId: data.customerId ?? undefined,
          rentAmount: stripTrailingZerosForInput(data.rentAmount ?? 0),
          depositAmount: stripTrailingZerosForInput(data.depositAmount ?? 0),
          depositPaid: data.depositPaid ?? '0',
          startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0,10) : '',
          expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString().slice(0,10) : '',
          status: data.status ?? 'active',
          note: data.note ?? '',
          invoiceTemplate: data.invoiceTemplate ?? '',
          paymentCycle: data.paymentCycle ? String(data.paymentCycle) : '1',
          billingStartDate: data.billingStartDate ? new Date(data.billingStartDate).toISOString().slice(0,10) : '',
          attachments: data.attachments ?? [],
          attachmentsSingle: (data.attachments && Array.isArray(data.attachments) && data.attachments.length) ? data.attachments[0] : null,
          serviceFees: (data as any)?.serviceFees ?? [],
        });
        if ((data as any)?.serviceFees && Array.isArray((data as any).serviceFees)) {
          replaceFees(((data as any).serviceFees || []).map((f: any) => ({
            serviceId: f.serviceId ?? undefined,
            meter: f.meter ?? '',
            initialIndex: f.initialIndex ?? '',
            quantity: f.quantity ?? '',
            billingDate: f.billingDate ? new Date(f.billingDate).toISOString().slice(0,10) : '',
            unitPrice: f.unitPrice ?? '',
            unit: f.unit ?? '',
          })));
        }
        // if contract has buildingId, preload apartments for that building
        if (data.buildingId) {
          await loadApartments(Number(data.buildingId));
        }
      } catch (err) {
        console.error(err);
        toast.error('Không thể tải hợp đồng');
        router.replace('/quan-ly-chu-nha/khach-hang/hop-dong');
      } finally { setLoading(false); }
    })();
  }, [id, isEdit, reset, router]);

  // buildings / apartments / customers for selects
  const [buildings, setBuildings] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const currentBuildingId = watch('buildingId');
  const buildingSelected = currentBuildingId !== undefined && currentBuildingId !== null;
  const hasBuildingServices = Array.isArray(services) && services.length > 0;
  const [meId, setMeId] = useState<number | null>(null);
  const [buildingsLoading, setBuildingsLoading] = useState<boolean>(false);
  const [apartmentsLoading, setApartmentsLoading] = useState<boolean>(false);
  const [customersLoading, setCustomersLoading] = useState<boolean>(false);
  const [servicesLoading, setServicesLoading] = useState<boolean>(false);

  const loadBuildings = async (ownerId?: number | null) => {
    try {
      setBuildingsLoading(true);
      const params: any = { page: 1, limit: 200 };
      if (ownerId) params.ownerId = ownerId;
      const res = await buildingService.getAll(params);
      setBuildings(res.items || []);
    } catch (err) { console.error(err); }
    finally { setBuildingsLoading(false); }
  };

  const loadApartments = async (buildingId?: number) => {
    try {
      setApartmentsLoading(true);
      if (!buildingId) { setApartments([]); return; }
      const res = await apartmentService.getAll({ page: 1, limit: 1000, buildingId });
      setApartments(res.items || []);
    } catch (err) { console.error(err); setApartments([]); }
    finally { setApartmentsLoading(false); }
  };

  const loadCustomers = async (ownerId?: number | null) => {
    try {
      setCustomersLoading(true);
      const params: any = { page: 1, limit: 200 };
      if (ownerId) params.ownerId = ownerId;
      const res = await userService.listAdminUsers(params);
      const items = res.data ?? [];
      setCustomers(items as any[]);
    } catch (err) { console.error(err); }
    finally { setCustomersLoading(false); }
  };

  const loadServices = async (buildingId?: number) => {
    try {
      setServicesLoading(true);
      const params: any = { page: 1, limit: 500 };
      if (buildingId) params.buildingId = buildingId;
      const res = await serviceService.getAll(params);
      setServices(res.items || []);
    } catch (err) { console.error(err); setServices([]); }
    finally { setServicesLoading(false); }
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await userService.getMe();
        if (me && me.id) setMeId(me.id);
        await loadBuildings(me?.id ?? undefined);
        await Promise.all([
          loadCustomers(me?.id ?? undefined),
          loadServices(watch('buildingId') ? Number(watch('buildingId')) : undefined),
        ]);
      } catch (err) {
        await loadBuildings();
        await loadCustomers();
        await loadServices(watch('buildingId') ? Number(watch('buildingId')) : undefined);
      }
    })();
  }, []);

  const onSubmit = async (data: ContractForm) => {
    try {
  const payload: any = {
        buildingId: data.buildingId ?? null,
        apartmentId: data.apartmentId ?? null,
        customerId: data.customerId ?? null,
        rentAmount: data.rentAmount ?? null,
        depositAmount: data.depositAmount ?? null,
        depositPaid: data.depositPaid ?? null,
        startDate: data.startDate ? data.startDate : null,
        expiryDate: data.expiryDate ? data.expiryDate : null,
        status: data.status ?? 'active',
        note: data.note ?? null,
        invoiceTemplate: data.invoiceTemplate ?? null,
        paymentCycle: data.paymentCycle ?? null,
        billingStartDate: data.billingStartDate ? data.billingStartDate : null,
        attachments: (data.attachments && data.attachments.length) ? data.attachments : (data.attachmentsSingle ? [data.attachmentsSingle] : []),
        serviceFees: (data as any).serviceFees?.map((f: any) => ({
          serviceId: f?.serviceId ? Number(f.serviceId) : null,
          meter: f?.meter ?? null,
          initialIndex: f?.initialIndex !== '' && f?.initialIndex !== undefined && f?.initialIndex !== null ? Number(f.initialIndex) : null,
          quantity: f?.quantity !== '' && f?.quantity !== undefined && f?.quantity !== null ? Number(f.quantity) : null,
          unitPrice: f?.unitPrice !== '' && f?.unitPrice !== undefined && f?.unitPrice !== null ? Number(f.unitPrice) : null,
          unit: f?.unit ?? null,
          billingDate: f?.billingDate || null,
        })) || [],
      };

      // Coerce numeric fields to numbers when possible
      if (payload.rentAmount !== undefined && payload.rentAmount !== null && payload.rentAmount !== '') {
        const r = Number(payload.rentAmount);
        payload.rentAmount = Number.isNaN(r) ? payload.rentAmount : r;
      }
      if (payload.depositAmount !== undefined && payload.depositAmount !== null && payload.depositAmount !== '') {
        const d = Number(payload.depositAmount);
        payload.depositAmount = Number.isNaN(d) ? payload.depositAmount : d;
      }
      if (payload.paymentCycle !== undefined && payload.paymentCycle !== null && payload.paymentCycle !== '') {
        const n = Number(payload.paymentCycle);
        payload.paymentCycle = Number.isNaN(n) ? payload.paymentCycle : n;
      }

      if (!isEdit) {
        const created = await contractService.create(payload);
        if (created && (created as any).id) {
          toast.success('Tạo hợp đồng thành công');
          router.push('/quan-ly-chu-nha/khach-hang/hop-dong');
          return;
        }
        toast.info((created as any)?.message ?? 'Đã tạo (không chắc chắn)');
        return;
      }

      await contractService.update(Number(id), payload);
      toast.success('Cập nhật hợp đồng thành công');
      router.push('/quan-ly-chu-nha/khach-hang/hop-dong');
    } catch (err: any) {
      console.error(err);
      const serverMsg = err?.response?.data?.message ?? err?.message;
      if (serverMsg) toast.error(String(serverMsg)); else toast.error('Lỗi khi lưu hợp đồng');
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
              <p className="text-sm text-slate-500">{isEdit ? 'Chỉnh sửa hợp đồng' : 'Tạo hợp đồng mới'}</p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">{isEdit ? 'Chỉnh sửa hợp đồng' : 'Tạo hợp đồng'}</h1>
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
            {/* View contract (print/preview) - only for existing contracts */}
            {isEdit && id && (
              <button
                type="button"
                title="Xem hợp đồng"
                onClick={() => { setViewerId(Number(id)); setViewerOpen(true); }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                <Eye className="w-5 h-5 text-slate-700" />
                <span className="text-sm text-slate-700">Xem</span>
              </button>
            )}
            <button type="button" onClick={() => router.push('/quan-ly-chu-nha/khach-hang/hop-dong')} className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">Hủy</button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 p-4">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-slate-700">Thông tin hợp đồng</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Tòa nhà <span className="text-red-600">*</span></label>
                  <select
                    className={inputCls}
                    value={String(watch('buildingId') ?? '')}
                    onChange={async (e) => {
                      const v = e.target.value === '' ? undefined : Number(e.target.value);
                      setValue('buildingId', v as any);
                      // reset apartment selection
                      setValue('apartmentId', undefined as any);
                      await loadApartments(v as number | undefined);
                      await loadServices(v as number | undefined);
                    }}
                    disabled={buildingsLoading}
                  >
                    {buildingsLoading ? (
                      <option value="">Đang tải tòa nhà…</option>
                    ) : (
                      <>
                        <option value="">-- Chọn tòa nhà --</option>
                        {buildings.map(b => (<option key={b.id} value={String(b.id)}>{b.name || b.title || `Tòa #${b.id}`}</option>))}
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Căn hộ</label>
                  <select
                    className={inputCls}
                    value={String(watch('apartmentId') ?? '')}
                    onChange={(e) => setValue('apartmentId', e.target.value === '' ? undefined as any : Number(e.target.value) as any)}
                    disabled={apartmentsLoading}
                  >
                    {apartmentsLoading ? (
                      <option value="">Đang tải căn hộ…</option>
                    ) : (
                      <>
                        <option value="">-- Chọn căn hộ --</option>
                        {apartments.length === 0 ? <option value="">(Chưa có căn hộ)</option> : apartments.map(a => (<option key={a.id} value={String(a.id)}>{a.title || `Căn #${a.id}`}</option>))}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Khách hàng <span className="text-red-600">*</span></label>
                  <select
                    className={inputCls}
                    value={String(watch('customerId') ?? '')}
                    onChange={(e) => setValue('customerId', e.target.value === '' ? undefined as any : Number(e.target.value) as any)}
                    disabled={customersLoading}
                  >
                    {customersLoading ? (
                      <option value="">Đang tải khách hàng…</option>
                    ) : (
                      <>
                        <option value="">-- Chọn khách hàng --</option>
                        {customers.map((c: any) => (<option key={c.id} value={String(c.id)}>{c.name || c.email || `#${c.id}`}{c.phone ? ' • ' + c.phone : ''}</option>))}
                     </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Giá thuê</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min={0}
                    className={inputCls}
                    {...register('rentAmount')}
                    onKeyDown={(e) => {
                      // Prevent scientific 'e' and plus/minus characters in number inputs
                      if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') e.preventDefault();
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Tiền cọc</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min={0}
                    className={inputCls}
                    {...register('depositAmount')}
                    onKeyDown={(e) => {
                      if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') e.preventDefault();
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Ngày bắt đầu <span className="text-red-600">*</span></label>
                  <input type="date" className={inputCls} {...register('startDate', { required: 'Vui lòng chọn ngày bắt đầu' })} />
                  {errors.startDate && <div className="text-sm text-red-600 mt-1">{(errors.startDate as any).message}</div>}
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Ngày kết thúc <span className="text-red-600">*</span></label>
                  <input type="date" className={inputCls} {...register('expiryDate', { required: 'Vui lòng chọn ngày kết thúc' })} />
                  {errors.expiryDate && <div className="text-sm text-red-600 mt-1">{(errors.expiryDate as any).message}</div>}
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Trạng thái</label>
                  <select className={inputCls} {...register('status')}>
                    <option value="active">Hoạt động</option>
                    <option value="expiring_soon">Sắp hết hạn</option>
                    <option value="expired">Quá hạn</option>
                    <option value="terminated">Đã thanh lý</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Chu kỳ thanh toán (tháng)</label>
                  <select className={inputCls} {...register('paymentCycle')}>
                    {Array.from({ length: 12 }).map((_, i) => {
                      const v = String(i + 1);
                      return (<option key={v} value={v}>{v} tháng</option>);
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Ngày bắt đầu tính tiền <span className="text-red-600">*</span></label>
                  <input type="date" className={inputCls} {...register('billingStartDate', { required: 'Vui lòng chọn ngày bắt đầu tính tiền' })} />
                  {errors.billingStartDate && <div className="text-sm text-red-600 mt-1">{(errors.billingStartDate as any).message}</div>}
                </div>

              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">Ghi chú</label>
                <textarea className="w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 p-3 bg-white" {...register('note')} />
              </div>

              {/* Tiền phí dịch vụ - dùng AdminTable và nằm trên phần đính kèm */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-slate-700 font-semibold">Tiền phí dịch vụ</label>
                  <button
                    type="button"
                    onClick={async () => {
                      // ensure services for selected building are loaded before opening modal
                      try {
                        await loadServices(watch('buildingId') ? Number(watch('buildingId')) : undefined);
                      } catch (err) {
                        console.error('Failed to load services for building', err);
                      }
                      resetFeeModal();
                      setShowFeeModal(true);
                    }}
                    className="inline-flex items-center gap-2 p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                    title="Thêm phí dịch vụ"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
                <AdminTable headers={["Dịch vụ","Công tơ","Chỉ số đầu","Số lượng","Đơn giá","Đơn vị tính","Ngày tính phí","Hành động"]}>
                  {feeFields.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-slate-500">Chưa có phí dịch vụ</td>
                    </tr>
                  ) : feeFields.map((field, idx) => {
                    const sId = watch(`serviceFees.${idx}.serviceId` as const);
                    const svcName = sId ? (services.find((s: any) => String(s.id) === String(sId))?.name ?? `#${sId}`) : '-';
                    return (
                      <tr key={field.id} className="border-b">
                        <td className="py-2 pr-3">{svcName}</td>
                        <td className="py-2 pr-3">{watch(`serviceFees.${idx}.meter` as const) || '-'}</td>
                        <td className="py-2 pr-3">{watch(`serviceFees.${idx}.initialIndex` as const) || '-'}</td>
                        <td className="py-2 pr-3">{watch(`serviceFees.${idx}.quantity` as const) || '-'}</td>
                        <td className="py-2 pr-3">{(watch(`serviceFees.${idx}.unitPrice` as const) || '') !== '' ? formatMoneyVND(Number(watch(`serviceFees.${idx}.unitPrice` as const))) : '-'}</td>
                        <td className="py-2 pr-3">{(watch(`serviceFees.${idx}.unit` as const) || '') ? tUnit(watch(`serviceFees.${idx}.unit` as const)) : '-'}</td>
                        <td className="py-2 pr-3">{watch(`serviceFees.${idx}.billingDate` as const) || '-'}</td>
                        <td className="py-2 pr-3">
                          <button type="button" onClick={() => removeFee(idx)} className="px-3 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50">Xóa</button>
                        </td>
                      </tr>
                    );
                  })}
                </AdminTable>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">Đính kèm</label>
                <div className="rounded-lg overflow-hidden bg-slate-50">
                  <UploadPicker value={watch('attachmentsSingle') as string | null} onChange={(v) => setValue('attachmentsSingle', v as any)} />
                </div>
              </div>

            </div>
          </div>
      

          {/* Popup thêm phí dịch vụ */}
          {showFeeModal && (
            <div className="fixed inset-0 z-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30" onClick={() => setShowFeeModal(false)} />
              <div className="relative z-50 w-full max-w-lg bg-white rounded-xl shadow-lg border border-slate-200">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800">Thêm phí dịch vụ</h4>
                  <button className="px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50" onClick={() => setShowFeeModal(false)}>Đóng</button>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Dịch vụ <span className="text-red-600">*</span></label>
                    {servicesLoading ? (
                      <select className={modalInputCls} disabled><option>Đang tải dịch vụ…</option></select>
                    ) : buildingSelected && !hasBuildingServices ? (
                      <div className="p-3 rounded-md bg-yellow-50 border border-yellow-100 text-sm text-slate-700">Tòa nhà này chưa có dịch vụ. Vui lòng tạo dịch vụ cho tòa nhà trước khi thêm vào hợp đồng.</div>
                    ) : (
                      <select
                        className={modalInputCls}
                        value={newFee.serviceId || ''}
                        onChange={(e) => {
                          const sid = e.target.value;
                          const svc = Array.isArray(services) ? services.find((s: any) => String(s.id) === String(sid)) : undefined;
                          setNewFee({ ...newFee, serviceId: sid, unitPrice: svc?.unitPrice !== undefined && svc?.unitPrice !== null ? String(svc.unitPrice) : '', unit: svc?.unit ?? '' });
                        }}
                      >
                        <option value="">-- Chọn dịch vụ --</option>
                        {Array.isArray(services) && services.map((s: any) => (<option key={s.id} value={String(s.id)}>{s.name}</option>))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Công tơ</label>
                    <input type="text" className={modalInputCls} value={newFee.meter || ''} onChange={(e) => setNewFee({ ...newFee, meter: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Chỉ số đầu</label>
                      <input type="number" inputMode="decimal" step="0.01" className={modalInputCls} value={newFee.initialIndex || ''} onChange={(e) => setNewFee({ ...newFee, initialIndex: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Số lượng</label>
                      <input type="number" inputMode="decimal" step="0.01" className={modalInputCls} value={newFee.quantity || ''} onChange={(e) => setNewFee({ ...newFee, quantity: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Đơn giá</label>
                      <input type="number" inputMode="decimal" step="0.01" className={modalInputCls} value={newFee.unitPrice || ''} onChange={(e) => setNewFee({ ...newFee, unitPrice: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Đơn vị tính</label>
                      <select className={modalInputCls} value={newFee.unit || ''} onChange={(e) => setNewFee({ ...newFee, unit: e.target.value })}>
                        <option value="">-- Chọn đơn vị --</option>
                        <option value="phong">Phòng</option>
                        <option value="giuong">Giường</option>
                        <option value="kwh">kWh</option>
                        <option value="m3">m³</option>
                        <option value="m2">m²</option>
                        <option value="xe">Xe</option>
                        <option value="luot">Lượt/Lần</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Ngày tính phí <span className="text-red-600">*</span></label>
                    <input type="date" className={modalInputCls} value={newFee.billingDate || ''} onChange={(e) => setNewFee({ ...newFee, billingDate: e.target.value })} />
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50" onClick={() => setShowFeeModal(false)}>Hủy</button>
                  <button
                    className={`px-3 py-2 rounded-lg text-white ${buildingSelected && !hasBuildingServices ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      // basic validation
                      if (!newFee.serviceId || !newFee.billingDate) return;
                      appendFee({
                        serviceId: newFee.serviceId,
                        meter: newFee.meter || '',
                        initialIndex: newFee.initialIndex || '',
                        quantity: newFee.quantity || '',
                        unitPrice: newFee.unitPrice || '',
                        unit: newFee.unit || '',
                        billingDate: newFee.billingDate || '',
                      });
                      setShowFeeModal(false);
                    }}
                    disabled={buildingSelected && !hasBuildingServices}
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Viewer modal for contract preview */}
      {viewerOpen && viewerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeViewer} />
          <div className="relative w-[95%] md:w-3/4 lg:w-2/3 h-[85%] bg-white rounded-lg shadow-lg overflow-hidden z-60">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="text-sm font-semibold">Xem hợp đồng #{viewerId}</div>
              <div className="flex items-center gap-2">
                <button onClick={viewerPrint} className="px-3 py-1 bg-emerald-600 text-white rounded">In / Save as PDF</button>
                <button onClick={downloadDoc} className="px-3 py-1 bg-sky-600 text-white rounded">Tải Word</button>
                <button onClick={closeViewer} className="p-2 rounded bg-slate-200" aria-label="Đóng"><XCircle className="w-4 h-4" /></button>
              </div>
            </div>
            <iframe
              ref={iframeRef}
              onLoad={() => injectHideIntoIframe()}
              src={`/quan-ly-chu-nha/khach-hang/print-contract?id=${viewerId}`}
              className="w-full h-full border-0"
              title={`Contract ${viewerId}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
