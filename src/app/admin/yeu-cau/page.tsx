"use client";

import React, { useEffect, useState } from 'react';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import AdminTable from '@/components/AdminTable';
import Pagination from '@/components/Pagination';
import { serviceRequestService } from '@/services/serviceRequestService';
import { serviceRequestStatusLabel, SERVICE_REQUEST_STATUS_LABELS } from '@/utils/status';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { useServiceRequestsSocket } from '@/hooks/useServiceRequestsSocket';

const TYPE_LABEL: Record<string, string> = { fire: 'Báo cháy', repair: 'Sửa chữa' };

export default function AdminServiceRequestsPage(){
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pageCount: 0 });
  const [loading, setLoading] = useState(false);
  const { items: realtimeItems } = useServiceRequestsSocket({ isAdmin: true });
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const STATUS_OPTIONS = Object.keys(SERVICE_REQUEST_STATUS_LABELS);

  const load = async (page = 1, limit = 20) => {
    setLoading(true);
    try{
      const r = await serviceRequestService.getAll({ page, limit });
      const data = Array.isArray((r as any)?.items) ? (r as any).items : [];
      const m = (r as any)?.meta || { page, limit, total: data.length, pageCount: Math.ceil(data.length / limit) };
      setItems(data);
      setMeta({ page: m.page || page, limit: m.limit || limit, total: m.total || 0, pageCount: m.pageCount || Math.ceil((m.total || 0) / (m.limit || limit)) });
    }catch(e){
      console.error(e);
      setItems([]);
      setMeta({ page, limit, total: 0, pageCount: 0 });
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ load(meta.page, meta.limit); }, []);
  // Reload first page when a new realtime request arrives
  useEffect(()=>{ if (realtimeItems.length > 0) { load(1, meta.limit); } }, [realtimeItems.length]);
  const [delOpen, setDelOpen] = useState(false);
  const [delId, setDelId] = useState<number | null>(null);
  const removeOne = async () => {
    if (!delId) { setDelOpen(false); return; }
    try {
      await serviceRequestService.remove(delId);
      toast.success('Đã xoá yêu cầu');
      setDelOpen(false);
      setDelId(null);
      await load(meta.page, meta.limit);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || e?.message || 'Không thể xoá yêu cầu');
    }
  };

  const changeStatus = async (id: number, nextStatus: string) => {
    setStatusUpdatingId(id);
    try {
      await serviceRequestService.update(id, { status: nextStatus });
      setItems(prev => prev.map(it => it.id === id ? { ...it, status: nextStatus } : it));
      toast.success('Đã cập nhật trạng thái');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || e?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setStatusUpdatingId(null);
    }
  };


  return (
    <div className="p-6">
      <Panel title="Yêu cầu từ cư dân">
        <AdminTable headers={["ID","Thời gian","Loại","Tiêu đề","Tòa nhà","Căn hộ","Trạng thái","Hành động"]} loading={loading} emptyText="Không có dữ liệu">
          {!loading && items.map((it:any)=> (
            <tr key={it.id}>
              <td className="px-4 py-3">{it.id}</td>
              <td className="px-4 py-3">{it.requestedAt ? new Date(it.requestedAt).toLocaleString() : (it.createdAt ? new Date(it.createdAt).toLocaleString() : '-')}</td>
              <td className="px-4 py-3">{TYPE_LABEL[it.type as string] ?? (it.type ?? '-')}</td>
              <td className="px-4 py-3 text-left">{it.title}</td>
              <td className="px-4 py-3">{it.buildingId ?? '-'}</td>
              <td className="px-4 py-3">{it.apartmentId ?? '-'}</td>
              <td className="px-4 py-3">
                <select
                  value={it.status ?? 'pending'}
                  onChange={(e)=> changeStatus(Number(it.id), e.target.value)}
                  disabled={statusUpdatingId === Number(it.id)}
                  className="border border-slate-300 rounded-md px-2 py-1 text-sm bg-white"
                >
                  {STATUS_OPTIONS.map((s)=> (
                    <option value={s} key={s}>{SERVICE_REQUEST_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => { setDelId(Number(it.id)); setDelOpen(true); }}
                  className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                  title="Xoá"
                  aria-label="Xoá yêu cầu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
        <ConfirmModal
          open={delOpen}
          title="Xác nhận xoá"
          message="Bạn có chắc muốn xoá yêu cầu này? Hành động này không thể hoàn tác."
          onCancel={() => { setDelOpen(false); setDelId(null); }}
          onConfirm={removeOne}
          confirmLabel="Xoá"
          cancelLabel="Huỷ"
        />
        <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={(p)=> load(p, meta.limit)} />

        
      </Panel>
    </div>
  );
}
