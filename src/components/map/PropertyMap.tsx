"use client";

import { useEffect, useState, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapApartment, mapService } from "@/services/mapService";
import PriceMarker from "./PriceMarker";
import "leaflet/dist/leaflet.css";

import { Search, Loader2 } from "lucide-react";

// Fix Leaflet Default Icon issue in Next.js
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [21.0285, 105.8542];

export interface PropertyMapHandle {
    flyTo: (lat: number, lng: number, zoom?: number) => void;
}

interface PropertyMapProps {
    initialCenter?: [number, number]; // [lat, lng]
    onItemsChange?: (items: MapApartment[]) => void;
}

// Helper to access map instance
function MapController({
    onBoundsChange,
    onMapReady,
}: {
    onBoundsChange: (b: L.LatLngBounds) => void,
    onMapReady: (map: L.Map) => void
}) {
    const map = useMapEvents({
        moveend: () => {
            onBoundsChange(map.getBounds());
        },
        zoomend: () => {
            onBoundsChange(map.getBounds());
        }
    });

    useEffect(() => {
        onMapReady(map);
    }, [map, onMapReady]);

    return null;
}

const PropertyMap = forwardRef<PropertyMapHandle, PropertyMapProps>(({
    initialCenter = DEFAULT_CENTER,
    onItemsChange
}, ref) => {
    const [items, setItems] = useState<MapApartment[]>([]);
    const [loading, setLoading] = useState(false);
    const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
    const [searchAsMove, setSearchAsMove] = useState(true);

    // Map instance ref
    const mapRef = useRef<L.Map | null>(null);

    // Debounce refetch
    const timerRef = useRef<NodeJS.Timeout>(null);

    // Expose flyTo to parent
    useImperativeHandle(ref, () => ({
        flyTo: (lat: number, lng: number, zoom = 16) => {
            if (mapRef.current) {
                mapRef.current.flyTo([lat, lng], zoom, { duration: 1.5 });
            }
        }
    }));

    const fetchApartments = useCallback(async (b: L.LatLngBounds) => {
        try {
            setLoading(true);
            const n = b.getNorth();
            const s = b.getSouth();
            const e = b.getEast();
            const w = b.getWest();

            const data = await mapService.getApartmentsByBounds(n, s, e, w);
            // Ensure array
            const safeData = Array.isArray(data) ? data : [];
            setItems(safeData);
            // Notify parent
            if (onItemsChange) {
                onItemsChange(safeData);
            }
        } catch (err) {
            console.error("Map fetch error:", err);
            setItems([]);
            if (onItemsChange) onItemsChange([]);
        } finally {
            setLoading(false);
        }
    }, [onItemsChange]);

    const handleBoundsChange = useCallback((b: L.LatLngBounds) => {
        setBounds(b);
        if (!searchAsMove) return;

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            fetchApartments(b);
        }, 500);
    }, [searchAsMove, fetchApartments]);

    // Track if we have already attempted to locate the user to prevent annoying auto-zooms
    const hasLocatedUser = useRef(false);

    // === Geolocation & Initial Load Logic ===
    useEffect(() => {
        // If we already located the user (or tried), don't do it again even if component re-renders
        if (hasLocatedUser.current) return;

        // Did we already have a focused location from URL?
        // If initialCenter is passed and different from default, we trust parent (e.g. from locationSlug)
        const isDefault = initialCenter[0] === DEFAULT_CENTER[0] && initialCenter[1] === DEFAULT_CENTER[1];

        if (!isDefault) {
            // Parent provided a specific location we should respect.
            // We mark as "located" so we don't override it with Geo later.
            hasLocatedUser.current = true;
            return;
        }

        // Mark as running so we don't run again
        hasLocatedUser.current = true;

        // Try to get user location
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // Fly to user location
                    if (mapRef.current) {
                        mapRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });
                    }
                },
                (error) => {
                    console.warn("Geolocation access denied or failed, using fallback.", error);
                    // Fallback: manually fetch default bounds if needed.
                    if (mapRef.current) {
                        fetchApartments(mapRef.current.getBounds());
                    }
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            // No Geo support - just fetch default bounds
            if (mapRef.current) {
                fetchApartments(mapRef.current.getBounds());
            }
        }
    }, [initialCenter, fetchApartments]);

    // Initial Manual Fetch Effect (to ensure list is populated if no move event fires instantly)
    // We listen to mapRef.current availability
    useEffect(() => {
        if (mapRef.current && !items.length && !loading && !hasLocatedUser.current) {
            // Redundant safeguard: fetch if idle
            // Note: The geo effect above sets hasLocatedUser.current = true immediately.
            // So this block likely won't run if geo effect runs first, which is fine.
            // But if geo effect failed to fetch for some reason, we might want this?
            // Actually, if geo effect ran, it handles fetching.
            // The original purpose was just to ensure STARTING content.
            // Let's rely on geo effect for the initial kick.
        }
    }, [mapRef.current, items.length, loading, hasLocatedUser]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleMapReady = useCallback((m: L.Map) => {
        mapRef.current = m;
    }, []);

    return (
        <div className="relative w-full h-full z-0">
            <MapContainer
                center={initialCenter}
                zoom={13}
                scrollWheelZoom={true}
                className="w-full h-full"
                style={{ minHeight: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController
                    onBoundsChange={handleBoundsChange}
                    onMapReady={handleMapReady}
                />

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={(cluster: any) => {
                        return L.divIcon({
                            html: `<span>${cluster.getChildCount()}</span>`,
                            className: 'cluster-custom-icon',
                            iconSize: L.point(40, 40, true),
                        });
                    }}
                >
                    {items.map((item) => (
                        <PriceMarker key={item.id} item={item} />
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            {/* Loading Indicator */}
            {loading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg text-sm font-semibold text-emerald-700 flex items-center gap-2 border border-emerald-100/50">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tìm phòng...
                </div>
            )}

            {/* 'Search as I move' Toggle */}
            {!searchAsMove && bounds && (
                <button
                    onClick={() => { setSearchAsMove(true); fetchApartments(bounds); }}
                    className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-white text-emerald-700 px-4 py-2 rounded-full shadow-xl text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 border border-emerald-100"
                >
                    <Search className="w-4 h-4" />
                    Tìm tại khu vực này
                </button>
            )}
        </div>
    );
});

PropertyMap.displayName = "PropertyMap";
export default PropertyMap;
