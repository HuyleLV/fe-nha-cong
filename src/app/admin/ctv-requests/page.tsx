"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "@/components/AdminTable";
import { toast } from "react-toastify";
import { Tabs, Tag } from "antd";

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
  const [activeTab, setActiveTab] = useState('pending');

  const load = async (status: string) => {
    setLoading(true);
    try {
      const axiosClient = (await import("@/utils/axiosClient")).default;
      const { apiUrl } = await import("@/utils/apiUrl");
      // If status is 'all', we might want to fetch everything or handle differently. 
      // Based on backend change, passing status filters results. passing nothing gets all?
      // Let's assume 'history' means processed (approved/rejected). 
      // But for simplicity, let's pass 'pending' when tab is pending, and nothing (or explicit 'approved,rejected' if backend supported array) when tab is history.
      // Current backend implementation: findAll(status?: string). 
      // So if pending -> ?status=pending. 
      // If history -> we want !pending. The backend findAll only supports single status equality.
      // Let's update backend to support 'history' logic or just client side filter? 
      // Better: Update backend service to handle 'history' or just fetch all and client filter if volume is low?
      // Given the previous step, I only added simple equality check. 
      // Let's rely on fetching specific status for 'pending' tab. For 'history', we might need to fetch all and filter client side OR user explicitly asked "Duyệt rồi thì sẽ vào phần khác".

      // Let's stick to: Tab 1 param: status=pending. Tab 2 param: (empty) -> gets all, then we filter client side for !pending.

      const query = status === 'pending' ? '?status=pending' : '';
      const payload: any = await axiosClient.get(apiUrl(`/api/admin/ctv-requests${query}`));
      const rawData = (payload && payload.data) ? payload.data : payload;
      const data = Array.isArray(rawData) ? rawData : (rawData?.data && Array.isArray(rawData.data) ? rawData.data : []);

      let mapped = data.map((d: any, i: number) => ({
        id: d.id ?? i,
        userId: d.userId ?? d.user_id,
        name: d.name ?? d.user?.name ?? d.user?.fullName,
        email: d.email ?? d.user?.email,
        createdAt: d.createdAt ?? d.created_at ?? d.created,
        status: d.status ?? d.state ?? 'pending',
      }));

      if (status !== 'pending') {
        mapped = mapped.filter((i: any) => i.status !== 'pending');
      }

      setItems(mapped);
    } catch (e: any) {
      console.error(e);
      const msg = e?.response?.data?.message || e?.message || 'Lỗi khi tải dữ liệu';
      toast.error(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(activeTab); }, [activeTab]);

  const handleAction = async (id: any, action: "approve" | "reject") => {
    try {
      const axiosClient = (await import("@/utils/axiosClient")).default;
      const { apiUrl } = await import("@/utils/apiUrl");
      await axiosClient.post(apiUrl(`/api/admin/ctv-requests/${id}/${action}`));
      toast.success(action === "approve" ? "Đã duyệt CTV" : "Đã từ chối yêu cầu");
      load(activeTab);
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi, thử lại");
    }
  };

  const tabs = [
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'history', label: 'Lịch sử' },
  ];

  const renderStatus = (status: string) => {
    switch (status) {
      case 'pending': return <Tag color="orange">Chờ duyệt</Tag>;
      case 'approved': return <Tag color="green">Đã duyệt</Tag>;
      case 'rejected': return <Tag color="red">Từ chối</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Duyệt đăng ký CTV</h2>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabs}
        className="mb-4"
      />

      <AdminTable headers={["ID", "Tên", "Email", "Ngày gửi", "Trạng thái", "Hành động"]} loading={loading}>
        {items.map((it) => (
          <tr key={it.id}>
            <td className="px-4 py-3 text-center">{it.id}</td>
            <td className="px-4 py-3 text-left">{it.name}</td>
            <td className="px-4 py-3">{it.email}</td>
            <td className="px-4 py-3">{it.createdAt ? new Date(it.createdAt).toLocaleString() : ""}</td>
            <td className="px-4 py-3">{renderStatus(it.status || 'pending')}</td>
            <td className="px-4 py-3">
              {it.status === 'pending' && (
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => handleAction(it.id, "approve")} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700">Duyệt</button>
                  <button onClick={() => handleAction(it.id, "reject")} className="px-3 py-1 rounded bg-rose-600 text-white text-sm hover:bg-rose-700">Từ chối</button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
