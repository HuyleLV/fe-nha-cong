"use client";
import React, { useEffect, useState } from "react";
import { locationService } from "@/services/locationService";
import { apartmentService } from "@/services/apartmentService";
import { asImageSrc, asMediaSrc } from '@/utils/imageUrl';
import Link from "next/link";

type LocationItem = { id: number; name: string; slug: string; level?: string };

const isVideoUrl = (u?: string | null) => {
  if (!u) return false;
  const s = String(u).toLowerCase();
  return (
    s.includes("/static/videos/") ||
    s.endsWith(".mp4") ||
    s.endsWith(".webm") ||
    s.endsWith(".ogg") ||
    s.endsWith(".mov") ||
    s.includes("youtube.com") ||
    s.includes("youtu.be") ||
    s.includes("vimeo.com")
  );
};

// Prefer dedicated short-video fields if backend adds them. Fallback to images array.
const findShortVideo = (a: any) => {
  if (!a) return null;
  if (a.shortVideoUrl) return a.shortVideoUrl;
  if (a.shortVideo) return a.shortVideo;
  if (Array.isArray(a.shortVideos) && a.shortVideos.length) return a.shortVideos[0];
  if (a.videoUrl) return a.videoUrl;
  const imgs = Array.isArray(a.images) ? a.images : [];
  return imgs.find((u: string) => isVideoUrl(u)) || null;
};

export default function ShortReviewFeature() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ videoUrl: string | null; apt: any } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { items } = await locationService.getAll({ page: 1, limit: 200, level: "District" as any });
        const normalized = (items || []).map((it: any) => ({ id: it.id, name: it.name ?? "", slug: it.slug ?? "" }));
        setLocations(normalized);
      } catch (e: any) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    // fetch when activeSlug or page changes
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug, page]);

  // Reset to first page when filter changes
  useEffect(() => {
    setPage(1);
  }, [activeSlug]);

  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; pageCount: number } | null>(null);

  async function fetchVideos() {
    setLoading(true);
    setErr(null);
    try {
      const params: any = { page, limit: perPage, shortOnly: true };
      if (activeSlug) params.locationSlug = activeSlug;
      const { items, meta: m } = await apartmentService.getAll(params);
      const cand = (items || [])
        // prefer explicit short fields but fallback to other video-like URLs
        .map((a: any) => ({
          apt: a,
          videoUrl: findShortVideo(a) || null,
          thumb: (a.shortVideoThumb ?? a.short_thumb ?? (Array.isArray(a.images) ? a.images.find((u: string) => !isVideoUrl(u)) : null)) || null,
        }))
        .filter((x: any) => !!x.videoUrl)
        .sort((a: any, b: any) => {
          const ta = new Date(a.apt.createdAt || a.apt.created_at || 0).getTime() || 0;
          const tb = new Date(b.apt.createdAt || b.apt.created_at || 0).getTime() || 0;
          if (tb !== ta) return tb - ta;
          return (b.apt.id || 0) - (a.apt.id || 0);
        });

  setAllVideos(cand);
  // map backend PaginationMeta { page, limit, totalPages, total } to local shape with pageCount
      if (m) {
        const total = (m as any).total ?? 0;
        const limitVal = (m as any).limit ?? perPage;
        const pageCountVal = (m as any).totalPages ?? Math.max(1, Math.ceil(total / limitVal));
        setMeta({ total, page: (m as any).page ?? page, limit: limitVal, pageCount: pageCountVal });
      }
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          Short Video - Trải Nghiệm Phòng
        </h2>
        <p className="text-sm text-slate-600">Khám phá những video ngắn review căn hộ theo khu vực. Video sẽ được gắn vào chi tiết căn hộ.</p>
      </div>

      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto py-2">
          <button
            className={`px-4 py-2 rounded-full flex-shrink-0 transition ${activeSlug === null ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            onClick={() => setActiveSlug(null)}
          >
            Tất cả
          </button>
          {locations.map((l) => (
            <button
              key={l.id}
              className={`px-4 py-2 rounded-full flex-shrink-0 transition ${activeSlug === l.slug ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              onClick={() => setActiveSlug(l.slug)}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="text-center py-12">Đang tải...</div>}
      {err && <div className="text-red-600">{err}</div>}

      {!loading && !allVideos.length && (
        <div className="text-center py-12 text-slate-600">Không có video review cho khu vực này.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
    {allVideos.map((vItem: any) => {
          const a = vItem.apt;
          const v = vItem.videoUrl;
          const title = a.title || `${a.buildingName || ""} - ${a.roomCode || ""}`;
          const rawPoster = a.shortVideoThumb ?? a.short_thumb ?? (a.coverImageUrl || (Array.isArray(a.images) ? a.images.find((u: string) => !isVideoUrl(u)) : null) || '');
          const poster = asImageSrc(rawPoster) ?? '';
          const address = a.addressPath || a.locationName || '';
          const priceText = a?.rentPrice ? `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Math.round(a.rentPrice))} đ/tháng` : '';
          return (
            <div key={a.id} className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden">
              <button
                onClick={() => { setSelected({ videoUrl: asMediaSrc(v) ?? null, apt: a }); setOpen(true); }}
                className="relative w-full block text-left group"
              >
                <div className="relative w-full" style={{ paddingTop: '177.78%' }}>
                  {poster ? (
                      <img src={poster} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">No preview</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center transform transition duration-150 group-hover:scale-105">
                      <svg className="w-7 h-7 text-sky-600" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                  <div className="absolute left-3 bottom-3 bg-white/90 text-xs rounded px-2 py-1">{a.locationName}</div>
                </div>
              </button>
              <div className="p-3">
                <Link href={`/room/${a.slug || a.id}`} className="text-sm font-semibold block mb-1 text-slate-800 line-clamp-2">{title}</Link>
                {address ? <div className="text-xs text-slate-500 mb-2">{address}</div> : null}
                <div className="flex items-center justify-between">
                  <div className="text-orange-600 font-semibold">{priceText}</div>
                  <Link href={`/room/${a.slug || a.id}`} className="text-xs text-sky-600">Xem chi tiết</Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Pagination */}
      {meta && meta.pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
          <div className="text-sm text-slate-600">{page} / {meta.pageCount}</div>
          <button className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50" onClick={() => setPage(p => Math.min(meta.pageCount, p + 1))} disabled={page >= meta.pageCount}>Next</button>
        </div>
      )}
      {/* Modal player */}
      {open && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-3xl mx-4 bg-white rounded-lg overflow-hidden">
            <div className="relative" style={{ paddingTop: '56.25%' }}>
              {selected.videoUrl && (selected.videoUrl.includes('youtube.com') || selected.videoUrl.includes('youtu.be')) ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={selected.videoUrl.includes('youtube') ? selected.videoUrl.replace('watch?v=', 'embed/') : selected.videoUrl}
                  title={selected.apt.title}
                  allowFullScreen
                />
              ) : (
                <video className="absolute inset-0 w-full h-full object-contain bg-black" src={selected.videoUrl || undefined} controls autoPlay />
              )}
            </div>
            <div className="p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{selected.apt.title}</div>
                <div className="text-xs text-slate-500">{selected.apt.locationName}</div>
              </div>
              <div>
                <button className="px-3 py-1 bg-slate-100 rounded" onClick={() => setOpen(false)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
