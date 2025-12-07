"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminTable from "@/components/AdminTable";
import type { InvoiceItem, InvoicePayload } from "@/type/invoice";
import { toast } from "react-toastify";
import { invoiceService } from "@/services/invoiceService";
import { buildingService } from "@/services/buildingService";
import { apartmentService } from "@/services/apartmentService";
import { PlusCircle, Save, Trash2, CheckCircle2, ChevronRight } from "lucide-react";
import { contractService } from "@/services/contractService";
import { serviceService } from "@/services/serviceService";
import { formatMoneyVND } from '@/utils/format-number';

// Using shared types from src/type/invoice

export default function InvoiceEditPage() {
  const params = useParams();
  const idParam = (params as any)?.id as string | undefined;
  const router = useRouter();
  const isCreate = !idParam || idParam === "create" || idParam === "new";

  const [form, setForm] = useState<InvoicePayload | any>({
    buildingId: "",
    apartmentId: "",
    contractId: "",
    period: "",
    issueDate: "",
    dueDate: "",
    printTemplate: "",
    note: "",
  items: [] as InvoiceItem[],
  });
  const [buildings, setBuildings] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [selectedApartmentForContracts, setSelectedApartmentForContracts] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(new Date().getFullYear());
  const monthPickerRef = useRef<HTMLDivElement | null>(null);
  const monthToggleRef = useRef<HTMLButtonElement | null>(null);

  const inputCls =
    "h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white";

  const tUnit = (u?: string | null) => ({
    phong: 'Phòng',
    giuong: 'Giường',
    kwh: 'kWh',
    m3: 'm³',
    m2: 'm²',
    xe: 'Xe',
    luot: 'Lượt/Lần',
  } as Record<string, string>)[String(u ?? '')] ?? (u ?? '');

  const stripTrailingDotZero = (v: any) => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    if (s.endsWith('.00')) return s.slice(0, -3);
    return s;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await buildingService.getAll({ page: 1, limit: 200 });
        const items = (res as any)?.items ?? (res as any)?.data ?? res ?? [];
        setBuildings(items);
      } catch {}
    })();
    setContracts([]);
  }, []);

  const loadApartments = async (buildingId?: number) => {
    try {
      const params: any = {};
      if (buildingId) params.buildingId = buildingId;
      const res = await apartmentService.getAll({ page: 1, limit: 1000, ...params });
      const items = (res as any)?.items ?? (res as any)?.data ?? res ?? [];
      setApartments(items);
    } catch {}
  };

  const loadApartmentServices = async (apartmentId?: number) => {
    if (!apartmentId) return;
    try {
      const apt = await apartmentService.getById(apartmentId);
      const newItems: InvoiceItem[] = [];
      if (apt.electricityPricePerKwh != null) {
        newItems.push({
          serviceName: "Điện",
          unitPrice: String(apt.electricityPricePerKwh),
          unit: "kwh",
          // populate both shapes so UI inputs and save mapper work
          meterIndex: "",
          initialIndex: "",
          meter: "",
          quantity: "",
          vat: "",
          billingDate: "",
          fromDate: "",
          toDate: "",
          amount: "",
        });
      }
      if (apt.waterPricePerM3 != null) {
        newItems.push({
          serviceName: "Nước",
          unitPrice: String(apt.waterPricePerM3),
          unit: "m3",
          meterIndex: "",
          initialIndex: "",
          meter: "",
          quantity: "",
          vat: "",
          billingDate: "",
          fromDate: "",
          toDate: "",
          amount: "",
        });
      }
      if (apt.internetPricePerRoom != null) {
        newItems.push({
          serviceName: "Internet",
          unitPrice: String(apt.internetPricePerRoom),
          unit: "phong",
          meterIndex: "",
          initialIndex: "",
          meter: "",
          quantity: "",
          vat: "",
          billingDate: "",
          fromDate: "",
          toDate: "",
          amount: "",
        });
      }
      if (apt.commonServiceFeePerPerson != null) {
        newItems.push({
          serviceName: "Phí quản lý",
          unitPrice: String(apt.commonServiceFeePerPerson),
          unit: "phong",
          meterIndex: "",
          initialIndex: "",
          meter: "",
          quantity: "",
          vat: "",
          billingDate: "",
          fromDate: "",
          toDate: "",
          amount: "",
        });
      }

      // If we found default services, replace the items list
      if (newItems.length > 0) {
        setForm((s: any) => ({ ...s, items: newItems }));
      }
    } catch (err) {
      console.error("Không tải được dịch vụ căn hộ", err);
    }
  };

  // Load contracts for an apartment
  const loadContracts = async (apartmentId?: number) => {
    try {
      setContractsLoading(true);
      if (!apartmentId) {
        setContracts([]);
        return [] as any[];
      }
      const res = await contractService.list({ page: 1, limit: 200, apartmentId });
      const items = (res as any)?.data ?? (res as any)?.items ?? res ?? [];
      setContracts(items || []);
      return items || [];
    } catch (err) {
      console.error('Không tải được hợp đồng', err);
      setContracts([]);
      return [] as any[];
    } finally {
      setContractsLoading(false);
    }
  };

  // Load services from a selected contract (contract.serviceFees)
  const loadContractServices = async (contractId?: number) => {
    if (!contractId) return;
    try {
      const c = await contractService.get(Number(contractId));
      const fees = (c as any)?.serviceFees ?? [];
      if (!Array.isArray(fees) || fees.length === 0) return;

      // Resolve service names when serviceId exists
      const resolved = await Promise.allSettled(
        fees.map((f: any) => {
          if (f?.serviceId) return serviceService.get(Number(f.serviceId));
          return Promise.resolve(null);
        })
      );

      const items: InvoiceItem[] = fees.map((f: any, idx: number) => {
        const svc = (resolved[idx] as any)?.status === 'fulfilled' ? (resolved[idx] as any).value : null;
        const name = svc?.name ?? (f?.serviceId ? `Dịch vụ ${f.serviceId}` : f?.name ?? 'Dịch vụ');
        const billingDate = f?.billingDate ? new Date(f.billingDate).toISOString().slice(0,10) : "";
        const initial = f?.initialIndex != null ? String(f.initialIndex) : "";
        return {
          serviceName: name,
          // Prefer `unitPrice` (newer API shape), fall back to `price` or fee-level price
          unitPrice: svc?.unitPrice != null ? String(svc.unitPrice) : (svc?.price != null ? String(svc.price) : (f?.unitPrice != null ? String(f.unitPrice) : (f?.price != null ? String(f.price) : "")) ),
          unit: svc?.unit ?? f?.unit ?? "",
          // keep both possible keys so the UI inputs and save() mapper work
          meterIndex: initial,
          initialIndex: initial,
          meter: f?.meter ?? "",
          quantity: f?.quantity != null ? String(f.quantity) : "",
          vat: svc?.taxRate != null ? String(svc.taxRate) : "",
          billingDate,
          fromDate: billingDate,
          toDate: "",
          amount: "",
        } as InvoiceItem;
      });

      // DEBUG: log resolved service objects and the mapped invoice items
      console.debug('[InvoiceEdit] resolved services for contract fees:', resolved.map((r: any) => (r?.status === 'fulfilled' ? r.value : null)));
      console.debug('[InvoiceEdit] mapped invoice items from contract fees:', items);

      setForm((s: any) => ({ ...s, items }));
    } catch (err) {
      console.error('Không tải được dịch vụ hợp đồng', err);
    }
  };

  const fetchOne = async () => {
    if (isCreate) return;
    setLoading(true);
    try {
      const res = await invoiceService.getById(Number(idParam));
      const data = (res as any)?.data ?? res;
      setForm({
        buildingId: data.buildingId ?? "",
        apartmentId: data.apartmentId ?? "",
        contractId: data.contractId ?? "",
        period: data.period ?? "",
        issueDate: data.issueDate ? new Date(data.issueDate).toISOString().slice(0, 10) : "",
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString().slice(0, 10) : "",
        printTemplate: data.printTemplate ?? "",
        note: data.note ?? "",
        items: (data.items ?? []).map((it: any) => ({
          serviceName: it.serviceName ?? "",
          unitPrice: it.unitPrice !== undefined && it.unitPrice !== null ? String(it.unitPrice) : "",
          unit: it.unit ?? "",
          // keep both shapes for UI compatibility
          meterIndex: it.meterIndex ?? it.initialIndex ?? "",
          initialIndex: it.initialIndex ?? it.meterIndex ?? "",
          meter: it.meter ?? "",
          quantity: it.quantity ?? "",
          vat: it.vat ?? "",
          billingDate: it.fromDate ? new Date(it.fromDate).toISOString().slice(0, 10) : (it.billingDate ? new Date(it.billingDate).toISOString().slice(0,10) : ""),
          fromDate: it.fromDate ? new Date(it.fromDate).toISOString().slice(0, 10) : (it.billingDate ? new Date(it.billingDate).toISOString().slice(0,10) : ""),
          toDate: it.toDate ? new Date(it.toDate).toISOString().slice(0, 10) : "",
          amount: it.amount ?? "",
        })),
      });
      // DEBUG: log normalized items we set on the form
      console.debug('[InvoiceEdit] normalized items set on form:', (data.items ?? []).map((it: any) => ({ serviceName: it.serviceName, unitPrice: it.unitPrice, unit: it.unit })));
      if (data.buildingId) await loadApartments(Number(data.buildingId));
    } catch (err) {
      console.error(err);
      toast.error("Không tải được hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCreate) fetchOne();
  }, [idParam]);

  useEffect(() => {
    if (form && form.period) {
      const parts = String(form.period).split('-');
      const y = Number(parts[0]);
      if (!isNaN(y)) setPickerYear(y);
    }
  }, [form.period]);

  // Close month picker when clicking outside or pressing ESC
  useEffect(() => {
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      if (!monthPickerRef.current) return;
      if (monthPickerRef.current.contains(target)) return;
      if (monthToggleRef.current && monthToggleRef.current.contains(target)) return;
      setShowMonthPicker(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowMonthPicker(false);
    }
    if (showMonthPicker) {
      document.addEventListener('mousedown', onDown);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [showMonthPicker]);

  const onChange = (key: string, val: any) => setForm((s: any) => ({ ...s, [key]: val }));

  const save = async () => {
    if (!form.buildingId || !form.apartmentId || !form.period || !form.printTemplate) {
      toast.error("Vui lòng điền đủ Tòa nhà, Căn hộ, Kỳ và Mẫu in");
      return;
    }
    const payload: InvoicePayload = {
      ...form,
      items: (form.items || []).map((it: any) => ({
        serviceName: it.serviceName,
        unitPrice: it.unitPrice || null,
        unit: it.unit ?? null,
        // accept multiple possible input keys (meterIndex, initialIndex, meter)
        meterIndex: it.meterIndex ?? it.initialIndex ?? it.meter ?? null,
        quantity: it.quantity ?? null,
        vat: it.vat ?? null,
        // dates: try fromDate then billingDate
        fromDate: it.fromDate ?? it.billingDate ?? null,
        toDate: it.toDate ?? null,
        amount: it.amount ?? null,
      })),
    };
    try {
      if (isCreate) await invoiceService.create(payload);
      else await invoiceService.update(Number(idParam), payload);
      toast.success("Đã lưu hóa đơn");
      router.push("/quan-ly-chu-nha/tai-chinh/hoa-don");
    } catch (err) {
      console.error(err);
      toast.error("Lưu hóa đơn thất bại");
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">{isCreate ? "Thêm hóa đơn" : "Chỉnh sửa hóa đơn"}</p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">{isCreate ? "Tạo hóa đơn" : "Cập nhật hóa đơn"}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              title="Lưu"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="w-5 h-5" /> <span>{isCreate ? "Tạo mới" : "Cập nhật"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-slate-700">Thông tin hóa đơn</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">
                  Tòa nhà <span className="text-red-500">*</span>
                </label>
                <select
                  value={String(form.buildingId ?? "")}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onChange("buildingId", val);
                    loadApartments(val);
                  }}
                  className={"mt-1 " + inputCls}
                  required
                >
                  <option value="">-- Chọn tòa nhà --</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name || b.title || b.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Căn hộ <span className="text-red-500">*</span>
                </label>
                <select
                  value={String(form.apartmentId ?? "")}
                  onChange={async (e) => {
                    const val = Number(e.target.value);
                    // set apartment immediately in the form state
                    onChange("apartmentId", val);
                    // record which apartment we're fetching contracts for so the select
                    // rendering can immediately reflect the new apartment and avoid
                    // showing stale contract options
                    setSelectedApartmentForContracts(val || null);
                    // clear contracts immediately to avoid showing previous apartment's contracts
                    setContracts([]);
                    // reset contract selection and items while we load
                    setForm((s: any) => ({ ...s, contractId: "", items: [] }));
                    // load contracts for this apartment
                    const contractsForApt = await loadContracts(val);
                    // if there are no contracts for this apartment, load apartment default services
                    if (!contractsForApt || contractsForApt.length === 0) {
                      await loadApartmentServices(val);
                    }
                  }}
                  className={"mt-1 " + inputCls}
                  required
                >
                  <option value="">-- Chọn căn hộ --</option>
                  {apartments.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      {a.title || a.code || a.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Hợp đồng</label>
                <select
                  value={String(form.contractId ?? "")}
                  onChange={(e) => {
                    if (!selectedApartmentForContracts || contractsLoading || !Array.isArray(contracts) || contracts.length === 0) return;
                    const raw = e.target.value;
                    const val = raw === "" ? "" : Number(raw);
                    onChange("contractId", val);
                    if (raw !== "") loadContractServices(Number(raw));
                  }}
                  className={"mt-1 " + inputCls}
                  disabled={!selectedApartmentForContracts || contractsLoading || !Array.isArray(contracts) || contracts.length === 0}
                >
                  {!selectedApartmentForContracts ? (
                    <option value="">-- Chọn căn hộ trước --</option>
                  ) : contractsLoading ? (
                    <option value="">-- Đang tải hợp đồng --</option>
                  ) : !Array.isArray(contracts) || contracts.length === 0 ? (
                    <option value="">-- Không có hợp đồng --</option>
                  ) : (
                    <>
                      <option value="">-- Chọn hợp đồng --</option>
                      {contracts.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.code || c.name || c.id}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Kỳ thanh toán <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {/* Display as MM-YYYY, store as YYYY-MM */}
                  <button
                    type="button"
                    onClick={() => setShowMonthPicker((s) => !s)}
                    className={"mt-1 " + inputCls + " flex items-center justify-between"}
                    aria-required="true"
                    ref={monthToggleRef}
                  >
                    <span className="text-sm text-slate-700">
                      {form.period ? form.period.split('-').reverse().join('-') : 'Chọn'}
                    </span>
                    <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <path d="M16 2v4M8 2v4M3 10h18"></path>
                    </svg>
                  </button>

                  {showMonthPicker && (
                    <div
                      ref={monthPickerRef}
                      className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-3 transform transition-all origin-top animate-scale-in"
                      role="dialog"
                      aria-label="Chọn kỳ thanh toán"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPickerYear((y) => y - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                            aria-label="Năm trước"
                          >
                            ‹
                          </button>
                          <div className="text-sm font-semibold text-slate-700">{pickerYear}</div>
                          <button
                            type="button"
                            onClick={() => setPickerYear((y) => y + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                            aria-label="Năm sau"
                          >
                            ›
                          </button>
                        </div>
                        {/* close button removed: picker will close when clicking outside or pressing ESC */}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 12 }).map((_, i) => {
                          const m = i + 1;
                          const yy = pickerYear;
                          const val = `${yy}-${String(m).padStart(2, '0')}`;
                          const isSelected = form.period === val;
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                onChange('period', val);
                                setShowMonthPicker(false);
                              }}
                              aria-pressed={isSelected}
                              className={
                                'w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ' + (isSelected ? 'bg-slate-100' : 'hover:bg-slate-50')
                              }
                            >
                              {`Tháng ${m}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Ngày lập</label>
                  <input
                    type="date"
                    value={form.issueDate ?? ""}
                    onChange={(e) => onChange("issueDate", e.target.value)}
                    className={"mt-1 " + inputCls}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Hạn thanh toán</label>
                  <input
                    type="date"
                    value={form.dueDate ?? ""}
                    onChange={(e) => onChange("dueDate", e.target.value)}
                    className={"mt-1 " + inputCls}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Mẫu in hóa đơn <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={String(form.printTemplate ?? "")}
                    onChange={(e) => onChange("printTemplate", e.target.value)}
                    className={"mt-1 " + inputCls}
                  >
                    <option value="">-- Chọn mẫu in --</option>
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                  </select>
                </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-slate-700">Dịch vụ tính phí</h3>
              </div>
              <button
                onClick={() =>
                  setForm((s: any) => ({
                    ...s,
                    items: [
                      ...(s.items || []),
                      {
                        serviceName: "",
                        unitPrice: "",
                        meterIndex: "",
                        initialIndex: "",
                        meter: "",
                        quantity: "",
                        vat: "",
                        billingDate: "",
                        fromDate: "",
                        toDate: "",
                        amount: "",
                      },
                    ],
                  }))
                }
                className="inline-flex items-center gap-2 bg-slate-700 text-white p-2 rounded-md hover:bg-slate-800"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2">
              <AdminTable headers={["Dịch vụ", "Công tơ", "Chỉ số đầu", "Số lượng", "Đơn giá", "Đơn vị tính", "Ngày tính phí", ""]}>
                {(form.items || []).length === 0
                  ? null
                  : (form.items || []).map((it: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-700">{it.serviceName ?? "-"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-700">{(it.meter as any) ?? '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-700">{(it.initialIndex as any) ?? '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-700">{(it.quantity as any) ?? '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={(it.unitPrice !== undefined && it.unitPrice !== null) ? stripTrailingDotZero(it.unitPrice) : ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setForm((s: any) => {
                                const arr = [...(s.items || [])];
                                arr[idx] = { ...arr[idx], unitPrice: v };
                                return { ...s, items: arr };
                              });
                            }}
                            className={inputCls}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-700">{tUnit(it.unit) ?? (it.unit || "-")}</div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            value={(it.billingDate as any) ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setForm((s: any) => {
                                const arr = [...(s.items || [])];
                                arr[idx] = { ...arr[idx], billingDate: v };
                                return { ...s, items: arr };
                              });
                            }}
                            className={inputCls}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            title="Xóa"
                            onClick={() =>
                              setForm((s: any) => {
                                const arr = [...(s.items || [])];
                                arr.splice(idx, 1);
                                return { ...s, items: arr };
                              })
                            }
                            className="p-2 rounded bg-red-600 text-white hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
              </AdminTable>
            </div>
        </div>
      </div>
    </div>
  );
}

