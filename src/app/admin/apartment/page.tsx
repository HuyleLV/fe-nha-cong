// app/admin/apartments/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Edit, Trash2, Plus, Search, MapPin, Filter } from "lucide-react";

import Spinner from "@/components/spinner";
import Pagination from "@/components/Pagination";
import { formatDateTime } from "@/utils/format-time";

import { apartmentService } from "@/services/apartmentService";
import LocationLookup from "../components/locationLookup";
import { Apartment, ApartmentStatus } from "@/type/apartment";
import { Location } from "@/type/location";

const LIMIT = 10;

export default function AdminApartmentsPage() {
  const router = useRouter();

  // data
  const [items, setItems] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // paging
  const [page, setPage] = useState(1);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / LIMIT)), [total]);

  // filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApartmentStatus | "">("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>(""); // keep as string, send number if valid

  const fetchData = async () => {
    setLoading(true);
    try {
      const { items, meta } = await apartmentService.getAll({
        page,
        limit: LIMIT,
        search: search || undefined,
        locationId: selectedLocation?.id,
        minPrice: minPrice ? String(minPrice) : undefined,
        maxPrice: maxPrice ? String(maxPrice) : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
      });
      setItems(items || []);
      setTotal(meta.total);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Không tải được danh sách căn hộ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, status, selectedLocation, bedrooms]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(t);
  }, [search, minPrice, maxPrice]);

  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => page < totalPages && setPage(page + 1);

  if (loading)
    return (
      <div className="min-h-[400px] grid place-items-center">
        <Spinner />
      </div>
    );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-emerald-900">QUẢN LÝ CĂN HỘ</h1>
        <button
          onClick={() => router.push("/admin/apartment/create")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Plus className="size-4" /> Thêm căn hộ
        </button>
      </div>

      {/* Table */}
      <table className="w-full text-left border border-gray-200 shadow rounded-lg overflow-hidden mt-5">
        <thead className="bg-gray-200 text-gray-700 uppercase text-[14px]">
            <tr className="text-left text-slate-600 border-b">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Giá thuê</th>
              <th className="px-4 py-3">Phòng</th>
              <th className="px-4 py-3">Khu vực</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Cập nhật</th>
            <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-[15px]">
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-500">
                  Chưa có dữ liệu
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">{it.id}</td>
                  <td className="px-4 py-3 font-medium">{it.title}</td>
                  <td className="px-4 py-3 text-slate-600">{it.slug}</td>
                  <td className="px-4 py-3">
                    {Number(it.rentPrice).toLocaleString("vi-VN")} {it.currency}
                  </td>
                  <td className="px-4 py-3">
                    {it.bedrooms} ngủ · {it.bathrooms} tắm
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-4 text-emerald-600" />
                      {it.addressPath}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize">{it.status}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDateTime(it.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/apartment/${it.id}`)}
                        className="flex items-center gap-1 px-4 py-1 text-[15px] bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition cursor-pointer"
                      >
                        <Edit size={15} />
                        Sửa
                      </button>
                      <button
                        onClick={async () => {
                          const ok = confirm(`Xoá "${it.title}"?`);
                          if (!ok) return;
                          try {
                            await apartmentService.delete(it.id);
                            toast.success("Đã xoá");
                            setItems((prev) => prev.filter((x) => x.id !== it.id));
                            setTotal((t) => Math.max(0, t - 1));
                          } catch (e: any) {
                            toast.error(
                              e?.response?.data?.message || "Không xoá được"
                            );
                          }
                        }}
                        className="flex items-center gap-1 px-4 py-1 text-[15px] bg-red-600 text-white rounded-md hover:bg-red-700 transition cursor-pointer"
                      >
                        <Trash2 size={15} />
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      {/* Pagination */}
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
