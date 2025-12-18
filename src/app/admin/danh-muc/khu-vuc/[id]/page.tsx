"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Spinner from "@/components/spinner";
import { Save, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { locationService } from "@/services/locationService";

export default function Page() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const id = params?.id ?? "";
  const isCreate = id === "create";

  const [name, setName] = useState("");
  const [districtId, setDistrictId] = useState<string>("");
  const [districts, setDistricts] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { items } = await locationService.getAll({ page: 1, limit: 200, level: "District" as any });
        if (!mounted) return;
        const mapped = Array.isArray(items) ? items.map((d: any) => ({ id: String(d.id), name: d.name ?? String(d.id) })) : [];
        setDistricts(mapped);
      } catch (err) {
        console.warn("Failed to load districts", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!id || isCreate) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await locationService.getById(Number(id));
        if (!mounted) return;
        setName(data.name ?? "");
        setDistrictId(String(data.parent?.id ?? ""));
      } catch (err: any) {
        toast.error(err?.message ?? "Không thể tải khu vực");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // focus input when creating
  useEffect(() => {
    if (isCreate) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCreate]);

  const save = async () => {
    setError(null);
    if (!name.trim()) return setError("Vui lòng nhập tên khu vực");
    if (!districtId) return setError("Vui lòng chọn quận");
    setActionLoading(true);
    try {
      const payload: any = { name: name.trim(), parentId: Number(districtId), level: "Street" };
      if (isCreate) {
        const res: any = await locationService.create(payload);
        // backend might return an object with { message: '...' } on validation failure
        if (res && typeof res === 'object' && res.message) {
          setError(String(res.message));
          toast.error(String(res.message));
          return;
        }
        toast.success("Thêm khu vực thành công");
      } else {
        const res: any = await locationService.update(Number(id), payload);
        if (res && typeof res === 'object' && res.message) {
          setError(String(res.message));
          toast.error(String(res.message));
          return;
        }
        toast.success("Cập nhật khu vực thành công");
      }
      router.push("/admin/danh-muc/khu-vuc");
    } catch (err: any) {
      const msg = err?.message ?? "Lỗi khi lưu";
      setError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const remove = async () => {
    if (isCreate) return;
    if (!id) return;
    if (!confirm("Bạn có chắc muốn xóa khu vực này?")) return;
    setActionLoading(true);
    try {
      await locationService.delete(Number(id));
      toast.success("Xóa khu vực thành công");
      router.push("/admin/danh-muc/khu-vuc");
    } catch (err: any) {
      toast.error(err?.message ?? "Lỗi khi xóa");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">{isCreate ? "Thêm khu vực" : "Cập nhật khu vực"}</p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">{name?.trim() || (isCreate ? "Khu vực mới" : `#${id}`)}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/admin/danh-muc/khu-vuc")} className="border px-3 py-2 rounded-lg">Hủy</button>
            {!isCreate && (
              <button onClick={remove} disabled={actionLoading} className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={save} disabled={actionLoading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
              {actionLoading ? <Spinner /> : <CheckCircle2 className="w-5 h-5" />} {isCreate ? "Tạo mới" : "Cập nhật"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="py-12 text-center"><Spinner /></div>
          ) : (
            <div className="space-y-6 bg-white rounded-xl border border-slate-200 p-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Quận</label>
                <select value={districtId} onChange={(e) => setDistrictId(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                  <option value="">-- Chọn quận --</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">Quận là danh mục do Admin quản lý.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Tên khu vực</label>
                <input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên đường, ví dụ: Nguyễn Trãi" className="mt-1 w-full rounded-md border border-slate-300/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                <p className="mt-1 text-xs text-slate-500">Nhập tên đường hoặc vị trí. Ví dụ: Nguyễn Trãi, Lý Thường Kiệt…</p>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <p className="text-sm text-slate-500">Khu vực ở đây tương ứng với level 'Street'.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-700">Ghi chú</h3>
            <p className="text-sm text-slate-500 mt-2">Các khu vực được dùng để nhóm tòa nhà/căn hộ theo tuyến đường. Dữ liệu ở đây sẽ ảnh hưởng tới tìm kiếm và thống kê.</p>
          </div>
        </div>
      </div>
    </div>
  );
}