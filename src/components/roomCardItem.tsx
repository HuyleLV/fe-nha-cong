// components/RoomCardItem.tsx
"use client";
import { Heart, MapPin, BedDouble, Bath } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

export type RoomCard = {
  id: string | number;
  title: string;
  price: number;
  district: string;
  address?: string;
  area?: number;
  beds?: number;
  baths?: number;
  image: string;
  isFav?: boolean;
};

type Props = {
  item: RoomCard;
  onToggleFav?: (id: RoomCard["id"]) => void;
  onBook?: (room: RoomCard) => void;
};

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + " đ";
}

export default function RoomCardItem({ item, onToggleFav, onBook }: Props) {
  return (
    <article className="group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Ảnh */}
      <div className="relative">
        <img src={item.image} alt={item.title} className="object-cover" />
        <button
          onClick={() => onToggleFav?.(item.id)}
          className={clsx(
            "absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md",
            "hover:bg-white shadow"
          )}
        >
          <Heart
            className={clsx(
              "h-5 w-5",
              item.isFav ? "fill-rose-500 text-rose-500" : "text-emerald-700"
            )}
          />
        </button>
      </div>

      {/* Nội dung */}
      <div className="p-3 md:p-4">
        <h3 className="line-clamp-2 font-semibold text-slate-800">
          {item.title}
        </h3>

        <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          <span className="truncate">
            {item.address ?? `${item.district}, Hà Nội`}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          {typeof item.area === "number" && <span>{item.area} m²</span>}
          {typeof item.beds === "number" && (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-4 w-4" /> {item.beds}
            </span>
          )}
          {typeof item.baths === "number" && (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-4 w-4" /> {item.baths}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="font-extrabold text-emerald-700">
            {formatVND(item.price)}
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
