"use client";

import React from "react";
import Link from "next/link";
import { BedDouble, Bath, Sofa, Tag, Check, ExternalLink, Pencil, MapPin } from "lucide-react";
import type { Apartment } from "@/type/apartment";
import { formatMoneyVND } from "@/utils/format-number";

interface AdminRoomCardProps {
  apartment: Apartment;
  apiBase?: string; // allow override for image prefix if needed
}

// Helper: compute discount + final price
function computePrice(apartment: Apartment) {
  const rawPrice = Number(String((apartment as any).rentPrice || 0).replace(/,/g, "")) || 0;
  const discountPercent = (apartment as any).discountPercent || 0;
  const discountAmount = Number(String((apartment as any).discountAmount || 0).replace(/,/g, "")) || 0;
  const fromPercent = discountPercent > 0 ? Math.round(rawPrice * discountPercent / 100) : 0;
  const chosen = Math.max(fromPercent, discountAmount);
  const finalPrice = chosen > 0 ? Math.max(0, rawPrice - chosen) : rawPrice;
  return { rawPrice, finalPrice, chosen, isPercent: chosen === fromPercent && fromPercent > 0, discountPercent };
}

// Small status badge styling map
const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  draft: "bg-amber-50 text-amber-700 ring-amber-200",
  archived: "bg-slate-100 text-slate-600 ring-slate-200"
};

export const AdminRoomCard: React.FC<AdminRoomCardProps> = ({ apartment, apiBase }) => {
  const { rawPrice, finalPrice, chosen, isPercent, discountPercent } = computePrice(apartment);
  const cover = (apartment as any).coverImageUrl || (apartment as any).images?.[0];
  const img = cover ? `${apiBase || process.env.NEXT_PUBLIC_API_URL || ""}${cover}` : undefined;
  const status = apartment.status || "draft";

  return (
  <div className="group relative flex flex-col w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm box-border transition hover:shadow-md">
      {/* Thumbnail (vertical layout) */}
  <div className="relative w-full h-40 md:h-44 overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={apartment.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.05]" />
        ) : (
          <div className="h-full w-full grid place-items-center text-[11px] text-slate-400 bg-slate-50">Không ảnh</div>
        )}
        {chosen > 0 && (
          <div className="absolute left-1 top-1 z-10 inline-flex items-center gap-0.5 rounded bg-rose-600/90 px-1.5 py-[2px] text-[10px] font-semibold text-white shadow-sm">
            <Tag className="w-3 h-3" />{isPercent ? `-${discountPercent}%` : `-${formatMoneyVND(chosen).replace(/\s*₫/, "").replace(/\s+/g, "")}đ`}
          </div>
        )}
        {/* Verified tick moved to badges row */}
      </div>
      {/* Content */}
  <div className="flex flex-1 flex-col p-3 min-w-0">
        {/* Top badges row */}
        <div className="flex flex-wrap items-center gap-1 text-[10px] mb-1 leading-tight">
          {(apartment as any).roomCode && (
            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 text-emerald-700 px-1.5 py-[2px] ring-1 ring-emerald-200">Mã {(apartment as any).roomCode}</span>
          )}
          {typeof (apartment as any).floorNumber === 'number' && (apartment as any).floorNumber > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded bg-sky-50 text-sky-700 px-1.5 py-[2px] ring-1 ring-sky-200">Tầng {(apartment as any).floorNumber}</span>
          )}
          <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-[2px] ring-1 font-medium ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
            {status === 'published' ? 'Cho thuê' : status === 'draft' ? 'Nháp' : 'Lưu trữ'}
          </span>
          {(apartment as any).isVerified && (
            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-600/10 text-emerald-700 px-1.5 py-[2px] ring-1 ring-emerald-300" title="Đã xác minh">
              <Check className="w-3 h-3" /> Xác minh
            </span>
          )}
        </div>
        {/* Title */}
        <div className="min-w-0">
          <div className="line-clamp-2 text-sm font-semibold text-emerald-900 leading-snug">{apartment.title}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-700/90 max-w-full">
            <MapPin className="h-3 w-3 flex-shrink-0" /> <span className="truncate max-w-full">{(apartment as any).streetAddress || ''}</span>
          </div>
        </div>
        {/* Price */}
        <div className="mt-2 flex items-end gap-2">
          {chosen > 0 && <div className="text-[11px] line-through text-slate-400">{formatMoneyVND(rawPrice)}</div>}
          <div className="text-lg font-bold text-emerald-700 leading-tight">{formatMoneyVND(finalPrice)}</div>
        </div>
        {/* Divider */}
        <div className="mt-2 border-t border-slate-100" />
        {/* Actions */}
        <div className="mt-2 flex items-center justify-end gap-1">
          <Link href={`/admin/apartment/${apartment.id}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] hover:bg-amber-600">
            <Pencil className="w-3 h-3" /> Sửa
          </Link>
          {(apartment as any).slug && (
            <Link href={`/room/${(apartment as any).slug}`} target="_blank" className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 text-slate-700 text-[10px] hover:bg-slate-50">
              <ExternalLink className="w-3 h-3" /> Xem
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRoomCard;
