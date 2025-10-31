// services/locationService.ts
import axiosClient from "@/utils/axiosClient";
import { apiUrl } from "@/utils/apiUrl";
import { PaginationMeta } from "@/type/common";
import { Location, LocationForm, LocationLevel } from "@/type/location";

function normalizeList<T = any>(payload: any, params?: { page?: number; limit?: number }) {
    const items: T[] = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
                ? payload
                : [];

    const meta: PaginationMeta = payload?.meta ?? {
        page: Number(params?.page ?? 1) || 1,
        limit: Number(params?.limit ?? (items.length || 10)) || 10,
        total: items.length,
        totalPages: 1,
    };

    return { items, meta } as { items: T[]; meta: PaginationMeta };
}

export const locationService = {
    async getAll(params?: { page?: number; limit?: number }): Promise<{ items: Location[]; meta: PaginationMeta }>
    {
        try {
            const payload = await axiosClient.get<any, any>(apiUrl("/api/locations"), { params });
            return normalizeList<Location>(payload, params);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Không thể tải danh sách khu vực";
            throw new Error(msg);
        }
    },

    async getById(id: number | string): Promise<Location> {
        try {
            const payload = await axiosClient.get<any, any>(apiUrl(`/api/locations/${encodeURIComponent(String(id))}`));
            return (payload?.data ?? payload) as Location;
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Không thể tải khu vực";
            throw new Error(msg);
        }
    },

    async getBySlug(slug: string): Promise<Location> {
        try {
            const payload = await axiosClient.get<any, any>(apiUrl(`/api/locations/slug/${encodeURIComponent(slug)}`));
            return (payload?.data ?? payload) as Location;
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Không thể tải khu vực";
            throw new Error(msg);
        }
    },

    async create(payload: LocationForm): Promise<Location> {
        try {
            const res = await axiosClient.post<any, any>(apiUrl(`/api/locations`), payload);
            return (res?.data ?? res) as Location;
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Không thể tạo khu vực";
            throw new Error(msg);
        }
    },

    async update(id: number | string, payload: Partial<LocationForm>): Promise<Location> {
        try {
            const res = await axiosClient.put<any, any>(apiUrl(`/api/locations/${encodeURIComponent(String(id))}`), payload);
            return (res?.data ?? res) as Location;
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Không thể cập nhật khu vực";
            throw new Error(msg);
        }
    },

    async delete(id: number | string): Promise<boolean> {
        try {
            await axiosClient.delete<any, any>(apiUrl(`/api/locations/${encodeURIComponent(String(id))}`));
            return true;
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Không thể xoá khu vực";
            throw new Error(msg);
        }
    },

    /** Lấy danh sách parent hợp lệ cho một level con (nếu BE có endpoint này) */
    async getParents(params: { levelBelow: LocationLevel; keyword?: string; page?: number; limit?: number }) {
        try {
            const payload = await axiosClient.get<any, any>(apiUrl(`/api/locations/parents`), { params });
            return normalizeList<Location>(payload, params);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Không thể tải danh sách parent";
            throw new Error(msg);
        }
    },

    /** Lấy cây khu vực (nếu BE có endpoint này) */
    async getTree<T = any>() {
        try {
            const payload = await axiosClient.get<any, any>(apiUrl(`/api/locations/tree`));
            return (payload?.data ?? payload) as T;
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Không thể tải cây khu vực";
            throw new Error(msg);
        }
    },
};
