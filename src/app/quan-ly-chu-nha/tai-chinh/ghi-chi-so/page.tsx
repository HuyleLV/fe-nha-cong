"use client";

import React, { useEffect, useState } from "react";
import { PlusCircle, Edit3, Trash2, CheckCircle, Clock, Eye, Zap } from 'lucide-react';
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from '@/components/AdminTable';
import Pagination from '@/components/Pagination';
import { meterReadingService } from '@/services/meterReadingService';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function GhiChiSoListPage(){
  const translateMeterType = (t?: string) => {
    if (!t) return '';
    if (t === 'electricity') return 'Công tơ điện';
    if (t === 'water') return 'Công tơ nước';
    return t;
  };
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [stats, setStats] = useState({ notFinalized: 0, reviewed: 0, notReviewed: 0, totalConsumption: 0 });
  const router = useRouter();
  const [approvingIds, setApprovingIds] = useState<number[]>([]);

  const isReviewed = (r: any) => {
    if (!r?.items || !Array.isArray(r.items) || r.items.length === 0) return false;
    // if any item has null readingDate -> not finalized -> can't be reviewed
    const hasNullDate = r.items.some((it: any) => it.readingDate == null || it.readingDate === null);
    if (hasNullDate) return false;
    // reviewed if any item has images array with length > 0
    return r.items.some((it: any) => Array.isArray(it.images) && it.images.length > 0);
  };

  const onToggleApprove = async (id: number, currentlyReviewed: boolean) => {
    if (approvingIds.includes(id)) return;
    try {
      setApprovingIds((s) => [...s, id]);
      await meterReadingService.approve(id, !currentlyReviewed);
      await load(meta.page, meta.limit);
      await loadStats();
      toast.success(!currentlyReviewed ? 'Đã duyệt' : 'Đã chuyển thành chưa duyệt');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Cập nhật thất bại');
    } finally {
      setApprovingIds((s) => s.filter(x => x !== id));
    }
  };

  const load = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await meterReadingService.list({ page, limit });
      const payload = (res as any) ?? {};
      const data = payload.items ?? payload.data ?? payload;
      const m = payload.meta ?? { page, limit, totalPages: Array.isArray(data) ? Math.ceil(data.length / limit) : 1, total: Array.isArray(data) ? data.length : 0 };
      setRows(Array.isArray(data) ? data : []);
      setMeta(m);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách');
      setRows([]);
      setMeta({ page: 1, limit: 10, totalPages: 1, total: 0 });
    } finally { setLoading(false); }
  };

  const loadStats = async () => {
    try {
      const res = await meterReadingService.stats();
      const payload = (res as any) ?? {};
      setStats({
        notFinalized: Number(payload.notFinalized ?? 0),
        reviewed: Number(payload.reviewed ?? 0),
        notReviewed: Number(payload.notReviewed ?? 0),
        totalConsumption: Number(payload.totalConsumption ?? 0),
      });
    } catch (e) {
      console.error('[loadStats] error', e);
      // keep defaults
    }
  };

  useEffect(() => { load(meta.page, meta.limit); loadStats(); }, []);

  const onDelete = async (id: number) => {
    if (!confirm('Xoá ghi chỉ số này?')) return;
    try {
      await meterReadingService.remove(id);
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Không xoá được');
    }
  };

  return (
    <div className="p-6">
      <Panel title="Ghi chỉ số">
          <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">Danh sách các bản ghi chỉ số của bạn.</p>
          <div>
            <button onClick={() => router.push('/quan-ly-chu-nha/tai-chinh/ghi-chi-so/create')} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md" title="Thêm mới"><PlusCircle className="w-5 h-5"/></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <button type="button" className={`w-full flex items-center gap-4 p-4 rounded-lg shadow-sm ${'bg-amber-50'}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 text-amber-700 shadow-sm"><Clock className="w-6 h-6" /></div>
            <div className="flex-1 text-left">
              <div className="text-sm text-slate-500 font-medium">Chưa chốt</div>
              <div className="text-2xl font-semibold text-slate-800">{stats.notFinalized}</div>
            </div>
          </button>

          <button type="button" className={`w-full flex items-center gap-4 p-4 rounded-lg shadow-sm ${'bg-emerald-50'}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 shadow-sm"><CheckCircle className="w-6 h-6" /></div>
            <div className="flex-1 text-left">
              <div className="text-sm text-slate-700 font-medium">Đã duyệt</div>
              <div className="text-2xl font-semibold text-emerald-700">{stats.reviewed}</div>
            </div>
          </button>

          <button type="button" className={`w-full flex items-center gap-4 p-4 rounded-lg shadow-sm ${'bg-slate-50'}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-slate-50 text-slate-700 shadow-sm"><Eye className="w-6 h-6" /></div>
            <div className="flex-1 text-left">
              <div className="text-sm text-slate-700 font-medium">Chưa duyệt</div>
              <div className="text-2xl font-semibold text-slate-700">{stats.notReviewed}</div>
            </div>
          </button>

          <button type="button" className={`w-full flex items-center gap-4 p-4 rounded-lg shadow-sm ${'bg-sky-50'}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-sky-50 text-sky-700 shadow-sm"><Zap className="w-6 h-6" /></div>
            <div className="flex-1 text-left">
              <div className="text-sm text-slate-600">Tiêu thụ</div>
              <div className="text-2xl font-semibold text-slate-800">{String(stats.totalConsumption).replace(/\.00$/,'')}</div>
            </div>
          </button>
        </div>

        <AdminTable headers={["ID", "Tòa nhà", "Căn hộ", "Loại", "Chỉ số đầu", "Chỉ số cuối", "Tiêu thụ", "Tháng", "Ngày chốt", "Hành động"]} loading={loading}>
          {rows.length === 0 ? null : rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-3 text-left">{r.id}</td>
              <td className="px-4 py-3 text-left">{r.buildingName ?? r.buildingId}</td>
              <td className="px-4 py-3 text-left">{r.apartmentTitle ?? r.apartmentId}</td>
              <td className="px-4 py-3 text-left">{translateMeterType(r.meterType)}</td>
              <td className="px-4 py-3 text-left">{(r.items && r.items[0] && r.items[0].previousIndex) ? String(r.items[0].previousIndex).replace(/\.00$/,'') : ''}</td>
              <td className="px-4 py-3 text-left">{(r.items && r.items[0] && r.items[0].newIndex) ? String(r.items[0].newIndex).replace(/\.00$/,'') : ''}</td>
              <td className="px-4 py-3 text-left">{(() => {
                const prev = r.items && r.items[0] && r.items[0].previousIndex ? parseFloat(String(r.items[0].previousIndex)) : 0;
                const next = r.items && r.items[0] && r.items[0].newIndex ? parseFloat(String(r.items[0].newIndex)) : 0;
                const val = (next - prev) || 0;
                return String(val).replace(/\.00$/,'');
              })()}</td>
              <td className="px-4 py-3 text-left">{r.period}</td>
              <td className="px-4 py-3 text-left">{r.readingDate ? new Date(r.readingDate).toLocaleDateString() : ''}</td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button title="Sửa" onClick={() => router.push(`/quan-ly-chu-nha/tai-chinh/ghi-chi-so/${r.id}`)} className="p-2 rounded bg-emerald-600 text-white">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {(() => {
                    const reviewedFlag = isReviewed(r);
                    const busy = approvingIds.includes(r.id);
                    return (
                      <button
                        title={reviewedFlag ? 'Chưa duyệt' : 'Duyệt'}
                        onClick={() => onToggleApprove(r.id, reviewedFlag)}
                        disabled={busy}
                        className={`inline-flex items-center justify-center p-2 rounded-md text-white ${reviewedFlag ? 'bg-slate-600 hover:bg-slate-700' : 'bg-sky-600 hover:bg-sky-700'}`}>
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    );
                  })()}

                  <button title="Xoá" onClick={() => onDelete(r.id)} className="p-2 rounded bg-red-600 text-white">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        <div className="mt-4">
          <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={(p) => load(p, meta.limit)} />
        </div>
      </Panel>
    </div>
  );
}
