"use client";

import React, { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from '@/components/AdminTable';
import { userService } from "@/services/userService";
import Link from 'next/link';
import { Edit3, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import ConfirmModal from '@/components/ConfirmModal';

type CustomerRow = {
  id: number;
  name: string;
  phone?: string;
  gender?: string | null;
  idCardFront?: string | null;
  idCardBack?: string | null;
  idCardNumber?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
};

export default function AdminCuDanPage(){
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetRow, setTargetRow] = useState<CustomerRow | null>(null);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit };
      // admin: show all residents (no ownerId, no hasContractOrDeposit filter)
      const res = await userService.listAdminUsers(params);
      const users = res.data ?? [];
      const meta = res.meta ?? {};
      setTotal(meta.total ?? 0);
      setPage(meta.page ?? p);
      const mapped = (users as any[]).map((u) => ({
        id: u.id,
        name: u.name ?? '',
        phone: u.phone ?? '',
        gender: u.gender ?? null,
        idCardFront: u.idCardFront ?? null,
        idCardBack: u.idCardBack ?? null,
        idCardNumber: u.idCardNumber ?? null,
        dateOfBirth: u.dateOfBirth ?? null,
        address: u.address ?? null,
      }));
      setRows(mapped);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []);

  const onDelete = async (r: CustomerRow) => {
    setTargetRow(r);
    setConfirmOpen(true);
  };

  return (
    <div className="p-6">
      <Panel title="Cư dân">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">Danh sách cư dân (admin).</p>
        </div>

        <AdminTable
          headers={["Mã KH", "Tên cư dân", "Số điện thoại", "Giới tính", "CCCD", "Ngày sinh", "Địa chỉ", "Hành động"]}
          loading={loading}
          emptyText="Chưa có cư dân nào"
        >
          {Array.isArray(rows) ? (
            rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 text-left">{r.id}</td>
                <td className="px-4 py-3 text-left">{r.name}</td>
                <td className="px-4 py-3">{r.phone}</td>
                <td className="px-4 py-3">{r.gender ? (r.gender === 'male' ? 'Nam' : r.gender === 'female' ? 'Nữ' : 'Khác') : ''}</td>
                <td className="px-4 py-3">{r.idCardNumber ?? (r.idCardFront || r.idCardBack ? 'Có' : 'Chưa')}</td>
                <td className="px-4 py-3">{r.dateOfBirth ? new Date(r.dateOfBirth).toLocaleDateString() : ''}</td>
                <td className="px-4 py-3">{r.address ?? ''}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/khach-hang/cu-dan/${r.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa">
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
            (() => {
              console.error('Expected rows to be an array but got:', rows);
              return (
                <tr>
                  <td colSpan={8} className="px-4 py-3 text-center text-sm text-slate-500">Dữ liệu không hợp lệ</td>
                </tr>
              );
            })()
          )}
        </AdminTable>
        <Pagination page={page} limit={limit} total={total} onPageChange={(p) => load(p)} />

        <ConfirmModal
          open={confirmOpen}
          title="Xoá cư dân"
          message={`Xoá cư dân "${targetRow?.name ?? ''}" ?`}
          onCancel={() => { setConfirmOpen(false); setTargetRow(null); }}
          onConfirm={async () => {
            if (!targetRow) return;
            try {
              await userService.deleteAdminUser(targetRow.id);
              toast.success('Đã xóa');
              await load();
            } catch (err) { console.error(err); toast.error('Lỗi khi xóa'); }
            finally { setConfirmOpen(false); setTargetRow(null); }
          }}
        />

      </Panel>
    </div>
  );
}

