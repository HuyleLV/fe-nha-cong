"use client";

import React, { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from '@/components/AdminTable';
import { contractService } from '@/services/contractService';
import Link from 'next/link';
import { Edit3, Trash2, FileText, Clock, AlertTriangle, XCircle, PlusCircle } from 'lucide-react';
import type { ContractRow, ContractStats } from '@/type/contract';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import { formatMoneyVND } from '@/utils/format-number';
import { tContractStatus } from '@/app/admin/i18n';

type Row = ContractRow;

export default function HopDongAdminPage(){
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit };
      // admin: do not restrict by ownerId so we see all contracts
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

  useEffect(() => { load(1); }, []);

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

  return (
    <div className="p-6">
      <Panel title="Hợp đồng" actions={(
        <Link href="/admin/khach-hang/hop-dong/create" aria-label="Tạo hợp đồng" className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
          <PlusCircle className="w-5 h-5" />
        </Link>
      )}>
        <p className="text-sm text-slate-600 mb-4">Quản lý hợp đồng thuê (admin).</p>

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
                    <Link href={`/admin/khach-hang/hop-dong/${r.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa">
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
    </div>
  );
}

