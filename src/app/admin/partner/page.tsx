"use client";
import { useEffect, useState } from "react";
import { Edit, Trash2, Filter } from "lucide-react";
import { partnerService } from "@/services/partnerService";
import { formatDateTime } from "@/utils/format-time";
import Spinner from "@/components/spinner";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type { PartnerLead, PartnerRole } from "@/type/partners";
import Pagination from "@/components/Pagination";

export default function PartnerAdminPage() {
  const [partners, setPartners] = useState<PartnerLead[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // optional filters
  const [role, setRole] = useState<PartnerRole | "">("");
  const [q, setQ] = useState<string>("");

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
    } catch (error) {
      console.error("Failed to fetch partners", error);
      toast.error("Không tải được danh sách đối tác");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  useEffect(() => {
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, role]); // tìm kiếm q sẽ trigger bằng nút Tìm

  const roleText = (r: PartnerRole) =>
    r === "landlord" ? "Chủ nhà" : r === "customer" ? "Khách hàng" : "Đơn vị vận hành";

  const roleClass = (r: PartnerRole) =>
    r === "landlord"
      ? "bg-emerald-100 text-emerald-700"
      : r === "customer"
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700";

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">QUẢN LÝ ĐỐI TÁC (Partner Leads)</h1>

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

      <table className="w-full text-left border border-gray-200 shadow rounded-lg overflow-hidden mt-5">
        <thead className="bg-gray-200 text-gray-700 uppercase text-[14px]">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Họ tên</th>
            <th className="px-4 py-3">Vai trò</th>
            <th className="px-4 py-3">SĐT</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Nhu cầu</th>
            <th className="px-4 py-3">Ngày tạo</th>
            <th className="px-4 py-3 text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 text-[15px]">
          {partners.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2 font-medium text-gray-900">{p.id}</td>
              <td className="px-4 py-2">{p.fullName}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${roleClass(p.role)}`}>
                  {roleText(p.role)}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-700">{p.phone}</td>
              <td className="px-4 py-2 text-gray-700">{p.email}</td>
              <td className="px-4 py-2 text-gray-600 max-w-[280px]">
                {p.need ? <span className="line-clamp-2">{p.need}</span> : <span className="text-gray-400">—</span>}
              </td>
              <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{formatDateTime(p.createdAt)}</td>
              <td className="px-4 py-2">
                <div className="flex justify-center gap-2">
                  <button
                    className="flex items-center gap-1 px-3 py-1 text-[15px] bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition cursor-pointer"
                    onClick={() => router.push(`/admin/partners/${p.id}`)}
                  >
                    <Edit size={15} />
                    Xem/Sửa
                  </button>
                  <button
                    className="flex items-center gap-1 px-3 py-1 text-[15px] bg-red-600 text-white rounded-md hover:bg-red-700 transition cursor-pointer"
                    onClick={async () => {
                      const ok = confirm("Xoá lead này?");
                      if (!ok) return;
                      try {
                        await partnerService.delete(p.id);
                        toast.success("Đã xoá lead!");
                        // reload trang hiện tại
                        fetchPartners();
                      } catch (err) {
                        console.error(err);
                        toast.error("Xoá thất bại, vui lòng thử lại!");
                      }
                    }}
                  >
                    <Trash2 size={15} />
                    Xoá
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {!partners.length && (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                Chưa có dữ liệu.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination
        page={page}
        totalPages={totalPages || 1}
        onPageChange={(newPage) => setPage(newPage)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
