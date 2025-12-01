"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar as CalendarIcon } from "lucide-react";
import Spinner from "@/components/spinner";
import CalendarMonth, { type CalendarEvent } from "@/components/CalendarMonth";
import { viewingService, type Viewing } from "@/services/viewingService";
import { apartmentService } from "@/services/apartmentService";
import type { Apartment } from "@/type/apartment";
import { toast } from "react-toastify";

function HostApartmentCalendarInner() {
  const { id } = useParams<{ id: string }>();
  const aid = useMemo(() => Number(id), [id]);

  const [loading, setLoading] = useState(true);
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [selectedViewing, setSelectedViewing] = useState<Viewing | null>(null);

  const vLimit = 500;

  useEffect(() => {
    (async () => {
      try {
        const [a, v] = await Promise.all([
          apartmentService.getById(aid),
          viewingService.hostList({ page: 1, limit: vLimit, apartmentId: aid }),
        ]);
        setApartment(a);
        setViewings(v.items || []);
      } catch (e: any) {
        toast.error(e?.message || "Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    })();
  }, [aid]);

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
            <div className="text-sm text-slate-500">Lịch đặt phòng theo căn hộ</div>
            <h1 className="text-lg font-semibold text-slate-800">
              {apartment?.title ? `${apartment.title} (ID #${apartment.id})` : `Căn hộ #${aid}`}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/quan-ly-chu-nha/danh-muc/can-ho" className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">Quay lại danh sách</Link>
          <Link href={`/quan-ly-chu-nha/danh-muc/can-ho/${aid}`} className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Xem căn hộ</Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <CalendarMonth
          events={(viewings || []).map((v) => {
            const isDeposit = (v.note || "").includes("[DEPOSIT]");
            return {
              id: v.id,
              date: new Date(v.preferredAt),
              title: `${v.name}${v.phone ? ` (${v.phone})` : ""}` + (isDeposit ? " · Đặt cọc" : ""),
              status: isDeposit ? "deposit" : v.status,
            } as CalendarEvent;
          })}
          onEventClick={(ev) => {
            const found = (viewings || []).find((v) => v.id === ev.id);
            if (found) setSelectedViewing(found);
          }}
        />
      </div>

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
                <div className="text-slate-500">Khách</div>
                <div className="col-span-2">{selectedViewing.name}</div>
                {selectedViewing.phone && (<><div className="text-slate-500">SĐT</div><div className="col-span-2">{selectedViewing.phone}</div></>) }
                {selectedViewing.email && (<><div className="text-slate-500">Email</div><div className="col-span-2">{selectedViewing.email}</div></>) }
                <div className="text-slate-500">Thời gian</div>
                <div className="col-span-2">{new Date(selectedViewing.preferredAt).toLocaleString()}</div>
                <div className="text-slate-500">Trạng thái</div>
                <div className="col-span-2">{viewingStatusVi(selectedViewing.status, (selectedViewing.note||'').includes('[DEPOSIT]'))}</div>
                {selectedViewing.note && (<><div className="text-slate-500">Ghi chú</div><div className="col-span-2 whitespace-pre-wrap">{(selectedViewing.note||'').includes('[DEPOSIT]') ? 'Đặt cọc: ' + selectedViewing.note.replace('[DEPOSIT]', '').trim() : selectedViewing.note}</div></>)}
              </div>

              {/* Read-only for host: no confirm/cancel actions here */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HostApartmentCalendarPage() {
  return (
    <Suspense fallback={<div className="min-h-[300px] grid place-items-center"><Spinner /></div>}>
      <HostApartmentCalendarInner />
    </Suspense>
  );
}
