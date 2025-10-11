// components/RoomCardItem.tsx
"use client";

import Link from "next/link";
import { Heart, MapPin, BedDouble, Bath } from "lucide-react";
import clsx from "clsx";
import { formatMoneyVND } from "@/utils/format-number";
import { Apartment } from "@/type/apartment";

type Props = {
  item: Apartment;
  /** trạng thái yêu thích nằm ngoài schema Apartment */
  isFav?: boolean;
  onToggleFav?: (id: Apartment["id"]) => void;
  onBook?: (apt: Apartment) => void;
};

const withBase = (u?: string | null) => {
  if (!u) return "";
  if (u.startsWith("http") || u.startsWith("data:")) return u;
  return `${process.env.NEXT_PUBLIC_API_URL || ""}${u}`;
};

const toNumber = (v?: string | null) => {
  if (!v) return 0;
  const n = parseFloat(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export default function RoomCardItem({ item, isFav, onToggleFav, onBook }: Props) {
  const price = toNumber(item.rentPrice);
  const area = item.areaM2 ? toNumber(item.areaM2) : undefined;
  const beds = item.bedrooms;
  const baths = item.bathrooms;
  const imageUrl = withBase(item.coverImageUrl || "");
  const address =
    item.addressPath || item.streetAddress || item.location?.name || "";
  const detailHref = item.slug ? `/room/${item.slug}` : "#";

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Ảnh (click mở chi tiết) */}
      <div className="relative">
        <Link href={detailHref} aria-label={`Xem chi tiết ${item.title}`}>
          <img
            src={imageUrl}
            alt={item.title}
            className="aspect-[4/3] h-auto w-full object-cover"
          />
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav?.(item.id);
          }}
          className={clsx(
            "absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md",
            "hover:bg-white shadow"
          )}
          aria-label="Yêu thích"
        >
          <Heart
            className={clsx(
              "h-5 w-5",
              isFav ? "fill-rose-500 text-rose-500" : "text-emerald-700"
            )}
          />
        </button>
      </div>

      {/* Nội dung */}
      <div className="p-3 md:p-4">
        <h3 className="line-clamp-2 font-semibold text-slate-800">
          <Link href={detailHref} className="hover:underline">
            {item.title}
          </Link>
        </h3>

        <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{address}</span>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          {typeof area === "number" && area > 0 && <span>{area} m²</span>}
          {typeof beds === "number" && beds >= 0 && (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-4 w-4" /> {beds}
            </span>
          )}
          {typeof baths === "number" && baths >= 0 && (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-4 w-4" /> {baths}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="font-extrabold text-emerald-700">
            {formatMoneyVND(price)}
          </div>
          <button
            onClick={() => onBook?.(item)}
            className="rounded-full border border-emerald-600 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            ĐẶT PHÒNG
          </button>
        </div>
      </div>
    </article>
  );
}