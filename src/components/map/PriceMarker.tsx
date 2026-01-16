import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapApartment } from "@/services/mapService";
import Link from 'next/link';
import Image from 'next/image';

interface PriceMarkerProps {
    item: MapApartment;
}

const toPrice = (p: string | number) => {
    const val = Number(p);
    if (!val) return 'Liên hệ';
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}tr`.replace('.0', '');
    return `${(val / 1000).toFixed(0)}k`;
}

export default function PriceMarker({ item }: PriceMarkerProps) {
    const priceText = toPrice(item.price);

    // Using a more structured HTML for the marker to ensure proper centered text and premium feel
    const iconHtml = `
        <div class="relative group cursor-pointer transition-transform duration-300 hover:scale-110 hover:z-[9999]" style="transform-origin: center bottom;">
            <div class="flex items-center justify-center bg-white text-emerald-800 font-bold text-[13px] px-3 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-emerald-100 transition-all hover:bg-emerald-600 hover:text-white hover:border-emerald-600 whitespace-nowrap">
                ${priceText}
            </div>
            <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-emerald-100 transition-colors group-hover:bg-emerald-600 group-hover:border-emerald-600"></div>
        </div>
    `;

    const icon = L.divIcon({
        html: iconHtml,
        className: '', // Empty to avoid default styles
        iconSize: [60, 40],
        iconAnchor: [30, 40], // Center bottom anchor
    });

    return (
        <Marker position={[item.lat, item.lng]} icon={icon}>
            <Popup closeButton={true} offset={[0, -32]}>
                <div className="font-sans">
                    {/* Image Cover */}
                    <div className="relative w-full h-36 bg-gray-100">
                        {item.thumb ? (
                            <Image
                                src={item.thumb}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="260px"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-xs flex-col gap-1">
                                <span className="text-2xl">🏠</span>
                                <span>No Image</span>
                            </div>
                        )}
                        <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                            {priceText}
                        </div>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                        <Link href={`/room/${item.slug}`} className="block font-bold text-gray-800 text-[15px] leading-tight hover:text-emerald-600 line-clamp-2 mb-2 transition-colors">
                            {item.title}
                        </Link>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                                <span>📐 {item.area} m²</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span>📍 {item.district ? item.district : 'Xem chi tiết'}</span>
                            </div>
                        </div>
                        <Link
                            href={`/room/${item.slug}`}
                            className="block w-full text-center py-2 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                            Xem chi tiết
                        </Link>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}
