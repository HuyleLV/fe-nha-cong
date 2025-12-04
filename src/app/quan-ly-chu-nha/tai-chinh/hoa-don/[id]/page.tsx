"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminTable from "@/components/AdminTable";
import type { InvoiceItem, InvoicePayload } from "@/type/invoice";
import { toast } from "react-toastify";
import { invoiceService } from "@/services/invoiceService";
import { buildingService } from "@/services/buildingService";
import { apartmentService } from "@/services/apartmentService";
import { PlusCircle, Save, Trash2, CheckCircle2, ChevronRight } from "lucide-react";

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
  const [loading, setLoading] = useState(false);

  const inputCls =
    "h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white";

  useEffect(() => {
    (async () => {
      try {
        const res = await buildingService.getAll({ page: 1, limit: 200 });
        const items = (res as any)?.items ?? (res as any)?.data ?? res ?? [];
        setBuildings(items);
      } catch {}
    })();
    // TODO: Load real contracts when API available
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
          unitPrice: it.unitPrice ?? "",
          meterIndex: it.meterIndex ?? "",
          quantity: it.quantity ?? "",
          vat: it.vat ?? "",
          fromDate: it.fromDate ? new Date(it.fromDate).toISOString().slice(0, 10) : "",
          toDate: it.toDate ? new Date(it.toDate).toISOString().slice(0, 10) : "",
          amount: it.amount ?? "",
        })),
      });
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

  const onChange = (key: string, val: any) => setForm((s: any) => ({ ...s, [key]: val }));

  const save = async () => {
    if (!form.buildingId || !form.apartmentId || !form.period) {
      toast.error("Vui lòng điền đủ Tòa nhà, Căn hộ, Kỳ");
      return;
    }
    const payload: InvoicePayload = {
      ...form,
      items: (form.items || []).map((it: any) => ({
        serviceName: it.serviceName,
        unitPrice: it.unitPrice || null,
        meterIndex: it.meterIndex || null,
        quantity: it.quantity || null,
        vat: it.vat || null,
        fromDate: it.fromDate || null,
        toDate: it.toDate || null,
        amount: it.amount || null,
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
    <div className="mx-auto max-w-screen-lg">
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
                <label className="block text-sm font-medium">Tòa nhà</label>
                <select
                  value={form.buildingId}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onChange("buildingId", val);
                    loadApartments(val);
                  }}
                  className={"mt-1 " + inputCls}
                >
                  <option value="">-- Chọn tòa nhà --</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name || b.title || b.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Căn hộ</label>
                <select
                  value={form.apartmentId}
                  onChange={(e) => onChange("apartmentId", Number(e.target.value))}
                  className={"mt-1 " + inputCls}
                >
                  <option value="">-- Chọn căn hộ --</option>
                  {apartments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title || a.code || a.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Hợp đồng</label>
                <select
                  value={form.contractId}
                  onChange={(e) => onChange("contractId", Number(e.target.value))}
                  className={"mt-1 " + inputCls}
                >
                  <option value="">-- Chọn hợp đồng --</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code || c.name || c.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Kỳ thanh toán (YYYY-MM)</label>
                <input
                  value={form.period}
                  onChange={(e) => onChange("period", e.target.value)}
                  className={"mt-1 " + inputCls}
                  placeholder="2025-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Ngày lập</label>
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => onChange("issueDate", e.target.value)}
                  className={"mt-1 " + inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Hạn thanh toán</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => onChange("dueDate", e.target.value)}
                  className={"mt-1 " + inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Mẫu in hóa đơn</label>
                <input
                  value={form.printTemplate}
                  onChange={(e) => onChange("printTemplate", e.target.value)}
                  className={"mt-1 " + inputCls}
                  placeholder="Mặc định"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Ghi chú</label>
                <textarea
                  value={form.note}
                  onChange={(e) => onChange("note", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white p-2"
                  rows={3}
                />
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
                      quantity: "",
                      vat: "",
                      fromDate: "",
                      toDate: "",
                      amount: "",
                    },
                  ],
                }))
              }
              className="inline-flex items-center gap-2 bg-slate-700 text-white px-3 py-2 rounded-md hover:bg-slate-800"
            >
              <PlusCircle className="w-4 h-4" /> Thêm dòng
            </button>
          </div>
          <div className="p-2">
            <AdminTable headers={["Dịch vụ", "Đơn giá", "Chỉ số", "Số lượng", "VAT", "Từ ngày", "Đến ngày", "Thành tiền", ""]}>
              {(form.items || []).length === 0
                ? null
                : (form.items || []).map((it: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-3">
                        <input
                          value={it.serviceName}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForm((s: any) => {
                              const arr = [...(s.items || [])];
                              arr[idx] = { ...arr[idx], serviceName: v };
                              return { ...s, items: arr };
                            });
                          }}
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={it.unitPrice as any}
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
                        <input
                          value={it.meterIndex as any}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForm((s: any) => {
                              const arr = [...(s.items || [])];
                              arr[idx] = { ...arr[idx], meterIndex: v };
                              return { ...s, items: arr };
                            });
                          }}
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={it.quantity as any}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForm((s: any) => {
                              const arr = [...(s.items || [])];
                              arr[idx] = { ...arr[idx], quantity: v };
                              return { ...s, items: arr };
                            });
                          }}
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={it.vat as any}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForm((s: any) => {
                              const arr = [...(s.items || [])];
                              arr[idx] = { ...arr[idx], vat: v };
                              return { ...s, items: arr };
                            });
                          }}
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={it.fromDate || ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForm((s: any) => {
                              const arr = [...(s.items || [])];
                              arr[idx] = { ...arr[idx], fromDate: v };
                              return { ...s, items: arr };
                            });
                          }}
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={it.toDate || ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForm((s: any) => {
                              const arr = [...(s.items || [])];
                              arr[idx] = { ...arr[idx], toDate: v };
                              return { ...s, items: arr };
                            });
                          }}
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={it.amount as any}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForm((s: any) => {
                              const arr = [...(s.items || [])];
                              arr[idx] = { ...arr[idx], amount: v };
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

