"use client";

import React, { useEffect, useState, useRef } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from '@/components/AdminTable';
import { userService } from '@/services/userService';
import { contractService } from '@/services/contractService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit3, Trash2, FileText, Clock, AlertTriangle, XCircle, Plus, PlusCircle, Eye } from 'lucide-react';
import type { ContractRow, ContractStats } from '@/type/contract';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import { formatMoneyVND } from '@/utils/format-number';
import { tContractStatus } from '@/app/admin/i18n';

type Row = ContractRow;

export default function HopDongPage(){
  const [rows, setRows] = useState<Row[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [meId, setMeId] = useState<number | null>(null);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit };
      if (meId) params.ownerId = meId;
      const res = await contractService.list(params);
      const items = res.data ?? [];
      const meta = res.meta ?? {};
      setTotal(meta.total ?? 0);
      setPage(meta.page ?? p);
      setRows(items as any[]);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [meId]);

  useEffect(() => {
    (async () => {
      try {
        const me = await userService.getMe();
        if (me && me.id) setMeId(me.id);
      } catch (err) {}
    })();
  }, []);

  // load stats
  const [stats, setStats] = useState<ContractStats>({});
  useEffect(() => {
    (async () => {
      try {
        const s = await contractService.stats();
        setStats(s || {});
      } catch (err) { console.error(err); }
    })();
  }, []);

  const onDelete = async (r: Row) => {
    if (!confirm(`Xóa hợp đồng #${r.id} ?`)) return;
    try {
      const id = Number(r.id);
      if (!id) { toast.error('Không tìm thấy id hợp đồng'); return; }
      await contractService.remove(id);
      toast.success('Đã xóa hợp đồng');
      await load();
    } catch (err) { console.error(err); toast.error('Lỗi khi xóa hợp đồng'); }
  };

  // Viewer modal state (reuse invoice viewer pattern)
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

      // (Don't hide header/sidebar in the parent document here.)
      // The iframe content will be adjusted via injectHideIntoIframe to hide its own header/sidebar.
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
    (window as any).__openContractViewer = (id: number) => {
      setViewerId(id);
      setViewerOpen(true);
    };
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

  // status change removed from this page

  return (
    <div className="p-6">
      <Panel title="Hợp đồng" actions={(
        <Link href="/quan-ly-chu-nha/khach-hang/hop-dong/create" aria-label="Tạo hợp đồng" className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
          <PlusCircle className="w-5 h-5" />
        </Link>
      )}>
        <p className="text-sm text-slate-600 mb-4">Quản lý hợp đồng thuê giữa chủ nhà và khách.</p>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="p-4 bg-white rounded shadow flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-center text-emerald-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Tất cả</div>
              <div className="text-2xl font-semibold">{stats.total ?? total}</div>
            </div>
          </div>
          <div className="p-4 bg-white rounded shadow flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 ring-1 ring-amber-200 flex items-center justify-center text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Sắp hết hạn</div>
              <div className="text-2xl font-semibold">{stats.expiringSoon ?? 0}</div>
            </div>
          </div>
          <div className="p-4 bg-white rounded shadow flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-50 ring-1 ring-rose-200 flex items-center justify-center text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Quá hạn</div>
              <div className="text-2xl font-semibold">{stats.expired ?? 0}</div>
            </div>
          </div>
          <div className="p-4 bg-white rounded shadow flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center text-slate-700">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Đã thanh lý</div>
              <div className="text-2xl font-semibold">{stats.terminated ?? 0}</div>
            </div>
          </div>
        </div>

        <AdminTable headers={["Mã hợp đồng","Trạng thái","Vị trí","Khách hàng","Giá thuê","Tiền cọc","Ngày bắt đầu","Ngày kết thúc","Hành động"]} loading={loading} emptyText="Chưa có hợp đồng">
          {Array.isArray(rows) ? (
            rows.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{r.id}</td>
                <td className="px-4 py-3">{r.status ? tContractStatus(String(r.status)) : '-'}</td>
                <td className="px-4 py-3">{(r.buildingId ? `Tòa ${r.buildingId}` : '-')}{r.apartmentId ? ` / Căn ${r.apartmentId}` : ''}</td>
                <td className="px-4 py-3">{r.customerName ?? r.customer?.name ?? r.customerId ?? '-'}</td>
                <td className="px-4 py-3">{r.rentAmount != null ? formatMoneyVND(r.rentAmount as any) : '-'}</td>
                <td className="px-4 py-3">{r.depositAmount != null ? formatMoneyVND(r.depositAmount as any) : '-'}</td>
                <td className="px-4 py-3">{r.startDate ? new Date(r.startDate).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3">{r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      title="Xem"
                      onClick={() => { setViewerId(Number(r.id)); setViewerOpen(true); }}
                      className="inline-flex items-center justify-center p-2 rounded-md border border-slate-200 hover:bg-slate-50"
                    >
                      <Eye className="w-4 h-4 text-slate-700" />
                    </button>
                    <Link href={`/quan-ly-chu-nha/khach-hang/hop-dong/${r.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa">
                      <Edit3 className="w-4 h-4 text-white" />
                    </Link>
                    <button title="Xóa" onClick={() => onDelete(r)} className="p-2 rounded bg-red-500 hover:bg-red-600">
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            (() => { console.error('Expected rows to be an array but got:', rows); return (<tr><td colSpan={9} className="px-4 py-3 text-center text-sm text-slate-500">Dữ liệu không hợp lệ</td></tr>); })()
          )}
        </AdminTable>
        <Pagination page={page} limit={limit} total={total} onPageChange={(p) => load(p)} />
      </Panel>
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
