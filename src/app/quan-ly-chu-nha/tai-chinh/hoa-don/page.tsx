"use client";

import React, { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from "@/components/AdminTable";
import Pagination from '@/components/Pagination';
import { useRouter } from "next/navigation";
import { PlusCircle, Edit3, Trash2, DollarSign, Home, Settings, CreditCard, Repeat, CheckCircle2, AlertCircle } from "lucide-react";
import { formatMoneyVND } from '@/utils/format-number';
import { toast } from "react-toastify";
import { invoiceService } from "@/services/invoiceService";

export default function HoaDonPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const router = useRouter();

  const load = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await invoiceService.list({ page, limit });
      const payload = (res as any) ?? {};
      const data = payload.items ?? payload.data ?? payload;
      const m = payload.meta ?? { page, limit, totalPages: Array.isArray(data) ? Math.ceil(data.length / limit) : 1, total: Array.isArray(data) ? data.length : 0 };
      setRows(Array.isArray(data) ? data : []);
      setMeta(m);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách hóa đơn");
      setRows([]);
      setMeta({ page: 1, limit: 10, totalPages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(meta.page, meta.limit);
  }, []);

  // --- compute summary values from rows (best-effort) ---
  const parseNum = (v: any) => {
    if (v === undefined || v === null || v === '') return 0;
    const s = String(v).replace(/[^0-9.-]+/g, '');
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };

  const computeItemAmount = (it: any) => {
    if (!it) return 0;
    if (it.amount) return parseNum(it.amount);
    const up = parseNum(it.unitPrice);
    const q = parseNum(it.quantity);
    if (up && q) return up * q;
    return 0;
  };

  const totalMoney = (rows || []).reduce((sum: number, r: any) => {
    const items = Array.isArray(r.items) ? r.items : [];
    if (items.length) return sum + items.reduce((s: number, it: any) => s + computeItemAmount(it), 0);
    // fallback: use r.total or r.amount if present
    return sum + (parseNum(r.total) || parseNum(r.amount) || 0);
  }, 0);

  const rentKeywords = ['nhà', 'thuê', 'phòng', 'tiền nhà', 'tiền thuê'];
  const rentMoney = (rows || []).reduce((sum: number, r: any) => {
    const items = Array.isArray(r.items) ? r.items : [];
    if (items.length) return sum + items.reduce((s: number, it: any) => {
      const name = String(it?.serviceName || '').toLowerCase();
      return rentKeywords.some(k => name.includes(k)) ? s + computeItemAmount(it) : s;
    }, 0);
    return sum;
  }, 0);

  const serviceMoney = totalMoney - rentMoney;
  // Collected/refunded are not part of invoice list shape — default 0 or try fields
  const totalCollected = (rows || []).reduce((s: number, r: any) => s + (parseNum(r.collected) || 0), 0);
  const totalRefunded = (rows || []).reduce((s: number, r: any) => s + (parseNum(r.refunded) || 0), 0);
  const collected = totalCollected;
  const due = totalMoney - collected + totalRefunded;

  const onDelete = async (id: number) => {
    if (!confirm("Xoá hóa đơn này?")) return;
    try {
      await invoiceService.remove(id);
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Không xoá được");
    }
  };

  // Map printTemplate slug/value -> human label
  const printTemplateLabel = (val: any) => {
    if (!val && val !== 0) return "";
    const v = String(val || "").trim();
    const map: Record<string, string> = {
      'hoa-don-dat-coc': 'Hóa đơn đặt cọc',
      'hoa-don-hang-thang': 'Hóa đơn hàng tháng',
      'hoa-don-thanh-ly-hop-dong': 'Hóa đơn tiền thanh lý hợp đồng trước hạn và đúng hạn',
      'hoa-don-hoan-tien-dat-coc': 'Hóa đơn hoàn tiền đặt cọc',
      'hoa-don-chuyen-nhuong': 'Hóa đơn chuyển nhượng phòng',
      'hoa-don-hop-dong-moi': 'Hóa đơn hợp đồng mới',
    };
    return map[v] ?? v;
  };

  return (
    <div className="p-6">
      {/* Summary blocks */}
      <div className="max-w-screen-2xl mx-auto px-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <div className="p-2 bg-emerald-100 rounded-md"><DollarSign className="w-6 h-6 text-emerald-700" /></div>
            <div>
              <div className="text-xs text-slate-500">Tổng tiền</div>
              <div className="font-semibold text-slate-800">{formatMoneyVND(totalMoney)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="p-2 bg-blue-100 rounded-md"><Home className="w-6 h-6 text-blue-700" /></div>
            <div>
              <div className="text-xs text-slate-500">Tiền nhà</div>
              <div className="font-semibold text-slate-800">{formatMoneyVND(rentMoney)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            <div className="p-2 bg-yellow-100 rounded-md"><Settings className="w-6 h-6 text-yellow-700" /></div>
            <div>
              <div className="text-xs text-slate-500">Tiền dịch vụ</div>
              <div className="font-semibold text-slate-800">{formatMoneyVND(serviceMoney)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <div className="p-2 bg-emerald-100 rounded-md"><CreditCard className="w-6 h-6 text-emerald-700" /></div>
            <div>
              <div className="text-xs text-slate-500">Tổng tiền thu</div>
              <div className="font-semibold text-slate-800">{formatMoneyVND(totalCollected)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
            <div className="p-2 bg-red-100 rounded-md"><Repeat className="w-6 h-6 text-red-700" /></div>
            <div>
              <div className="text-xs text-slate-500">Tổng tiền hoàn</div>
              <div className="font-semibold text-slate-800">{formatMoneyVND(totalRefunded)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <div className="p-2 bg-emerald-100 rounded-md"><CheckCircle2 className="w-6 h-6 text-emerald-700" /></div>
            <div>
              <div className="text-xs text-slate-500">Đã thu</div>
              <div className="font-semibold text-slate-800">{formatMoneyVND(collected)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            <div className="p-2 bg-yellow-100 rounded-md"><AlertCircle className="w-6 h-6 text-yellow-700" /></div>
            <div>
              <div className="text-xs text-slate-500">Phải thu</div>
              <div className="font-semibold text-slate-800">{formatMoneyVND(due)}</div>
            </div>
          </div>
        </div>
      </div>

      <Panel title="Hóa đơn">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">Danh sách hóa đơn của bạn.</p>
          <div>
            <button
              onClick={() => router.push("/quan-ly-chu-nha/tai-chinh/hoa-don/create")}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md"
              title="Thêm mới"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <AdminTable
          headers={[
            "ID",
            "Tòa nhà",
            "Căn hộ",
            "Hợp đồng",
            "Kỳ",
            "Ngày lập",
            "Hạn thanh toán",
            "Hóa đơn",
            "Hành động",
          ]}
          loading={loading}
        >
          {rows.length === 0
            ? null
            : rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 text-left">{r.id}</td>
                  <td className="px-4 py-3 text-left">{r.buildingName ?? r.buildingId}</td>
                  <td className="px-4 py-3 text-left">{r.apartmentTitle ?? r.apartmentId}</td>
                  <td className="px-4 py-3 text-left">{r.contractId ?? ""}</td>
                  <td className="px-4 py-3 text-left">{r.period}</td>
                  <td className="px-4 py-3 text-left">{r.issueDate ? new Date(r.issueDate).toLocaleDateString() : ""}</td>
                  <td className="px-4 py-3 text-left">{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : ""}</td>
                  <td className="px-4 py-3 text-left">{printTemplateLabel(r.printTemplate)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Sửa"
                        onClick={() => router.push(`/quan-ly-chu-nha/tai-chinh/hoa-don/${r.id}`)}
                        className="p-2 rounded bg-emerald-600 text-white"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        title="Xoá"
                        onClick={() => onDelete(r.id)}
                        className="p-2 rounded bg-red-600 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
        </AdminTable>
        <div className="mt-4">
          <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={(p)=> load(p, meta.limit)} />
        </div>
      </Panel>
    </div>
  );
}
