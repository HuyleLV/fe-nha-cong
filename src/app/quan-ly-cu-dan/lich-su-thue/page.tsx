"use client";

import React, { useEffect, useState } from "react";
import { apiUrl } from '@/utils/apiUrl';
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from "@/components/AdminTable";
import Link from "next/link";

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
        const res = await fetch(apiUrl('/api/cu-dan/lich-su-thue'), { credentials: "include" });
        if (!mounted) return;
        if (!res.ok) {
          setItems(mockContracts);
        } else {
          const data = await res.json();
          const mapped: Contract[] = (data || []).map((d: any, i: number) => ({
            id: d.id ?? i,
            roomTitle: d.room?.title ?? d.title ?? d.roomTitle ?? "Căn hộ",
            roomSlug: d.room?.slug ?? d.slug ?? d.roomSlug ?? "",
            type: d.type ?? d.contract_type ?? (d.deposit ? "deposit" : "rental"),
            amount: d.amount ?? d.value ?? d.price ?? 0,
            status: d.status ?? d.state ?? "",
            date: d.date ?? d.createdAt ?? d.created_at ?? new Date().toISOString(),
          }));
          setItems(mapped);
        }
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
