"use client";
import { useEffect, useMemo, useState } from "react";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Spinner from "@/components/spinner";
import Pagination from "@/components/Pagination";
import { formatDateTime } from "@/utils/format-time";
import { locationService } from "@/services/locationService";
import { Location, LocationLevel } from "@/type/location";

/** Badge nho nhỏ cho level, tránh phải import thêm component */
function LevelTag({ level }: { level: LocationLevel }) {
  const map: Record<LocationLevel, string> = {
    Province: "bg-teal-50 text-teal-700 border-teal-200",
    City: "bg-sky-50 text-sky-700 border-sky-200",
    District: "bg-indigo-50 text-indigo-700 border-indigo-200"
  };
  return (
    <span className={`inline-block border px-2 py-0.5 rounded-full text-xs ${map[level]}`}>
      {level}
    </span>
  );
}

export default function LocationPage() {
  const router = useRouter();

  const [items, setItems] = useState<Location[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);

  const fetchlocation = async () => {
    setLoading(true);
    try {
      const { items, meta } = await locationService.getAll({
        page,
        limit
      });
      setItems(items || []);
      setTotal(meta.total);
    } catch (error) {
      console.error("Failed to fetch location", error);
      toast.error("Không tải được danh sách khu vực");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchlocation();
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchlocation();
    }, 350);
    return () => clearTimeout(t);
  }, []);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-emerald-900">QUẢN LÝ KHU VỰC (location)</h1>
        <button
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 cursor-pointer inline-flex items-center gap-1"
          onClick={() => router.push("/admin/location/create")}
        >
          <Plus size={16} /> Tạo khu vực
        </button>
      </div>

      <table className="w-full text-left border border-gray-200 shadow rounded-lg overflow-hidden mt-5">
        <thead className="bg-gray-200 text-gray-700 uppercase text-[14px]">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Tên</th>
            <th className="px-4 py-3">Slug</th>
            <th className="px-4 py-3">Cấp</th>
            <th className="px-4 py-3">Thuộc (parent)</th>
            <th className="px-4 py-3">Ngày tạo</th>
            <th className="px-4 py-3">Ngày cập nhật</th>
            <th className="px-4 py-3 text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 text-[15px]">
          {items.map((loc) => (
            <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2 font-medium text-gray-900">{loc.id}</td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  {/* Cover thumb nếu có */}
                  {/* {loc.coverImageUrl && (
                    <img src={loc.coverImageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                  )} */}
                  <span className="line-clamp-1">{loc.name}</span>
                </div>
              </td>
              <td className="px-4 py-2 text-gray-700">{loc.slug}</td>
              <td className="px-4 py-2">
                <LevelTag level={loc.level} />
              </td>
              <td className="px-4 py-2 text-gray-700">
                {loc.parent?.name ?? <span className="text-gray-400">—</span>}
              </td>
              <td className="px-4 py-2 text-gray-500">{formatDateTime(loc.createdAt)}</td>
              <td className="px-4 py-2 text-gray-500">{formatDateTime(loc.updatedAt)}</td>
              <td className="px-4 py-2">
                <div className="flex justify-center gap-2">
                  <button
                    className="flex items-center gap-1 px-4 py-1 text-[15px] bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition cursor-pointer"
                    onClick={() => router.push(`/admin/location/${loc.id}`)}
                  >
                    <Edit size={15} />
                    Sửa
                  </button>
                  <button
                    className="flex items-center gap-1 px-4 py-1 text-[15px] bg-red-600 text-white rounded-md hover:bg-red-700 transition cursor-pointer"
                    onClick={async () => {
                      const ok = confirm(`Xoá khu vực "${loc.name}"?`);
                      if (!ok) return;
                      try {
                        await locationService.delete(loc.id);
                        toast.success("Đã xoá khu vực!");
                        // Reload trang hiện tại
                        fetchlocation();
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

          {!items.length && (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                Chưa có khu vực nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}