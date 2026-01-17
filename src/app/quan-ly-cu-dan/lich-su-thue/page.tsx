"use client";

import React, { useEffect, useState } from "react";
import { apiUrl } from '@/utils/apiUrl';
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from "@/components/AdminTable";
import Link from "next/link";
import { contractService } from "@/services/contractService";

type Contract = {
  id: number | string;
  roomTitle: string;
  roomSlug?: string;
  type: "rental" | "deposit" | string;
  amount?: number;
  status?: string;
  date?: string;
};

const mockContracts: Contract[] = [];

export default function LichSuThuePage() {
  const [items, setItems] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await contractService.myHistory();
        if (!mounted) return;

        const contracts = res.contracts || [];
        const deposits = res.deposits || [];

        const mappedContracts = contracts.map((d: any) => ({
          id: d.id,
          roomTitle: d.apartment?.name ?? "Căn hộ",
          roomSlug: d.apartment?.slug ?? "",
          type: "Hợp đồng thuê",
          amount: d.price ?? 0,
          status: d.status,
          date: d.created_at,
        }));

        const mappedDeposits = deposits.map((d: any) => ({
          id: d.id,
          roomTitle: d.apartment?.name ?? "Căn hộ",
          roomSlug: d.apartment?.slug ?? "",
          type: "Đặt cọc",
          amount: d.amount ?? 0,
          status: "Đã cọc",
          date: d.created_at,
        }));

        setItems([...mappedContracts, ...mappedDeposits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (err) {
        console.error(err);
        setItems(mockContracts);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-6">
      <Panel title="Lịch sử thuê phòng">
        <p className="text-sm text-slate-600">Danh sách các hợp đồng thuê và hợp đồng đặt cọc của bạn.</p>

        <AdminTable headers={["ID", "Phòng", "Loại", "Số tiền", "Trạng thái", "Ngày", "Hành động"]} loading={loading}>
          {items.map((it) => (
            <tr key={it.id} className="">
              <td className="px-4 py-3 text-center">{it.id}</td>
              <td className="px-4 py-3 text-left">
                <Link href={`/room/${it.roomSlug}`} className="font-medium hover:underline">{it.roomTitle}</Link>
              </td>
              <td className="px-4 py-3">{it.type}</td>
              <td className="px-4 py-3">{it.amount ? it.amount.toLocaleString() : ""}</td>
              <td className="px-4 py-3">{it.status}</td>
              <td className="px-4 py-3">{new Date(it.date || '').toLocaleString()}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <Link href={`/quan-ly-cu-dan/lich-su-thue/${it.id}`} className="text-emerald-700 underline text-sm">Xem</Link>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </Panel>
    </div>
  );
}
