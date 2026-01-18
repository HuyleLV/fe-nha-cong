"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apartmentService } from "@/services/apartmentService";
import { asImageSrc, asMediaSrc } from '@/utils/imageUrl';

  const isVideoUrl = (u?: string | null) => {
  if (!u) return false;
  const s = String(u).toLowerCase();
  return (
    s.includes("/static/videos/") ||
    s.endsWith(".mp4") ||
    s.endsWith(".webm") ||
    s.includes("youtube.com") ||
    s.includes("youtu.be") ||
    s.includes("vimeo.com")
  );
};

  // Prefer dedicated short-video fields if backend adds them. Fallback to images array.
  const findShortVideo = (a: any) => {
    if (!a) return null;
    // common possible fields
    if (a.shortVideoUrl) return a.shortVideoUrl;
    if (a.shortVideo) return a.shortVideo;
    if (Array.isArray(a.shortVideos) && a.shortVideos.length) return a.shortVideos[0];
    if (a.videoUrl) return a.videoUrl;
    // fallback to images that look like video urls
    const imgs = Array.isArray(a.images) ? a.images : [];
    return imgs.find((u: string) => isVideoUrl(u)) || null;
  };

export default function ShortReviewInline({ limit = 5 }: { limit?: number }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await apartmentService.getAll({ page: 1, limit: limit, shortOnly: true });
        const rows = (res.items || [])
          .map((a: any) => ({ apt: a, videoUrl: findShortVideo(a) || null, thumb: a.shortVideoThumb ?? a.short_thumb ?? null }))
          .filter((r: any) => !!r.videoUrl)
          .sort((a: any, b: any) => {
            const ta = new Date(a.apt.createdAt || a.apt.created_at || 0).getTime() || 0;
            const tb = new Date(b.apt.createdAt || b.apt.created_at || 0).getTime() || 0;
            if (tb !== ta) return tb - ta;
            return (b.apt.id || 0) - (a.apt.id || 0);
          })
          .slice(0, limit)
          .map((r: any) => ({ apt: r.apt, videoUrl: r.videoUrl, thumb: r.thumb }));
  if (mounted) setItems(rows.map(r => ({ apt: r.apt, videoUrl: asMediaSrc(r.videoUrl) ?? null, thumb: asImageSrc(r.thumb) ?? null })) as any[]);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [limit]);

  // Always render the section; if there are no short videos and not loading,
  // show a friendly placeholder so the section remains visible to users.

  return (
    <section className="max-w-screen-2xl mx-auto px-4 py-4 sm:px-6 md:px-8 md:py-6 bg-white rounded-xl mt-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-2xl md:text-2xl font-bold">Short Video - Trải Nghiệm Phòng</h2>
          <div className="text-sm text-slate-500">Những video ngắn review phòng</div>
        </div>
        <div>
          <Link href="/short-review" className="text-sm text-sky-600 font-medium">Xem thêm →</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-5">
        {loading && <div className="col-span-full py-6 text-center text-slate-500">Đang tải...</div>}
        {!loading && items.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h8v12H4z" />
                </svg>
              </div>
              <div className="text-sm font-medium text-slate-600">Chưa có video review</div>
              <div className="text-xs text-slate-400">Mục này sẽ hiển thị khi chủ nhà thêm short review</div>
            </div>
          </div>
        )}
        {items.map((vItem: any) => {
          const a = vItem.apt;
          const poster = a.shortVideoThumb ?? a.short_thumb ?? ((Array.isArray(a.images) ? a.images.find((u: string) => !u?.toLowerCase?.().includes('.mp4')) : null) || '');
          const address = a.addressPath || a.locationName || '';
          const priceText = a?.rentPrice ? `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Math.round(a.rentPrice))} đ/tháng` : '';
          return (
            <Link
              key={a.id}
              href={`/room/${a.slug || a.id}`}
              className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition transform hover:-translate-y-1"
            >
              {/* Portrait 9:16 container */}
              <div className="relative w-full bg-black/5" style={{ paddingTop: '177.78%' }}>
                {poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={poster} alt={a.title || ''} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">No preview</div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                <div className="absolute left-3 bottom-3 bg-white/90 text-xs rounded px-2 py-1">{a.locationName}</div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-md transform transition duration-200 group-hover:scale-105">
                    <svg className="w-6 h-6 text-sky-600" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>

              <div className="p-3 text-sm">
                <div className="font-medium text-slate-800 line-clamp-2">{a.title || (a.buildingName ? `${a.buildingName} · ${a.roomCode || ''}` : '')}</div>
                {address ? <div className="text-xs text-slate-500 mt-1">{address}</div> : null}
                <div className="text-xs text-slate-800 mt-2 font-semibold">{priceText}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
