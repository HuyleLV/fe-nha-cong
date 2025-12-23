"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Check, X } from "lucide-react";
import AdminTable from "@/components/AdminTable";
import Spinner from "@/components/spinner";
import { apartmentService } from "@/services/apartmentService";
import { Apartment } from "@/type/apartment";
import { fNumber } from '@/utils/format-number';
import { userService } from "@/services/userService";
import { User } from "@/type/user";

export default function ModerationApartmentPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Apartment[]>([]);
  const [owners, setOwners] = useState<Record<number, User>>({});

  const fetch = async () => {
    setLoading(true);
    try {
      // Request moderation list ordered by fill payment amount descending so admins
      // can prioritize approvals that pay more to fill rooms.
      const res = await apartmentService.getAll({ page: 1, limit: 200, isApproved: false, sort: 'fill_payment_desc' } as any);
      const apts = (res.items || []) as Apartment[];
      setItems(apts);

      try {
        const ids = Array.from(new Set(apts.map(a => Number((a as any).createdById)).filter(Boolean)));
        if (ids.length) {
          const users = await Promise.all(ids.map(id => userService.getAdminUser(id).catch(() => null)));
          const map: Record<number, User> = {};
          ids.forEach((id, idx) => {
            const u = users[idx];
            if (u && (u as any).id) map[id] = u as User;
          });
          setOwners(map);
        } else {
          setOwners({});
        }
      } catch (err) {
        // non-fatal
        setOwners({});
      }
    } catch (e: any) {
      toast.error(e?.message || 'Không thể tải danh sách căn hộ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const onApprove = async (id: number) => {
    if (!confirm('Duyệt căn hộ này để hiển thị trên website?')) return;
    try {
      await apartmentService.update(id, { status: 'published', isApproved: true } as any);
      toast.success('Đã duyệt căn hộ');
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      toast.error(e?.message || 'Duyệt thất bại');
    }
  };

  const onReject = async (id: number) => {
    if (!confirm('Bạn có chắc muốn từ chối căn hộ này?')) return;
    try {
      await apartmentService.update(id, { status: 'archived', isApproved: false } as any);
      toast.success('Đã từ chối căn hộ');
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      toast.error(e?.message || 'Từ chối thất bại');
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Kiểm duyệt Căn hộ</h1>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="min-h-[200px] grid place-items-center"><Spinner /></div>
        ) : (
          <AdminTable headers={["Mã", "Tiêu đề", "Giá", "Cần lấp", "Tiền lấp (VND)", "Chủ sở hữu (ID)", "Hành động"]} loading={loading}>
            {items.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">{a.id}</td>
                <td className="px-4 py-2">{a.title ?? `#${a.id}`}</td>
                <td className="px-4 py-2">{a.rentPrice ?? '-'}</td>
                <td className="px-4 py-2">{(a as any).needsFill ? 'Có' : '—'}</td>
                <td className="px-4 py-2">{(a as any).fillPaymentAmount ? `${fNumber(Number(String((a as any).fillPaymentAmount || 0)))} đ` : '-'}</td>
                <td className="px-4 py-2 align-top">
                  {(() => {
                    const ownerId = Number((a as any).createdById ?? (a as any).created_by ?? 0) || null;
                    const owner = ownerId ? owners[ownerId] : null;
                    if (owner) {
                      return (
                        <div>
                          <div className="font-medium text-slate-800">{owner.name}</div>
                          <div className="text-xs text-slate-500">{owner.phone} {owner.email}</div>
                        </div>
                      );
                    }
                    // fallback: show id if no owner object
                    return <span>{ownerId ?? '-'}</span>;
                  })()}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      title="Duyệt"
                      onClick={() => onApprove(a.id)}
                      className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      title="Từ chối"
                      onClick={() => onReject(a.id)}
                      className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>
    </div>
  );
}
