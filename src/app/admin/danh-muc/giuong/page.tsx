"use client";

import React, { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from "@/components/AdminTable";
import Link from "next/link";
import { PlusCircle, Edit3, Trash2 } from "lucide-react";
import { bedService } from "@/services/bedService";
import { Bed } from "@/type/bed";
import { toast } from "react-toastify";

export default function Page() {
  const [items, setItems] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await bedService.getAll({ page: 1, limit: 200 });
      const formatMoney = (v?: string | null) => {
        if (v === undefined || v === null) return '';
        return String(v).replace(/\.0+$/, '');
      };
      const items = (res.items || []).map(it => ({ ...it, rentPrice: formatMoney(it.rentPrice), depositAmount: it.depositAmount == null ? undefined : formatMoney(it.depositAmount) }));
      setItems(items as Bed[]);
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id?: number) => {
    if (!id) return;
    if (!confirm('Bạn có chắc muốn xóa giường này không?')) return;
    try {
      await bedService.remove(id);
      await load();
      toast.success('Xóa giường thành công');
    } catch (err: any) {
      alert(err?.message || 'Xóa thất bại');
    }
  };

  return (
    <div className="p-6">
      <Panel title="Quản lý Giường" actions={(
        <Link href="/admin/danh-muc/giuong/create" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md" title="Thêm giường"><PlusCircle className="w-5 h-5"/></Link>
      )}>
        <AdminTable headers={["Mã","Tên giường","Giá thuê","Đặt cọc","Trạng thái","Hành động"]}>
          {items.length === 0 ? (
            <tr><td colSpan={6} className="py-6 text-center text-slate-500">{loading ? 'Đang tải...' : 'Chưa có giường'}</td></tr>
          ) : items.map((it, idx) => (
            <tr key={it.id} className="border-b">
              <td className="py-3 text-sm text-slate-700">{items.length - idx}</td>
              <td className="py-3 text-sm text-slate-700">{it.name}</td>
              <td className="py-3 text-sm text-slate-700">{it.rentPrice}</td>
              <td className="py-3 text-sm text-slate-700">{it.depositAmount ?? '-'}</td>
              <td className="py-3 text-sm text-slate-700">{(function(s){ if(!s) return '-'; if(s === 'active') return 'Hoạt động'; if(s === 'inactive') return 'Không hoạt động'; if(s === 'draft') return 'Nháp'; return s; })(it.status)}</td>
              <td className="py-3 text-sm text-slate-700 text-center">
                <div className="inline-flex items-center gap-2">
                  <Link href={`/admin/danh-muc/giuong/${it.id}`} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa"><Edit3 className="w-4 h-4"/></Link>
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
