"use client";

import Link from "next/link";
import Image from "next/image";
import { MapApartment } from "@/services/mapService";

function toPrice(p: string | number) {
    const val = Number(p);
    if (!val) return 'Liên hệ';
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)} triệu`.replace('.0', '');
    return `${(val / 1000).toFixed(0)}k`;
}

interface MapRoomItemProps {
    item: MapApartment;
    onClick: () => void;
    isActive?: boolean;
}

export default function MapRoomItem({ item, onClick, isActive }: MapRoomItemProps) {
    return (
        <div
            onClick={onClick}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md ${isActive ? 'bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
        >
            {/* Thumb */}
            <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {item.thumb ? (
                    <Image
                        src={item.thumb}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">No Image</div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-tight mb-1">
                    {item.title}
                </h3>
                <div className="text-emerald-700 font-bold text-sm mb-1">
                    {toPrice(item.price)} <span className="text-gray-400 font-normal text-xs">/ tháng</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mb-2">
                    <span>{item.area} m²</span>
                    {item.district && (
                        <>
                            <span>•</span>
                            <span className="truncate">{item.district}</span>
                        </>
                    )}
                </div>
                <Link
                    href={`/room/${item.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition"
                >
                    Xem chi tiết
                </Link>
            </div>
        </div>
    );
}
