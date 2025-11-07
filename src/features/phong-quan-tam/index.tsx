"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { viewingService } from "@/services/viewingService";
import { apartmentService } from "@/services/apartmentService";
import RoomCardItem from "@/components/roomCardItem";
import { Apartment } from "@/type/apartment";
import { Trash2, Clock } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/vi';

dayjs.locale('vi');
dayjs.extend(relativeTime);

function readLocalRecent(): { apartmentId: number; slug?: string; title?: string; coverImageUrl?: string | null; viewedAt: string }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("recent_rooms");
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch {
    return [];
  }
}

export default function ViewedRoomsPage() {
  const [items, setItems] = useState<{ apartment: Apartment | null; viewedAt: string; apartmentId: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const hasToken = typeof document !== "undefined" && (document.cookie.includes("access_token=") || !!localStorage.getItem("access_token"));
    setIsAuthed(!!hasToken);
    (async () => {
      try {
        setLoading(true);
        if (hasToken) {
          // Fetch server-side recent views
          let res = await viewingService.recent({ limit: 50 });
          let serverItems = res.items || [];

          // Optional sync: push local recent (pre-login) to server
          const local = readLocalRecent();
          if (local.length) {
            const serverIds = new Set(serverItems.map((it) => it.apartmentId));
            const needSync = local.filter((r) => r.apartmentId && !serverIds.has(r.apartmentId));
            if (needSync.length) {
              const toPush = needSync.slice(0, 20); // limit to avoid burst
              await Promise.allSettled(toPush.map((r) => viewingService.recordVisit(r.apartmentId)));
              // refetch after sync
              res = await viewingService.recent({ limit: 50 });
              serverItems = res.items || [];
            }
          }
          setItems(serverItems);
        } else {
          // Fallback to local recent: fetch apartment details to show full cards
          const local = readLocalRecent();
          if (local.length === 0) {
            setItems([]);
          } else {
            const limited = local.slice(0, 50);
            // Fetch details in parallel (avoid overloading server)
            const results = await Promise.all(
              limited.map(async (r) => {
                try {
                  let apt: Apartment | null = null;
                  if (r.slug) {
                    apt = await apartmentService.getBySlug(r.slug);
                  } else if (r.apartmentId) {
                    apt = await apartmentService.getById(r.apartmentId);
                  }
                  return { apartment: apt, viewedAt: r.viewedAt, apartmentId: r.apartmentId };
                } catch {
                  return { apartment: null, viewedAt: r.viewedAt, apartmentId: r.apartmentId };
                }
              })
            );
            setItems(results);
          }
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onClear = async () => {
    try {
      if (isAuthed) await viewingService.clearRecent();
      if (typeof window !== "undefined") localStorage.removeItem("recent_rooms");
      setItems([]);
    } catch {}
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Phòng quan tâm</h1>
          <p className="text-sm text-gray-600">Những phòng bạn đã xem gần đây</p>
        </div>
        {items.length > 0 && (
          <button onClick={onClear} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Xoá lịch sử
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-600">Chưa có phòng nào trong lịch sử.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {items.map((it, idx) => (
            <div key={idx} className="relative">
              {/* If apartment is fully loaded from API, show card; else show a minimal link */}
              {it.apartment ? (
                <RoomCardItem
                  item={it.apartment as Apartment}
                  extraBadge={<><Clock className="h-3.5 w-3.5 text-emerald-600" /> <span title={new Date(it.viewedAt).toLocaleString()} className="truncate">{dayjs(it.viewedAt).fromNow()}</span></>}
                />
              ) : (
                <div className="rounded-xl border p-4">
                  <div className="text-gray-800 font-medium">Phòng #{it.apartmentId}</div>
                  <div className="text-sm text-gray-500">Chi tiết sẽ hiện khi đăng nhập</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
