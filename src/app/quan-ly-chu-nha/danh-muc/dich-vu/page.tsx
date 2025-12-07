"use client";

import React, { useEffect, useState } from "react";
import Panel from "../../components/Panel";
import AdminTable from "@/components/AdminTable";
import { formatMoneyVND } from "@/utils/format-number";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { PlusCircle, Edit3, Trash2 } from "lucide-react";
import { serviceService } from "@/services/serviceService";
import { buildingService } from "@/services/buildingService";
import { ServiceItem } from "@/type/service";
import { useRouter } from "next/navigation";

export default function Page() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [buildingMap, setBuildingMap] = useState<Record<number, string>>({});
  const router = useRouter();

  const load = async (p = page) => {
    setLoading(true);
    try {
      const [svcRes, bRes] = await Promise.all([
        serviceService.getAll({ page: p, limit }),
        buildingService.getAll({ page: 1, limit: 500 }),
      ]);
      const items = (svcRes.items || []) as ServiceItem[];
      setItems(items);
      const meta = svcRes.meta || {} as any;
      setPage(Number(meta.page) || p || 1);
      setLimit(Number(meta.limit) || limit || 10);
      setTotal(Number(meta.total) || items.length);
      const map: Record<number, string> = {};
      for (const b of (bRes.items || [])) {
        if (b && typeof b.id === 'number') map[b.id] = b.name;
      }
      setBuildingMap(map);
    } catch (err) {
      setItems([]);
      setBuildingMap({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id?: number) => {
    if (!id) return;
    if (!confirm('Bạn có chắc muốn xóa dịch vụ này không?')) return;
    try {
      await serviceService.remove(id);
      await load();
    } catch (err: any) {
      alert(err?.message || 'Xóa thất bại');
    }
  };

  const tFee = (ft?: string | null) => {
    if (!ft) return '-';
    switch(ft) {
      case 'rent': return 'Tiền nhà';
      case 'deposit': return 'Tiền cọc';
      case 'water': return 'Tiền nước';
      case 'electric': return 'Tiền điện';
      case 'internet': return 'Tiền internet';
      case 'cleaning': return 'Tiền vệ sinh';
      case 'management_fee': return 'Tiền phí quản lý';
      case 'parking': return 'Tiền gửi xe';
      case 'service_fee': return 'Tiền phí dịch vụ';
      case 'laundry': return 'Tiền phí giặt sấy';
      case 'room_transfer_fee': return 'Tiền phí nhượng phòng';
      default: return 'Khác';
    }
  };

  const tPriceType = (pt?: string | null) => {
    if (!pt) return '-';
    switch (pt) {
      case 'fixed': return 'Đơn giá cố định theo tháng';
      case 'percent': return 'Đơn giá biến động';
      case 'meter_fixed': return 'Đơn giá cố định theo đồng hồ';
      case 'meter_quota': return 'Đơn giá định mức theo đồng hồ';
      case 'quantity_quota': return 'Định mức theo số lượng';
      case 'per_unit':
      default:
        return 'Đơn giá theo đồng hồ/định mức';
    }
  };

  const tUnit = (u?: string | null) => {
    if (!u) return '-';
    switch (u) {
      case 'phong': return 'Phòng';
      case 'giuong': return 'Giường';
      case 'kwh': return 'kWh';
      case 'm3': return 'm³';
      case 'm2': return 'm²';
      case 'xe': return 'Xe';
      case 'luot': return 'Lượt/Lần';
      default: return u;
    }
  };

  return (
    <div className="p-6">
      <Panel title="Quản lý Dịch vụ" actions={(
        <Link href="/quan-ly-chu-nha/danh-muc/dich-vu/create" className="inline-flex items-center gap-2 bg-emerald-600 text-white p-2 rounded-md" title="Thêm dịch vụ"><PlusCircle className="w-5 h-5"/></Link>
      )}>
        <AdminTable headers={["Mã","Tên dịch vụ","Loại phí","Loại đơn giá","Đơn giá","Đơn vị tính","Thuế suất","Tòa nhà","Ghi chú","Hành động"]}>
          {items.length === 0 ? (
            <tr><td colSpan={10} className="py-6 text-center text-slate-500">{loading ? 'Đang tải...' : 'Chưa có dịch vụ'}</td></tr>
          ) : items.map((it, idx) => (
            <tr key={it.id} className="border-b">
              <td className="py-3 text-sm text-slate-700">{items.length - idx}</td>
              <td className="py-3 text-sm text-slate-700">{it.name}</td>
              <td className="py-3 text-sm text-slate-700">{tFee(it.feeType)}</td>
              <td className="py-3 text-sm text-slate-700">{tPriceType(it.priceType)}</td>
              <td className="py-3 text-sm text-slate-700">{it.unitPrice != null && it.unitPrice !== '' ? formatMoneyVND(Number(String(it.unitPrice).replace(/,/g, ''))) : '-'}</td>
              <td className="py-3 text-sm text-slate-700">{tUnit(it.unit)}</td>
              <td className="py-3 text-sm text-slate-700">{it.taxRate ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700">
                {it.buildingId ? (
                  buildingMap[it.buildingId]
                    ? `${it.buildingId}_${buildingMap[it.buildingId]}`
                    : String(it.buildingId)
                ) : '-'}
              </td>
              <td className="py-3 text-sm text-slate-700">{it.note ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700 text-center">
                <div className="inline-flex items-center gap-2">
                  <Link href={`/quan-ly-chu-nha/danh-muc/dich-vu/${it.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa"><Edit3 className="w-4 h-4"/></Link>
                  <button onClick={() => remove(it.id)} className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700" title="Xóa"><Trash2 className="w-4 h-4"/></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        <Pagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={(p) => {
            setPage(p);
            load(p);
          }}
        />
      </Panel>
    </div>
  );
}
