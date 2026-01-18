"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "@/components/AdminTable";
import { toast } from "react-toastify";
import { Tabs, Tag } from "antd";
import Pagination from "@/components/Pagination";

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
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const load = async (paramStatus: string, paramPage = 1) => {
    setLoading(true);
    try {
      const axiosClient = (await import("@/utils/axiosClient")).default;
      const { apiUrl } = await import("@/utils/apiUrl");

      const queryParams = new URLSearchParams();
      if (paramStatus === 'pending') queryParams.set('status', 'pending');

      queryParams.set('page', String(paramPage));
      queryParams.set('limit', String(limit));

      const payload: any = await axiosClient.get(apiUrl(`/api/admin/ctv-requests?${queryParams.toString()}`));
      const rawData = (payload && payload.data) ? payload.data : payload; // { data: items, meta: ... } from backend now

      let data: any[] = [];
      let meta: any = {};

      if (rawData?.data && Array.isArray(rawData.data)) {
        data = rawData.data;
        meta = rawData.meta;
      } else if (rawData?.items) {
        data = rawData.items;
        meta = rawData.meta;
      } else if (Array.isArray(rawData)) {
        data = rawData;
        meta = { total: rawData.length };
      }

      setTotal(meta?.total ?? data.length);

      const mapped = data.map((d: any, i: number) => ({
        id: d.id ?? i,
        userId: d.user?.id ?? d.userId ?? d.user_id,
        name: d.user?.name ?? d.name ?? d.user?.fullName,
        email: d.user?.email ?? d.email,
        createdAt: d.createdAt ?? d.created_at ?? d.created,
        status: d.status ?? d.state ?? 'pending',
      }));

      // Filter locally for 'history' (not pending) if backend returns mixed status in 'all' mode
      // But since I paginate, this might be tricky if I don't send status param.
      // If I don't send status param, backend returns ALL.
      // If activeTab === 'history', I want !pending.
      // Backend doesn't support !pending. 
      // For now, let's just show ALL in history.

      setItems(mapped);
    } catch (e: any) {
      console.error(e);
      toast.error('Lỗi tải dữ liệu');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    load(activeTab, 1);
  }, [activeTab]);

  const handlePageChange = (p: number) => {
    setPage(p);
    load(activeTab, p);
  }

  const handleAction = async (id: any, action: "approve" | "reject") => {
    try {
      const axiosClient = (await import("@/utils/axiosClient")).default;
      const { apiUrl } = await import("@/utils/apiUrl");
      await axiosClient.post(apiUrl(`/api/admin/ctv-requests/${id}/${action}`));
      toast.success(action === "approve" ? "Đã duyệt CTV" : "Đã từ chối yêu cầu");
      load(activeTab, page);
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi, thử lại");
    }
  };

  const tabs = [
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'history', label: 'Tất cả / Lịch sử' },
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
          <tr key={it.id} className="border-t">
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

      <div className="mt-4 flex justify-center">
        <Pagination page={page} limit={limit} total={total} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}
