"use client";

import React, { useEffect, useState } from "react";
import Panel from "../../components/Panel";
import AdminTable from "@/components/AdminTable";
import Link from "next/link";
import { PlusCircle, Edit3, Trash2 } from "lucide-react";
import { assetService } from "@/services/assetService";
import { Asset } from "@/type/asset";
import { buildingService } from "@/services/buildingService";
import { apartmentService } from "@/services/apartmentService";
import { bedService } from "@/services/bedService";
import { formatMoneyVND } from "@/utils/format-number";
import { toast } from "react-toastify";

export default function Page() {
  const [items, setItems] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [buildingsMap, setBuildingsMap] = useState<Record<number, string>>({});
  const [apartmentsMap, setApartmentsMap] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const [res, bRes, aRes] = await Promise.all([
        assetService.getAll({ page: 1, limit: 200 }),
        buildingService.getAll({ page: 1, limit: 200 }),
        apartmentService.getAll({ page: 1, limit: 200 }),
      ]);
      setItems(res.items || []);
      const bMap: Record<number, string> = {};
      (bRes.items || []).forEach((b: any) => (bMap[b.id] = b.name || b.title || `Tòa nhà #${b.id}`));
      setBuildingsMap(bMap);
      const aMap: Record<number, string> = {};
      (aRes.items || []).forEach((a: any) => (aMap[a.id] = a.title || a.roomCode || `Căn hộ #${a.id}`));
      setApartmentsMap(aMap);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải danh sách tài sản');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id?: number) => {
    if (!id) return;
    if (!confirm('Bạn có chắc muốn xóa tài sản này không?')) return;
    try {
      await assetService.remove(id);
      toast.success('Đã xóa tài sản');
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Xóa thất bại');
    }
  };

  return (
    <div className="p-6">
      <Panel title="Quản lý Tài sản" actions={(
        <Link href="/quan-ly-chu-nha/danh-muc/tai-san/create" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md" title="Thêm tài sản"><PlusCircle className="w-5 h-5"/></Link>
      )}>

        <AdminTable headers={["Mã","Tên","Thương hiệu","Màu","Model/Năm","Xuất xứ","Giá trị","Số lượng","Tình trạng","Bảo hành","Tòa nhà","Phòng","Hành động"]} loading={loading}>
          {items.length === 0 ? (
            <tr><td colSpan={13} className="py-6 text-center text-slate-500">{loading ? 'Đang tải...' : 'Chưa có tài sản'}</td></tr>
          ) : items.map((it, idx) => (
            <tr key={it.id} className="border-b">
              <td className="py-3 text-sm text-slate-700">{items.length - idx}</td>
              <td className="py-3 text-sm text-slate-700">{it.name}</td>
              <td className="py-3 text-sm text-slate-700">{it.brand ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700">{it.color ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700">{it.modelOrYear ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700">{it.origin ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700">{it.value ? formatMoneyVND(Number(String(it.value).replace(/,/g,''))) : '-'}</td>
              <td className="py-3 text-sm text-slate-700">{it.quantity ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700">{(it.status === 'available' ? 'Sẵn sàng' : it.status === 'in_use' ? 'Đang sử dụng' : it.status === 'maintenance' ? 'Bảo trì' : it.status === 'retired' ? 'Thanh lý' : it.status)}</td>
              <td className="py-3 text-sm text-slate-700">{it.warrantyPeriod ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700">{it.buildingId ? buildingsMap[it.buildingId] ?? it.buildingId : '-'}</td>
              <td className="py-3 text-sm text-slate-700">{it.apartmentId ? apartmentsMap[it.apartmentId] ?? it.apartmentId : '-'}</td>
              <td className="py-3 text-sm text-slate-700 text-center">
                <div className="inline-flex items-center gap-2">
                  <Link href={`/quan-ly-chu-nha/danh-muc/tai-san/${it.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa"><Edit3 className="w-4 h-4"/></Link>
                  <button onClick={() => remove(it.id)} className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700" title="Xóa"><Trash2 className="w-4 h-4"/></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </Panel>
    </div>
  );
}
