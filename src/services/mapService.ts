import axiosClient from "@/utils/axiosClient";

export interface MapApartment {
    id: number;
    title: string;
    price: string;
    area: string;
    lat: number;
    lng: number;
    thumb?: string;
    slug: string;
    // added for interactions
    [key: string]: any;
}

export const mapService = {
    getApartmentsByBounds: async (n: number, s: number, e: number, w: number) => {
        const data = await axiosClient.get<MapApartment[]>("/apartments/map-search", {
            params: { n, s, e, w },
        });
        console.log("Map Data:", data);
        return Array.isArray(data) ? data : [];
    },
};
