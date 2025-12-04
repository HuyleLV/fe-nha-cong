"use client";

import React, { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import AdminTable from "@/components/AdminTable";
import { useRouter } from "next/navigation";
import { PlusCircle, Edit3, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { invoiceService } from "@/services/invoiceService";

export default function HoaDonPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    try {
      const res = await invoiceService.list();
      const items = (res?.data ?? res) as any[];
      setRows(items || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: number) => {
    if (!confirm("Xoá hóa đơn này?")) return;
    try {
      await invoiceService.remove(id);
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Không xoá được");
    }
  };

  return (
    <div className="p-6">
      <Panel title="Hóa đơn">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">Danh sách hóa đơn của bạn.</p>
          <div>
            <button
              onClick={() => router.push("/quan-ly-chu-nha/tai-chinh/hoa-don/create")}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md"
              title="Thêm mới"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <AdminTable
          headers={[
            "ID",
            "Tòa nhà",
            "Căn hộ",
            "Hợp đồng",
            "Kỳ",
            "Ngày lập",
            "Hạn thanh toán",
            "Hành động",
          ]}
          loading={loading}
        >
          {rows.length === 0
            ? null
            : rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 text-left">{r.id}</td>
                  <td className="px-4 py-3 text-left">{r.buildingName ?? r.buildingId}</td>
                  <td className="px-4 py-3 text-left">{r.apartmentTitle ?? r.apartmentId}</td>
                  <td className="px-4 py-3 text-left">{r.contractId ?? ""}</td>
                  <td className="px-4 py-3 text-left">{r.period}</td>
                  <td className="px-4 py-3 text-left">{r.issueDate ? new Date(r.issueDate).toLocaleDateString() : ""}</td>
                  <td className="px-4 py-3 text-left">{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : ""}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Sửa"
                        onClick={() => router.push(`/quan-ly-chu-nha/tai-chinh/hoa-don/${r.id}`)}
                        className="p-2 rounded bg-emerald-600 text-white"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        title="Xoá"
                        onClick={() => onDelete(r.id)}
                        className="p-2 rounded bg-red-600 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
        </AdminTable>
      </Panel>
    </div>
  );
}
