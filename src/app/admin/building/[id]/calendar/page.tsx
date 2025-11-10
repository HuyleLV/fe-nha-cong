"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import Spinner from "@/components/spinner";
import CalendarMonth, { type CalendarEvent } from "@/components/CalendarMonth";
import { viewingService, type Viewing } from "@/services/viewingService";
import { buildingService } from "@/services/buildingService";
import type { Building } from "@/type/building";
import { toast } from "react-toastify";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
      <ChevronRight className="w-4 h-4 text-slate-400" />
      <h3 className="font-semibold text-slate-700">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

function BuildingCalendarInner() {
  const { id } = useParams<{ id: string }>();
  const bid = useMemo(() => Number(id), [id]);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState<Building | null>(null);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [selectedViewing, setSelectedViewing] = useState<Viewing | null>(null);

  const vLimit = 500;

  useEffect(() => {
    (async () => {
      try {
        const [b, v] = await Promise.all([
          buildingService.getById(bid),
          viewingService.adminList({ page: 1, limit: vLimit, buildingId: bid }),
        ]);
        setBuilding(b);
        setViewings(v.items || []);
      } catch (e: any) {
        toast.error(e?.message || "Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    })();
  }, [bid]);

  const viewingStatusVi = (st: Viewing["status"], isDeposit: boolean) => {
    if (isDeposit && st === 'pending') return 'Chờ đặt cọc';
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

  if (loading) return <div className="min-h-[300px] grid place-items-center"><Spinner /></div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-emerald-600" />
          <div>
            <div className="text-sm text-slate-500">Lịch đặt phòng theo tòa nhà</div>
            <h1 className="text-lg font-semibold text-slate-800">
              {building?.name ? `${building.name} (ID #${building.id})` : `Tòa nhà #${bid}`}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/building" className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">Quay lại danh sách</Link>
          <Link href={`/admin/building/${bid}`} className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Xem tòa nhà</Link>
        </div>
      </div>

      <Section title="Lịch đặt phòng (Calendar)">
        <CalendarMonth
          events={(viewings || []).map((v) => {
            const isDeposit = (v.note || "").includes("[DEPOSIT]");
            return {
              id: v.id,
              date: new Date(v.preferredAt),
              title: `#${v.apartmentId} · ${v.name}${v.phone ? ` (${v.phone})` : ""}` + (isDeposit ? " · Đặt cọc" : ""),
              status: isDeposit ? "deposit" : v.status,
            } as CalendarEvent;
          })}
          onEventClick={(ev) => {
            const found = (viewings || []).find((v) => v.id === ev.id);
            if (found) setSelectedViewing(found);
          }}
        />
      </Section>

      {selectedViewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedViewing(null)} />
          <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="font-semibold text-slate-800">Chi tiết lịch #{selectedViewing.id}</div>
              <button className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedViewing(null)}>Đóng</button>
            </div>
            <div className="p-4 space-y-3 text-sm text-slate-700">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-slate-500">Căn hộ</div>
                <div className="col-span-2">
                  <Link href={`/admin/apartment/${selectedViewing.apartmentId}`} className="text-emerald-700 hover:underline">#{selectedViewing.apartmentId}</Link>
                </div>
                <div className="text-slate-500">Khách</div>
                <div className="col-span-2">{selectedViewing.name}</div>
                {selectedViewing.phone && (<><div className="text-slate-500">SĐT</div><div className="col-span-2">{selectedViewing.phone}</div></>)}
                {selectedViewing.email && (<><div className="text-slate-500">Email</div><div className="col-span-2">{selectedViewing.email}</div></>)}
                <div className="text-slate-500">Thời gian</div>
                <div className="col-span-2">{new Date(selectedViewing.preferredAt).toLocaleString()}</div>
                <div className="text-slate-500">Trạng thái</div>
                <div className="col-span-2">{viewingStatusVi(selectedViewing.status, (selectedViewing.note||'').includes('[DEPOSIT]'))}</div>
                {selectedViewing.note && (<><div className="text-slate-500">Ghi chú</div><div className="col-span-2 whitespace-pre-wrap">{(selectedViewing.note||'').includes('[DEPOSIT]') ? 'Đặt cọc: ' + selectedViewing.note.replace('[DEPOSIT]', '').trim() : selectedViewing.note}</div></>)}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                {selectedViewing.status !== 'confirmed' && (
                  <button
                    className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                    onClick={async () => {
                      try {
                        await viewingService.adminUpdateStatus(selectedViewing.id, { status: 'confirmed' });
                        setViewings((arr) => arr.map((v) => v.id === selectedViewing.id ? { ...v, status: 'confirmed' } : v));
                        setSelectedViewing((v) => v ? { ...v, status: 'confirmed' } as any : v);
                        toast.success('Đã xác nhận lịch');
                      } catch (e: any) {
                        toast.error(e?.message || 'Không thể cập nhật');
                      }
                    }}
                  >Xác nhận</button>
                )}
                {selectedViewing.status !== 'cancelled' && (
                  <button
                    className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    onClick={async () => {
                      try {
                        await viewingService.adminUpdateStatus(selectedViewing.id, { status: 'cancelled' });
                        setViewings((arr) => arr.map((v) => v.id === selectedViewing.id ? { ...v, status: 'cancelled' } : v));
                        setSelectedViewing((v) => v ? { ...v, status: 'cancelled' } as any : v);
                        toast.success('Đã huỷ lịch');
                      } catch (e: any) {
                        toast.error(e?.message || 'Không thể cập nhật');
                      }
                    }}
                  >Huỷ</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuildingCalendarPage() {
  return (
    <Suspense fallback={<div className="min-h-[300px] grid place-items-center"><Spinner /></div>}>
      <BuildingCalendarInner />
    </Suspense>
  );
}
