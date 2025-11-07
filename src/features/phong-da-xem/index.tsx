"use client";
import { useEffect, useState } from "react";
import { viewingService } from "@/services/viewingService";
import RoomCardItem from "@/components/roomCardItem";
import { Apartment } from "@/type/apartment";
import { Clock } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/vi';

dayjs.locale('vi');
dayjs.extend(relativeTime);

export default function VisitedRoomsPage() {
  const [items, setItems] = useState<{ apartment: Apartment | null; apartmentId: number; viewingId: number; visitedAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await viewingService.visited({ limit: 50 });
        if (!mounted) return;
        setItems(res.items || []);
        setError(null);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Không thể tải danh sách phòng đã xem");
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Phòng đã xem thực tế</h1>
          <p className="text-sm text-gray-600">Các phòng bạn đã tới xem và được đánh dấu hoàn tất</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Đang tải...</div>
      ) : error ? (
        <div className="text-center text-red-600 text-sm">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-600">Chưa có phòng nào được đánh dấu đã xem.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {items.map((it) => (
            <div key={it.viewingId} className="relative">
              {it.apartment ? (
                <RoomCardItem
                  item={it.apartment as Apartment}
                  extraBadge={<><Clock className="h-3.5 w-3.5 text-sky-600" /> <span title={new Date(it.visitedAt).toLocaleString()} className="truncate">{dayjs(it.visitedAt).fromNow()}</span></>}
                />
              ) : (
                <div className="rounded-xl border p-4 bg-white">
                  <div className="text-gray-800 font-medium">Phòng #{it.apartmentId}</div>
                  <div className="text-sm text-gray-500">Không tải được chi tiết</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
