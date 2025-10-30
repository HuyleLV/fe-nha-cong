"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { userService } from "@/services/userService";
import type { User } from "@/type/user";
import { toast } from "react-toastify";
import Link from "next/link";
import { Trash2, Edit, Plus, RotateCcw } from "lucide-react";
import AdminTable from "@/components/AdminTable";
import Pagination from "@/components/Pagination";
import { formatDateTime } from "@/utils/format-time";

export default function AdminUsersPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<User[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, limit: 10, total: 0, pageCount: 0 });

  const page = Number(search?.get("page") || 1);
  const limit = Number(search?.get("limit") || 10);

  const totalPages = useMemo(() => {
    const pc = Number(meta?.pageCount || 0);
    if (pc && Number.isFinite(pc)) return pc;
    const total = Number(meta?.total || 0);
    return Math.max(1, Math.ceil(total / (limit || 10)));
  }, [meta, limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await userService.listAdminUsers({ page, limit });
      setItems(res.data || []);
      setMeta(res.meta || {});
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Không tải được danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, limit]);

  const onDelete = async (id: number) => {
    if (!confirm("Xoá người dùng này?")) return;
    try {
      await userService.deleteAdminUser(id);
      toast.success("Đã xoá thành công");
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Không xoá được người dùng");
    }
  };

  const goto = (p: number) => {
    const sp = new URLSearchParams(search?.toString() || "");
    sp.set("page", String(p));
    sp.set("limit", String(limit));
    router.push(`/admin/users?${sp.toString()}`);
  };

  const handlePrev = () => page > 1 && goto(page - 1);
  const handleNext = () => page < totalPages && goto(page + 1);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-emerald-900">QUẢN LÝ NGƯỜI DÙNG</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded border text-sm text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="size-4" /> Tải lại
          </button>
          <Link
            href="/admin/users/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
          >
            <Plus className="size-4" /> Thêm người dùng
          </Link>
        </div>
      </div>

      {/* Table */}
      <AdminTable
        headers={["ID", "Tên", "Email", "SĐT", "Role", "Xác minh email", "Xác minh SĐT", "Cập nhật", "Thao tác"]}
        loading={loading}
        emptyText="Không có người dùng"
      >
        {items.map((u) => (
          <tr key={u.id} className="hover:bg-slate-50 transition-colors text-[14px]">
            <td className="px-4 py-3">{u.id}</td>
            <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
            <td className="px-4 py-3 text-slate-600">{u.email || "—"}</td>
            <td className="px-4 py-3">{u.phone || "—"}</td>
            <td className="px-4 py-3">
              <span
                className={`px-2 py-0.5 rounded text-sm capitalize ${
                  u.role === "admin"
                    ? "bg-red-100 text-red-700"
                    : u.role === "owner"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {u.role}
              </span>
            </td>
            <td className="px-4 py-3">
              {u.emailVerified ? (
                <span className="px-2 py-0.5 rounded text-sm bg-sky-100 text-sky-700">Đã xác minh</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-sm bg-slate-200 text-slate-700">Chưa</span>
              )}
            </td>
            <td className="px-4 py-3">
              {u.phoneVerified ? (
                <span className="px-2 py-0.5 rounded text-sm bg-green-100 text-green-700">Đã xác minh</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-sm bg-slate-200 text-slate-700">Chưa</span>
              )}
            </td>
            <td className="px-4 py-3 text-slate-500">{formatDateTime(u.updatedAt as any)}</td>
            <td className="px-4 py-3">
              <div className="flex justify-center gap-2">
                <Link
                  href={`/admin/users/${u.id}`}
                  className="flex items-center gap-1 px-4 py-1 text-[15px] bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition cursor-pointer"
                >
                  <Edit size={15} />
                  Sửa
                </Link>
                <button
                  onClick={() => onDelete(u.id)}
                  className="flex items-center gap-1 px-4 py-1 text-[15px] bg-red-600 text-white rounded-md hover:bg-red-700 transition cursor-pointer"
                >
                  <Trash2 size={15} />
                  Xoá
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => goto(p)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
