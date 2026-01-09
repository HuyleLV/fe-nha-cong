"use client";
import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ConfirmModal';
import AdminTable from "@/components/AdminTable";
import { apartmentService } from "@/services/apartmentService";
import { buildingService } from '@/services/buildingService';
import Link from "next/link";
import { PlusCircle } from 'lucide-react';

const isVideoUrl = (u?: string | null) => {
  if (!u) return false;
  const s = String(u).toLowerCase();
  return s.includes('/static/videos/') || s.endsWith('.mp4') || s.endsWith('.webm') || s.includes('youtube.com') || s.includes('youtu.be') || s.includes('vimeo.com');
};

const findShortVideo = (a: any) => {
  if (!a) return null;
  if (a.shortVideoUrl) return a.shortVideoUrl;
  if (a.shortVideo) return a.shortVideo;
  if (Array.isArray(a.shortVideos) && a.shortVideos.length) return a.shortVideos[0];
  if (a.videoUrl) return a.videoUrl;
  const imgs = Array.isArray(a.images) ? a.images : [];
  return imgs.find((u: string) => isVideoUrl(u)) || null;
};

export default function AdminShortReviewPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const resp = await apartmentService.getAll({ page: 1, limit: 100 });
      const rawArr = (resp.items || []);
      const arr = rawArr.map((a: any) => ({
        id: a.id,
        title: a.title,
        buildingName: a.buildingName ?? a.building?.name ?? a.building?.title ?? null,
        apartmentTitle: a.title ?? (a.roomCode ?? null),
        roomCode: a.roomCode ?? null,
        price: a.rentPrice,
        // prefer explicit thumbnail field if backend provides it
        shortVideoThumb: a.shortVideoThumb ?? a.short_thumb ?? null,
        shortVideoUrl: a.shortVideoUrl ?? findShortVideo(a) ?? null,
        raw: a,
      })).filter((x: any) => !!x.shortVideoUrl || !!x.shortVideoThumb);

      // If buildingName is missing, try to fetch building info by buildingId
      const missingBuildingIds = Array.from(new Set(arr.filter(it => !it.buildingName && (it.raw?.buildingId || it.raw?.building_id)).map(it => it.raw?.buildingId ?? it.raw?.building_id)));
      if (missingBuildingIds.length) {
        const bMap = new Map<number, any>();
        await Promise.all(missingBuildingIds.map(async (bid: number) => {
          try {
            const b = await buildingService.getById(bid);
            if (b) bMap.set(Number(bid), b);
          } catch (e) {
            // ignore fetch errors for specific buildings
          }
        }));
        const updated = arr.map((it: any) => {
          if (!it.buildingName) {
            const bid = it.raw?.buildingId ?? it.raw?.building_id;
            const b = bid ? bMap.get(Number(bid)) : null;
            if (b) it.buildingName = b.name ?? b.title ?? null;
          }
          return it;
        });
        setItems(updated);
      } else {
        setItems(arr);
      }
    } catch (e) {
      console.error(e);
      toast.error('Không tải được danh sách short review');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  return (
    <div className="mx-auto max-w-screen-2xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Quản lý Short Review</h2>
          <p className="text-sm text-slate-500 mt-1">Danh sách các bài short-review gắn với căn hộ.</p>
        </div>
        <div>
          <Link href="/admin/short-review/create" aria-label="Thêm short review" className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
            <PlusCircle className="w-5 h-5" />
          </Link>
        </div>
      </div>

  <AdminTable headers={["ID", "Tòa nhà", "Căn hộ", "Tiêu đề", "Thumbnail", "Short Video", "Hành động"]} loading={loading}>
        {items.map((it) => (
          <tr key={it.id}>
            <td className="px-4 py-3">{it.id}</td>
            <td className="px-4 py-3 text-left">{it.buildingName ?? (it.raw?.buildingName ?? '-')}</td>
            <td className="px-4 py-3 text-left">{it.apartmentTitle ?? it.roomCode ?? (`#${it.id}`)}</td>
            <td className="px-4 py-3 text-left">{it.title}</td>
            <td className="px-4 py-3">
              {it.shortVideoThumb ? (
                <div style={{ width: 84 }}>
                  <div className="relative" style={{ paddingTop: '177.78%' }}>
                    <img src={(it.shortVideoThumb && String(it.shortVideoThumb).startsWith('http')) ? it.shortVideoThumb : `${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '')}/${String(it.shortVideoThumb || '').replace(/^\/+/, '')}`}
                      alt={`thumb-${it.id}`} className="absolute inset-0 w-full h-full object-cover rounded" />
                  </div>
                </div>
              ) : (
                <div style={{ width: 84 }} className="h-48 bg-slate-50 flex items-center justify-center rounded text-xs text-slate-500">Chưa có</div>
              )}
            </td>
            <td className="px-4 py-3">
              {it.shortVideoUrl ? (
                <video
                  src={(it.shortVideoUrl && String(it.shortVideoUrl).startsWith('http')) ? it.shortVideoUrl : `${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '')}/${String(it.shortVideoUrl || '').replace(/^\/+/, '')}`}
                  controls playsInline className="w-40 h-28 object-cover rounded"
                  poster={(it.shortVideoThumb && String(it.shortVideoThumb).startsWith('http')) ? it.shortVideoThumb : (it.shortVideoThumb ? `${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '')}/${String(it.shortVideoThumb || '').replace(/^\/+/, '')}` : undefined)}
                />
              ) : (
                <span className="text-xs text-slate-400">Chưa có</span>
              )}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Link href={`/admin/short-review/${it.id}`} title="Sửa" className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => { setTargetId(it.id); setConfirmOpen(true); }}
                  title="Xóa"
                  className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
      <ConfirmModal
        open={confirmOpen}
        title="Xác nhận xoá"
        message="Bạn có chắc muốn xoá short review này? Hành động không thể hoàn tác."
        onCancel={() => { setConfirmOpen(false); setTargetId(null); }}
        onConfirm={async () => {
          if (!targetId) return;
          try {
            // Instead of deleting the apartment, clear short fields to 'remove' the short review
            await apartmentService.update(targetId, { shortVideoUrl: null, shortVideoThumb: null } as any);
            toast.success('Xoá short review thành công');
            setConfirmOpen(false);
            setTargetId(null);
            fetchItems();
          } catch (e) {
            console.error(e);
            toast.error('Xoá thất bại');
          }
        }}
      />
    </div>
  );
}
