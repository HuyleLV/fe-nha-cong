"use client";

import React, { useEffect, useState, useRef } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from "@/components/AdminTable";
import Pagination from '@/components/Pagination';
import { useRouter } from "next/navigation";
import { PlusCircle, Edit3, Trash2, DollarSign, Home, Settings, CreditCard, Repeat, CheckCircle2, AlertCircle, Eye, X } from "lucide-react";
import { formatMoneyVND } from '@/utils/format-number';
import { toast } from "react-toastify";
import { invoiceService } from "@/services/invoiceService";

export default function AdminHoaDonPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const router = useRouter();

  const load = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      // admin: fetch admin-wide invoices
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

  // Viewer modal state
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
        .floating-chat-buttons { display: none !important; visibility: hidden !important; pointer-events: none !important; }
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
    (window as any).__openInvoiceViewer = (id: number) => {
      setViewerId(id);
      setViewerOpen(true);
    };
    return () => {
      try { delete (window as any).__openInvoiceViewer; } catch (e) {}
    };
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
      a.download = `invoice-${viewerId || 'unknown'}.doc`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { console.error('Download doc failed', e); toast.error('Không thể tải file Word'); }
  };

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
          <p className="text-sm text-slate-600">Danh sách hóa đơn (admin).</p>
          <div>
            <button
              onClick={() => router.push("/admin/tai-chinh/hoa-don/create")}
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
                        title="Xem"
                        onClick={() => { (window as any).__openInvoiceViewer?.(r.id); }}
                        className="p-2 rounded bg-amber-100 text-amber-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title="Sửa"
                        onClick={() => router.push(`/admin/tai-chinh/hoa-don/${r.id}`)}
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

      {/* Viewer modal */}
      {viewerOpen && viewerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeViewer} />
          <div className="relative w-[95%] md:w-3/4 lg:w-2/3 h-[85%] bg-white rounded-lg shadow-lg overflow-hidden z-60">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="text-sm font-semibold">Xem hóa đơn #{viewerId}</div>
              <div className="flex items-center gap-2">
                <button onClick={viewerPrint} className="px-3 py-1 bg-emerald-600 text-white rounded">In / Save as PDF</button>
                <button onClick={downloadDoc} className="px-3 py-1 bg-sky-600 text-white rounded">Tải Word</button>
                <button onClick={closeViewer} className="p-2 rounded bg-slate-200" aria-label="Đóng"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <iframe
              ref={iframeRef}
              onLoad={() => injectHideIntoIframe()}
              src={`/admin/tai-chinh/print-invoice?id=${viewerId}`}
              className="w-full h-full border-0"
              title={`Invoice ${viewerId}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

