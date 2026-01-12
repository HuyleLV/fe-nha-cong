"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "@/components/AdminTable";
import { toast } from "react-toastify";

type CtvRequest = {
  id: number | string;
  userId?: number | string;
  name?: string;
  email?: string;
  createdAt?: string;
  status?: string;
};

export default function AdminCtvRequestsPage() {
  const [items, setItems] = useState<CtvRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      // call backend API (configured by NEXT_PUBLIC_API_URL) instead of Next.js local API route
      const { apiUrl } = await import("@/utils/apiUrl");
      const res = await fetch(apiUrl("/api/admin/ctv-requests"), { credentials: "include" });
      if (!res.ok) {
        const txt = await res.text();
        toast.error("Không thể tải danh sách: " + txt);
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems((data || []).map((d: any, i: number) => ({
        id: d.id ?? i,
        userId: d.userId ?? d.user_id,
        name: d.name ?? d.user?.name ?? d.user?.fullName,
        email: d.email ?? d.user?.email,
        createdAt: d.createdAt ?? d.created_at ?? d.created,
        status: d.status ?? d.state ?? 'pending',
      })));
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi tải dữ liệu");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: any, action: "approve" | "reject") => {
    try {
      const { apiUrl } = await import("@/utils/apiUrl");
      const res = await fetch(apiUrl(`/api/admin/ctv-requests/${id}/${action}`), { method: "POST", credentials: "include" });
      if (!res.ok) {
        const txt = await res.text();
        toast.error("Thao tác thất bại: " + txt);
        return;
      }
      toast.success(action === "approve" ? "Đã duyệt CTV" : "Đã từ chối yêu cầu");
      load();
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi, thử lại");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Duyệt đăng ký CTV</h2>
      <AdminTable headers={["ID", "Tên", "Email", "Ngày gửi", "Trạng thái", "Hành động"]} loading={loading}>
        {items.map((it) => (
          <tr key={it.id}>
            <td className="px-4 py-3 text-center">{it.id}</td>
            <td className="px-4 py-3 text-left">{it.name}</td>
            <td className="px-4 py-3">{it.email}</td>
            <td className="px-4 py-3">{it.createdAt ? new Date(it.createdAt).toLocaleString() : ""}</td>
            <td className="px-4 py-3">{it.status}</td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => handleAction(it.id, "approve")} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm">Duyệt</button>
                <button onClick={() => handleAction(it.id, "reject")} className="px-3 py-1 rounded bg-rose-600 text-white text-sm">Từ chối</button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
