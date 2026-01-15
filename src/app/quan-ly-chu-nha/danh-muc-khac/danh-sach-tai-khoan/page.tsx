"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "@/components/AdminTable";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { PlusCircle, Edit3, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import { bankAccountService } from "../../../../services/bankAccountService";
import { formatMoneyVND } from '@/utils/format-number';

type BankAccount = {
  id: number;
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  branch?: string | null;
  isDefault?: boolean;
  note?: string | null;
  balance?: number;
};

export default function DanhSachTaiKhoanPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<BankAccount[]>([]);
  const [balancesMap, setBalancesMap] = useState<Record<number, number>>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const { items, meta } = await bankAccountService.hostList({ page: p, limit });
      const list = items || [];
      // build balances map from returned items if present
      const map: Record<number, number> = {};
      list.forEach((it: any) => { if (it && (it.balance !== undefined && it.balance !== null)) map[it.id] = Number(it.balance); });
      // if no balances found on items, fetch balances endpoint as fallback
      if (Object.keys(map).length === 0) {
        try {
          const bals = await bankAccountService.hostBalances();
          const bm: Record<number, number> = {};
          (Array.isArray(bals) ? bals : []).forEach((b: any) => { bm[b.id] = Number(b.balance ?? 0); });
          setBalancesMap(bm);
        } catch (err) {
          console.error('Không thể tải số dư tài khoản', err);
          setBalancesMap({});
        }
      } else {
        setBalancesMap(map);
      }
      setRows(list as BankAccount[]);
      setTotal(meta?.total ?? 0);
    } catch (err: any) {
      toast.error(err?.message ?? "Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, []);

  return (
    <div className="p-6">
      <Panel title="Danh sách tài khoản ngân hàng">
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-600 text-sm">Quản lý tài khoản ngân hàng để hiển thị cho khách thanh toán.</div>
          <Link href="/quan-ly-chu-nha/danh-muc-khac/danh-sach-tai-khoan/create" className="inline-flex items-center justify-center bg-emerald-600 text-white p-2 rounded-md hover:bg-emerald-700" title="Thêm tài khoản">
            <PlusCircle className="w-5 h-5" />
          </Link>
        </div>

        <AdminTable headers={["ID","Chủ tài khoản", "Số tài khoản", "Ngân hàng", "Chi nhánh", "Số dư", "Ghi chú", "Hành động"]} loading={loading}>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-3 py-2 align-top">{r.id}</td>
              <td className="px-3 py-2 align-top">{r.accountHolder}</td>
              <td className="px-3 py-2 align-top">{r.accountNumber}</td>
              <td className="px-3 py-2 align-top">{r.bankName}</td>
              <td className="px-3 py-2 align-top">{r.branch || "-"}</td>
              <td className="px-3 py-2 align-top">{formatMoneyVND(Number(r?.balance))}</td>
              <td className="px-3 py-2 align-top">{r.note || ""}</td>
              <td className="px-3 py-2 align-top">
                <div className="flex items-center gap-2">
                  <Link href={`/quan-ly-chu-nha/danh-muc-khac/danh-sach-tai-khoan/${r.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa">
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button
                    className="inline-flex items-center justify-center p-2 rounded-md bg-rose-600 text-white hover:bg-rose-700"
                    title="Xóa"
                    onClick={async () => {
                      const ok = window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?");
                      if (!ok) return;
                      try {
                        await bankAccountService.hostDelete(r.id);
                        toast.success("Đã xóa tài khoản");
                        load(page);
                      } catch (err: any) {
                        toast.error(err?.message ?? "Không thể xóa tài khoản");
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>

        <Pagination page={page} limit={limit} total={total} onPageChange={(p) => { setPage(p); load(p); }} />
      </Panel>
    </div>
  );
}
