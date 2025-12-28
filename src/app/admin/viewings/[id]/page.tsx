"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { viewingService, type Viewing } from "@/services/viewingService";
import { apartmentService } from "@/services/apartmentService";
import ConfirmModal from '@/components/ConfirmModal';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
      <ChevronRight className="w-4 h-4 text-slate-400" />
      <h3 className="font-semibold text-slate-700">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export default function ViewingAdminDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const vid = useMemo(() => Number(id), [id]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Viewing | null>(null);
  const [apartmentTitle, setApartmentTitle] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const v = await viewingService.adminGet(vid);
        setData(v);
        try {
          const a = await apartmentService.getById(v.apartmentId);
          setApartmentTitle(a?.title || "");
        } catch {}
      } catch (e: any) {
        toast.error(e?.message || "Không tải được lịch");
        router.replace("/admin/viewings");
        return;
      } finally {
        setLoading(false);
      }
    })();
  }, [vid, router]);

  const viewingStatusVi = (st: Viewing["status"]) => {
    switch (st) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "cancelled":
        return "Đã huỷ";
      case "visited":
        return "Đã xem";
      default:
        return String(st);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-[300px] grid place-items-center text-slate-600">
        <Loader2 className="w-5 h-5 animate-spin" /> Đang tải…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <Section title={`Chi tiết lịch #${data.id}`}>
        <div className="grid grid-cols-3 gap-2 text-sm text-slate-700">
          <div className="text-slate-500">Căn hộ</div>
          <div className="col-span-2">
            <Link href={`/admin/apartment/${data.apartmentId}`} className="text-emerald-700 hover:underline">
              #{data.apartmentId} {apartmentTitle ? `— ${apartmentTitle}` : ""}
            </Link>
          </div>

          <div className="text-slate-500">Khách</div>
          <div className="col-span-2">{data.name}</div>

          {data.phone && (<><div className="text-slate-500">SĐT</div><div className="col-span-2">{data.phone}</div></>)}
          {data.email && (<><div className="text-slate-500">Email</div><div className="col-span-2">{data.email}</div></>)}

          <div className="text-slate-500">Thời gian</div>
          <div className="col-span-2">{new Date(data.preferredAt).toLocaleString()}</div>

          <div className="text-slate-500">Trạng thái</div>
          <div className="col-span-2">{viewingStatusVi(data.status)}</div>

          {data.note && (<><div className="text-slate-500">Ghi chú</div><div className="col-span-2 whitespace-pre-wrap">{data.note}</div></>)}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          {data.status !== 'confirmed' && (
            <button
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
              onClick={async () => {
                try {
                  await viewingService.adminUpdateStatus(data.id, { status: 'confirmed' });
                  setData({ ...data, status: 'confirmed' });
                  toast.success('Đã xác nhận lịch');
                } catch (e: any) {
                  toast.error(e?.message || 'Không thể cập nhật');
                }
              }}
            >Xác nhận</button>
          )}
          {data.status !== 'cancelled' && (
            <button
              className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
              onClick={async () => {
                try {
                  await viewingService.adminUpdateStatus(data.id, { status: 'cancelled' });
                  setData({ ...data, status: 'cancelled' });
                  toast.success('Đã huỷ lịch');
                } catch (e: any) {
                  toast.error(e?.message || 'Không thể cập nhật');
                }
              }}
            >Huỷ</button>
          )}
          <button
            className="px-3 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
            onClick={async () => {
              setConfirmOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4 inline-block mr-1" /> Xoá
          </button>
        </div>
      </Section>
      <ConfirmModal
        open={confirmOpen}
        title="Xoá lịch" 
        message={`Xoá lịch #${data?.id ?? ''}?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          try {
            await viewingService.adminRemove(data!.id);
            toast.success('Đã xoá lịch');
            router.replace('/admin/viewings');
          } catch (e: any) {
            toast.error(e?.message || 'Không thể xoá');
          } finally {
            setConfirmOpen(false);
          }
        }}
      />
    </div>
  );
}
