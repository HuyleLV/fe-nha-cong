"use client";
import { useEffect, useMemo, useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Spinner from "@/components/spinner";
import Pagination from "@/components/Pagination";
import { formatDateTime } from "@/utils/format-time";
import { locationService } from "@/services/locationService";
import { Location, LocationLevel } from "@/type/location";
import AdminTable from "@/components/AdminTable";

function LevelTag({ level }: { level: LocationLevel }) {
  const map: Record<LocationLevel, string> = {
    Province: "bg-teal-50 text-teal-700 border-teal-200",
    City: "bg-sky-50 text-sky-700 border-sky-200",
    District: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  const viLabel: Record<LocationLevel, string> = {
    Province: "Tỉnh",
    City: "Thành phố",
    District: "Quận",
  };
  return (
    <span className={`inline-block border px-2 py-0.5 rounded-full text-xs ${map[level]}`}>{viLabel[level] || level}</span>
  );
}

export default function DistrictLocationPage() {
  const router = useRouter();
  const level: LocationLevel = "District";

  const [items, setItems] = useState<Location[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);

  const fetchlocation = async () => {
    setLoading(true);
    try {
      const { items, meta } = await locationService.getAll({ page, limit, level });
      setItems(items || []);
      setTotal(meta.total);
    } catch (error) {
      console.error("Failed to fetch location", error);
      toast.error("Không tải được danh sách Quận");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchlocation();
  }, [page]);

  const handlePrev = () => { if (page > 1) setPage(page - 1); };
  const handleNext = () => { if (page < totalPages) setPage(page + 1); };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]"><Spinner /></div>
    );

  return (
    <div className="mx-auto max-w-screen-2xl p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-emerald-900">ĐỊA ĐIỂM · QUẬN</h1>
        <button
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 cursor-pointer inline-flex items-center gap-1"
          onClick={() => router.push("/admin/location/create?level=District")}
        >
          <Plus size={16} /> Tạo Quận
        </button>
      </div>
      <AdminTable
        headers={["ID","Tên","Slug","Cấp","Thuộc (parent)","Ngày tạo","Ngày cập nhật","Thao tác"]}
        loading={loading}
        emptyText="Chưa có Quận."
      >
        {items.map((loc) => (
          <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-2 font-medium text-gray-900">{loc.id}</td>
            <td className="px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="line-clamp-1">{loc.name}</span>
              </div>
            </td>
            <td className="px-4 py-2 text-gray-700">{loc.slug}</td>
            <td className="px-4 py-2"><LevelTag level={loc.level} /></td>
            <td className="px-4 py-2 text-gray-700">{loc.parent?.name ?? <span className="text-gray-400">—</span>}</td>
            <td className="px-4 py-2 text-gray-500">{formatDateTime(loc.createdAt)}</td>
            <td className="px-4 py-2 text-gray-500">{formatDateTime(loc.updatedAt)}</td>
            <td className="px-4 py-2">
              <div className="flex justify-center gap-2">
                <button
                  className="inline-flex items-center gap-1.5 h-8 px-3 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition cursor-pointer"
                  onClick={() => router.push(`/admin/location/${loc.id}`)}
                >
                  <Edit size={14} /> Sửa
                </button>
                <button
                  className="inline-flex items-center gap-1.5 h-8 px-3 text-sm bg-rose-600 text-white rounded-md hover:bg-rose-700 transition cursor-pointer"
                  onClick={async () => {
                    const ok = confirm(`Xoá Quận \"${loc.name}\"?`);
                    if (!ok) return;
                    try {
                      await locationService.delete(loc.id);
                      toast.success("Đã xoá!");
                      fetchlocation();
                    } catch (err) {
                      console.error(err);
                      toast.error("Xoá thất bại, vui lòng thử lại!");
                    }
                  }}
                >
                  <Trash2 size={15} /> Xoá
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={(n) => setPage(n)} onPrev={handlePrev} onNext={handleNext} />
      </div>
    </div>
  );
}
