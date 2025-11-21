"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Panel from "../../components/Panel";
import AdminTable from "@/components/AdminTable";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import { PlusCircle, Edit3, Trash2, Check, X } from "lucide-react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { locationService } from "@/services/locationService";
import { LocationLevel } from "@/type/location";
import Spinner from "@/components/spinner";

type District = { id: string; name: string };
type Area = { id: string; name: string; districtId: string; buildingCount?: number };

function KhuVucManager() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [ownerOnly, setOwnerOnly] = useState<boolean>(true);
  const [name, setName] = useState("");
  const [districtId, setDistrictId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete">("add");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  useEffect(() => {
    // Try to fetch admin districts; fallback to sample list if unavailable
    let mounted = true;
    (async () => {
      try {
        // Use shared locationService so it goes through axiosClient and app config
        const { items } = await locationService.getAll({ page: 1, limit: 200, level: "District" as LocationLevel });
        if (mounted) {
          // map backend Location -> local District shape (string id)
          const mapped = Array.isArray(items)
            ? items.map((it: any) => ({ id: String(it.id), name: it.name ?? String(it.id) }))
            : [];
          setDistricts(mapped);
        }
      } catch (e) {
        console.log("Failed to load districts from API:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);


  // fetch streets with pagination
  const fetchAreas = async (pageParam = page, limitParam = limit) => {
    setLoading(true);
    try {
      const { items, meta } = await locationService.getAll({ page: pageParam, limit: limitParam, level: 'Street' as LocationLevel, ownerOnly });
      const mapped = Array.isArray(items)
        ? items.map((it: any) => ({ id: String(it.id), name: it.name ?? '', districtId: String(it.parent?.id ?? ''), buildingCount: Number(it.buildingCount ?? 0) }))
        : [];
      setAreas(mapped);
      setTotalPages(meta?.totalPages ?? Math.max(1, Math.ceil((meta?.total ?? mapped.length) / limitParam)));
    } catch (err) {
      console.warn('Failed to load streets', err);
      setAreas([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);
  // refetch when ownerOnly toggles
  useEffect(() => { fetchAreas(1, limit); setPage(1); }, [ownerOnly]);
  // (no local persistence here; backend is source of truth)

  const startEdit = (a: Area) => {
    setEditingId(a.id);
    setName(a.name);
    setDistrictId(a.districtId);
    setModalMode("edit");
    setModalOpen(true);
  };

  useEffect(() => {
    if (modalOpen && modalMode !== "delete") {
      setTimeout(() => inputRef.current?.focus(), 50);
      setError(null);
    }
  }, [modalOpen, modalMode]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDistrictId("");
  };

  const save = () => {
    (async () => {
      setError(null);
      if (!name.trim()) return setError("Vui lòng nhập tên đường");
      if (!districtId) return setError("Vui lòng chọn quận");

      setActionLoading(true);
      try {
        if (editingId) {
          // update existing street
          const payload: any = { name: name.trim(), parentId: Number(districtId), level: 'Street' };
          const res = await locationService.update(Number(editingId), payload);
          setAreas((cur) => cur.map((it) => (it.id === String(res.id) ? { id: String(res.id), name: res.name ?? '', districtId: String(res.parent?.id ?? districtId) } : it)));
          toast.success('Cập nhật khu vực thành công');
        } else {
          // create new street
          const payload: any = { name: name.trim(), parentId: Number(districtId), level: 'Street' };
          const res = await locationService.create(payload);
          const newItem: Area = { id: String(res.id), name: res.name ?? '', districtId: String(res.parent?.id ?? districtId) };
          setAreas((cur) => [newItem, ...cur]);
          toast.success('Thêm khu vực thành công');
        }
        resetForm();
        setModalOpen(false);
      } catch (err: any) {
        const msg = err?.message ?? 'Lỗi khi lưu';
        setError(msg);
        toast.error(msg);
      } finally {
        setActionLoading(false);
      }
    })();
  };

  const remove = (id: string) => {
    (async () => {
      setActionLoading(true);
      try {
        await locationService.delete(Number(id));
        setAreas((cur) => cur.filter((it) => it.id !== id));
        setModalOpen(false);
        toast.success('Xóa khu vực thành công');
      } catch (err: any) {
        const msg = err?.message ?? 'Lỗi khi xóa';
        setError(msg);
        toast.error(msg);
      } finally {
        setActionLoading(false);
      }
    })();
  };

  const districtMap = useMemo(() => {
    const m: Record<string, string> = {};
    districts.forEach((d) => (m[d.id] = d.name));
    return m;
  }, [districts]);
  return (
    <div>
      <Panel title="Quản lý khu vực" actions={(
        <button
          onClick={() => {
            resetForm();
            setModalMode("add");
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md"
          title="Thêm khu vực"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      )}>

        <AdminTable headers={["Mã", "Tên khu vực", "Quận", "Số tòa nhà", "Hành động"]}>
          {loading ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-sm text-slate-500">
                <div className="inline-flex items-center gap-2">
                  <Spinner />
                  Đang tải danh sách khu vực...
                </div>
              </td>
            </tr>
          ) : areas.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-sm text-slate-500">
                Chưa có khu vực nào — hãy thêm bằng nút +
              </td>
            </tr>
          ) : (
                areas.map((a, idx) => (
                  <tr key={a.id}>
                    <td className="py-2 text-sm text-slate-700">{a.id}</td>
                    <td className="py-2 text-sm text-slate-700">{a.name}</td>
                    <td className="py-2 text-sm text-slate-700">{districtMap[a.districtId] ?? a.districtId}</td>
                    <td className="py-2 text-sm text-slate-700 text-center">{a.buildingCount ?? 0}</td>
                    <td className="py-2 text-sm text-slate-700 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => startEdit(a)} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(a.id);
                            setName(a.name);
                            setDistrictId(a.districtId);
                            setModalMode("delete");
                            setModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
          )}
        </AdminTable>

        
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            onPageChange={(p: number) => setPage(p)}
          />
        </div>

        <Modal
          open={modalOpen}
          title={modalMode === "add" ? "Thêm khu vực" : modalMode === "edit" ? "Sửa khu vực" : "Xóa khu vực"}
          onClose={() => setModalOpen(false)}
          footer={
            modalMode === "delete" ? (
                <div className="flex justify-end gap-2">
                <button disabled={actionLoading} onClick={() => setModalOpen(false)} className="inline-flex items-center gap-2 border px-3 py-2 rounded-md disabled:opacity-50">
                  <X className="w-4 h-4" /> Hủy
                </button>
                <button disabled={actionLoading} onClick={() => remove(editingId ?? "")} className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50">
                  {actionLoading ? <Spinner /> : <Trash2 className="w-4 h-4" />} Xóa
                </button>
              </div>
            ) : (
                <div className="flex justify-end gap-2">
                <button disabled={actionLoading} onClick={() => setModalOpen(false)} className="inline-flex items-center gap-2 border px-3 py-2 rounded-md disabled:opacity-50">
                  <X className="w-4 h-4" /> Hủy
                </button>
                <button disabled={actionLoading} onClick={save} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md disabled:opacity-50">
                  {actionLoading ? <Spinner /> : <Check className="w-4 h-4" />} Lưu
                </button>
              </div>
            )
          }
        >
          {modalMode === "delete" ? (
            <div>Bạn có chắc muốn xóa khu vực "{name}" không?</div>
          ) : (
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-slate-700">Quận</label>
                <select value={districtId} onChange={(e) => setDistrictId(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                  <option value="">-- Chọn quận --</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">Quận là danh mục do Admin quản lý.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Tên đường</label>
                <input
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên đường, ví dụ: Nguyễn Trãi"
                  className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <p className="mt-1 text-xs text-slate-500">Nhập tên đường hoặc vị trí. Ví dụ: Nguyễn Trãi, Lý Thường Kiệt…</p>
              </div>

              
              {error && <div className="text-sm text-red-600">{error}</div>}
            </div>
          )}
        </Modal>
      </Panel>
    </div>
  );
}

export default function Page() {
  return (
    <div className="p-6">
      <KhuVucManager />
    </div>
  );
}
