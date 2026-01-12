"use client";

import React, { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from "@/components/AdminTable";
import Link from "next/link";
import { viewingService } from "@/services/viewingService";

type Viewing = { id: number | string; roomTitle?: string; roomSlug?: string; scheduledAt?: string; hostName?: string; status?: string };

export default function PhongDaXemPage() {
  const [items, setItems] = useState<Viewing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const payload = await viewingService.mine({ page: 1, limit: 100 });
        if (!mounted) return;
        const data = (payload && (payload as any).items) ? (payload as any).items : (payload as any) || [];
        const mapped: Viewing[] = (data || []).map((d: any) => ({
          id: d.id,
          roomTitle: d.apartment?.title ?? d.roomTitle ?? d.title ?? d.apartment?.name ?? d.apartment?.address ?? "Phòng",
          roomSlug: d.apartment?.slug ?? d.roomSlug ?? d.slug ?? "",
          scheduledAt: d.preferredAt ?? d.scheduledAt ?? d.scheduled_at ?? d.time ?? d.createdAt,
          hostName: d.name ?? d.hostName ?? d.userName ?? "",
          status: d.status,
        }));
        setItems(mapped);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-6">
      <Panel title="Lịch sử xem phòng">
        <p className="text-sm text-slate-600">Danh sách các phòng bạn đã đặt lịch xem.</p>

        <AdminTable headers={["ID", "Phòng", "Thời gian", "Người liên hệ", "Trạng thái", "Hành động"]} loading={loading}>
          {items.map((it) => (
            <tr key={it.id}>
              <td className="px-4 py-3 text-center">{it.id}</td>
              <td className="px-4 py-3 text-left">
                <Link href={`/room/${it.roomSlug}`} className="font-medium hover:underline">{it.roomTitle}</Link>
              </td>
              <td className="px-4 py-3 text-center">{it.scheduledAt ? new Date(it.scheduledAt).toLocaleString() : ""}</td>
              <td className="px-4 py-3 text-center">{it.hostName}</td>
              <td className="px-4 py-3 text-center">{it.status}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <Link href={`/room/${it.roomSlug}`} className="text-emerald-700 underline text-sm">Xem phòng</Link>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </Panel>
    </div>
  );
}
