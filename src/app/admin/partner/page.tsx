"use client";
import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { partnerService } from "@/services/partnerService";
import { formatDateTime } from "@/utils/format-time";
import Spinner from "@/components/spinner";
import { useRouter } from "next/navigation";
import AdminTable from "@/components/AdminTable";
import { toast } from "react-toastify";
import type { PartnerLead, PartnerRole } from "@/type/partners";
import Pagination from "@/components/Pagination";

export default function PartnerAdminPage() {
  const [partners, setPartners] = useState<PartnerLead[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [role, setRole] = useState<PartnerRole | "">("");
  const [q, setQ] = useState<string>("");
  const router = useRouter();
  const limit = 10;

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { items, meta } = await partnerService.getAll({
        page,
        limit,
        role: role || undefined,
        q: q || undefined,
      });
      setPartners(items || []);
      setTotal(meta.total);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được danh sách đối tác");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, role]);

  const roleText = (r: PartnerRole) => {
    switch (r) {
      case "landlord":
        return "Chủ nhà";
      case "customer":
        return "Khách hàng";
      case "operator":
        return "Đơn vị vận hành";
      default:
        return r;
    }
  };

  const roleClass = (r: PartnerRole) => {
    switch (r) {
      case "landlord":
        return "bg-purple-100 text-purple-700";
      case "customer":
        return "bg-blue-100 text-blue-700";
      case "operator":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => page < totalPages && setPage(page + 1);

  return (
  <div className="mx-auto max-w-screen-2xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">ĐỐI TÁC - LEADS</h1>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
        <div className="flex items-center gap-2">
          <select
            value={role}
            onChange={(e) => {
              setPage(1);
              setRole(e.target.value as PartnerRole | "");
            }}
            className="rounded-lg border px-3 py-2 bg-white shadow-sm text-sm"
          >
            <option value="">Tất cả vai trò</option>
            <option value="landlord">Chủ nhà</option>
            <option value="customer">Khách hàng</option>
            <option value="operator">Đơn vị vận hành</option>
          </select>
        </div>

        <div className="flex-1" />

        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                fetchPartners();
              }
            }}
            className="w-64 rounded-lg border px-3 py-2 bg-white shadow-sm text-sm"
            placeholder="Tìm theo tên / email / SĐT"
          />
          <button
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 cursor-pointer text-sm"
            onClick={() => {
              setPage(1);
              fetchPartners();
            }}
          >
            Tìm
          </button>
        </div>
      </div>

      <AdminTable
        headers={["ID","Họ tên","Vai trò","SĐT","Email","Nhu cầu","Ngày tạo","Thao tác"]}
        loading={loading}
        emptyText="Chưa có dữ liệu."
      >
        {partners.map((p) => (
          <tr key={p.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-2 font-medium text-gray-900">{p.id}</td>
            <td className="px-4 py-2">
              <span className="line-clamp-1">{p.fullName}</span>
            </td>
            <td className="px-4 py-2">
              <span className={`px-2 py-1 rounded-md text-xs font-semibold ${roleClass(p.role)}`}>{roleText(p.role)}</span>
            </td>
            <td className="px-4 py-2 text-gray-700">{p.phone || "—"}</td>
            <td className="px-4 py-2 text-gray-700">{p.email || "—"}</td>
            <td className="px-4 py-2 text-gray-700 max-w-[240px]">
              {p.need ? <span className="line-clamp-2">{p.need}</span> : <span className="text-gray-400">—</span>}
            </td>
            <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{formatDateTime(p.createdAt)}</td>
            <td className="px-4 py-2">
              <div className="flex justify-center gap-2">
                <button
                  className="flex items-center gap-1 px-3 py-1 text-[13px] bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition cursor-pointer"
                  onClick={() => router.push(`/admin/partners/${p.id}`)}
                >
                  <Edit size={14} /> Xem/Sửa
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 text-[13px] bg-red-600 text-white rounded-md hover:bg-red-700 transition cursor-pointer"
                  onClick={async () => {
                    const ok = confirm("Xoá lead này?");
                    if (!ok) return;
                    try {
                      await partnerService.delete(p.id);
                      toast.success("Đã xoá lead!");
                      fetchPartners();
                    } catch (err) {
                      console.error(err);
                      toast.error("Xoá thất bại, vui lòng thử lại!");
                    }
                  }}
                >
                  <Trash2 size={14} /> Xoá
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
