"use client";

import React, { useEffect, useState, useRef } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from '@/components/AdminTable';
import { depositService } from '@/services/depositService';
import { userService } from '@/services/userService';
import Link from 'next/link';
import { Edit3, Trash2, PlusCircle, List as ListIcon, Clock, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { buildingService } from '@/services/buildingService';
import { apartmentService } from '@/services/apartmentService';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import { formatMoneyVND, fNumber } from '@/utils/format-number';

type Row = { id: number; status?: string; buildingId?: number; apartmentId?: number; customerInfo?: string; customerName?: string | null; customerPhone?: string | null; depositDate?: string; rentAmount?: number; depositAmount?: number };

export default function DatCocPage(){
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [meId, setMeId] = useState<number | null>(null);

  const [filter, setFilter] = useState<'all'|'pending'|'signed'|'cancelled'>('all');

  const load = async (p = page) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit };
      if (meId) params.ownerId = meId;
      const res = await depositService.list(params);
      const data = res.data ?? [];
      const meta = res.meta ?? {};
      setTotal(meta.total ?? 0);
      setPage(meta.page ?? p);
      setRows((data as any[]).map(d => ({ id: d.id, status: d.status, buildingId: d.buildingId, apartmentId: d.apartmentId, customerInfo: d.customerInfo, customerName: (d as any).customerName ?? null, customerPhone: (d as any).customerPhone ?? null, depositDate: d.depositDate, rentAmount: d.rentAmount, depositAmount: d.depositAmount })));
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [meId]);

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

  // preload buildings and apartments for display mapping
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [bRes, aRes] = await Promise.all([
          buildingService.getAll({ page: 1, limit: 200 }),
          apartmentService.getAll({ page: 1, limit: 1000 }),
        ]);
        if (!mounted) return;
        setBuildings(bRes.items || []);
        setApartments(aRes.items || []);
      } catch (e) {
        // ignore errors; we'll fall back to ids
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onDelete = async (r: Row) => {
    if (!confirm(`Xóa đặt cọc #${r.id} ?`)) return;
    try {
      await depositService.remove(r.id!);
      toast.success('Đã xóa');
      await load();
    } catch (err) { console.error(err); toast.error('Lỗi khi xóa'); }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await depositService.update(id, { status });
      toast.success('Cập nhật trạng thái thành công');
      await load();
    } catch (err) { console.error(err); toast.error('Không thể cập nhật trạng thái'); }
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

      // Do not hide parent headers/sidebars here; this will be done inside the iframe content.
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
    (window as any).__openDepositViewer = (id: number) => {
      setViewerId(id);
      setViewerOpen(true);
    };
    return () => { try { delete (window as any).__openDepositViewer; } catch (e) {} };
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
      a.download = `deposit-${viewerId || 'unknown'}.doc`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { console.error('Download doc failed', e); toast.error('Không thể tải file Word'); }
  };

  

  return (
    <div className="p-6">
      <Panel title="Đặt cọc" actions={(
        <Link href={`/quan-ly-chu-nha/khach-hang/dat-coc/new`} title="Tạo đặt cọc" aria-label="Tạo đặt cọc" className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white">
          <PlusCircle className="w-5 h-5" />
        </Link>
      )}>
        <p className="text-sm text-slate-600 mb-4">Quản lý các khoản đặt cọc của khách hàng.</p>

        {/* Add button moved into Panel actions for proper alignment with title */}

        <div className="grid grid-cols-4 gap-3 mb-4 items-stretch">
          {/** Summary boxes: All, Chờ ký hợp đồng, Đã ký hợp đồng, Bỏ cọc */}
          {(() => {
            const total = rows.length;
            const pending = rows.filter(r => (r.status ?? 'pending') === 'pending').length;
            const signed = rows.filter(r => r.status === 'signed').length;
            const cancelled = rows.filter(r => r.status === 'cancelled').length;
            const box = (title: string, count: number, key: 'all'|'pending'|'signed'|'cancelled') => {
              const isActive = filter === key;
              const base = isActive ? 'ring-1 ring-slate-200 shadow-md' : 'shadow-sm';
              if (key === 'all') {
                return (
                  <button key={key} onClick={() => setFilter(key)} className={`h-full w-full p-4 rounded flex items-center gap-3 ${base} bg-slate-50`}>
                    <div className="rounded-md bg-emerald-50 p-2">
                      <ListIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-slate-500">{title}</div>
                      <div className="text-2xl font-semibold mt-1">{count}</div>
                    </div>
                  </button>
                );
              }
              if (key === 'pending') {
                return (
                  <button key={key} onClick={() => setFilter(key)} className={`h-full w-full p-4 rounded flex items-center gap-3 ${base} bg-amber-50`}>
                    <div className="rounded-md bg-amber-50 p-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-slate-500">{title}</div>
                      <div className="text-2xl font-semibold mt-1">{count}</div>
                    </div>
                  </button>
                );
              }
              if (key === 'signed') {
                return (
                  <button key={key} onClick={() => setFilter(key)} className={`h-full w-full p-4 rounded flex items-center gap-3 ${base} bg-emerald-50`}>
                    <div className="rounded-md bg-emerald-50 p-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-slate-500">{title}</div>
                      <div className="text-2xl font-semibold mt-1">{count}</div>
                    </div>
                  </button>
                );
              }
              return (
                <button key={key} onClick={() => setFilter(key)} className={`h-full w-full p-4 rounded flex items-center gap-3 ${base} bg-rose-50`}>
                  <div className="rounded-md bg-rose-50 p-2">
                    <XCircle className="h-5 w-5 text-rose-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-slate-500">{title}</div>
                    <div className="text-2xl font-semibold mt-1">{count}</div>
                  </div>
                </button>
              );
            };
            return [
              box('Tất cả', total, 'all'),
              box('Chờ ký hợp đồng', pending, 'pending'),
              box('Đã ký hợp đồng', signed, 'signed'),
              box('Bỏ cọc', cancelled, 'cancelled'),
            ];
          })()}
        </div>

        <AdminTable headers={["Mã đặt cọc","Trạng thái","Tòa nhà","Căn hộ","Khách hàng","Giá thuê","Giá cọc","Ngày cọc","Hành động"]} loading={loading} emptyText="Chưa có đặt cọc">
          {rows.filter(r => filter === 'all' ? true : ((r.status ?? 'pending') === filter)).map(r => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-3">#{r.id}</td>
              <td className="px-4 py-3">
                <select value={r.status ?? 'pending'} onChange={(e) => updateStatus(r.id!, e.target.value)} className="rounded border px-2 py-1 text-sm">
                  <option value="pending">Chờ ký hợp đồng</option>
                  <option value="signed">Đã ký hợp đồng</option>
                  <option value="cancelled">Bỏ cọc</option>
                </select>
              </td>
              <td className="px-4 py-3">{(() => {
                const b = buildings.find(b => b.id === r.buildingId);
                if (b) return `#${b.id} • ${b.name}`;
                return r.buildingId ? `#${r.buildingId}` : '';
              })()}</td>
              <td className="px-4 py-3">{(() => {
                const a = apartments.find(a => a.id === r.apartmentId);
                if (a) return `#${a.id} • ${a.title}`;
                return r.apartmentId ? `#${r.apartmentId}` : '';
              })()}</td>
              <td className="px-4 py-3">{(() => {
                // Prefer customerName returned by API; fallback to stored customerInfo snapshot
                if ((r as any).customerName) return `${(r as any).customerName}${(r as any).customerPhone ? ' • ' + (r as any).customerPhone : ''}`;
                try {
                  const c = typeof r.customerInfo === 'string' && r.customerInfo ? JSON.parse(r.customerInfo) : r.customerInfo;
                  if (c && (c.name || c.phone)) return `${c.name || ''}${c.phone ? ' • ' + c.phone : ''}`;
                  return String(r.customerInfo ?? '');
                } catch { return String(r.customerInfo ?? ''); }
              })()}</td>
              <td className="px-4 py-3">{typeof r.rentAmount === 'number' ? fNumber(r.rentAmount) : (r.rentAmount ?? '')}</td>
              <td className="px-4 py-3">{typeof r.depositAmount === 'number' ? fNumber(r.depositAmount) : (r.depositAmount ?? '')}</td>
              <td className="px-4 py-3">{r.depositDate ? new Date(r.depositDate).toLocaleDateString() : ''}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <button
                    title="Xem"
                    onClick={() => { setViewerId(Number(r.id)); setViewerOpen(true); }}
                    className="inline-flex items-center justify-center p-2 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <Link href={`/quan-ly-chu-nha/khach-hang/dat-coc/${r.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa">
                    <Edit3 className="w-4 h-4 text-white" />
                  </Link>
                  <button title="Xóa" onClick={() => onDelete(r)} className="p-2 rounded bg-red-500 hover:bg-red-600">
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={page} limit={limit} total={total} onPageChange={(p) => load(p)} />
      </Panel>
      {/* Viewer modal for deposit preview */}
      {viewerOpen && viewerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeViewer} />
          <div className="relative w-[95%] md:w-3/4 lg:w-2/3 h-[85%] bg-white rounded-lg shadow-lg overflow-hidden z-60">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="text-sm font-semibold">Xem đặt cọc #{viewerId}</div>
              <div className="flex items-center gap-2">
                <button onClick={viewerPrint} className="px-3 py-1 bg-emerald-600 text-white rounded">In / Save as PDF</button>
                <button onClick={downloadDoc} className="px-3 py-1 bg-sky-600 text-white rounded">Tải Word</button>
                <button onClick={closeViewer} className="p-2 rounded bg-slate-200" aria-label="Đóng"><XCircle className="w-4 h-4" /></button>
              </div>
            </div>
            <iframe
              ref={iframeRef}
              onLoad={() => injectHideIntoIframe()}
              src={`/quan-ly-chu-nha/khach-hang/print-deposit?id=${viewerId}`}
              className="w-full h-full border-0"
              title={`Deposit ${viewerId}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
