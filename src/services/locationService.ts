// services/locationService.ts
import axiosClient from "@/utils/axiosClient";
import { PaginationMeta, ApiResponse, PaginatedResponse } from "@/type/common";
import { Location, LocationForm, LocationLevel } from "@/type/location";

export const locationService = {
    async getAll(params?: { page?: number; limit?: number }): Promise<{ items: Location[]; meta: PaginationMeta }> {
        const res = await axiosClient.get<PaginatedResponse<Location>>("/api/locations", {
            params,
            validateStatus: () => true,
        });
        if (res.status !== 200) {
            throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
        }
        return { items: res.data.data, meta: res.data.meta };
    },

    async getById(id: number | string): Promise<Location> {
        const res = await axiosClient.get<ApiResponse<Location>>(`/api/locations/${id}`, {
            validateStatus: () => true,
        });
        if (res.status !== 200) {
            throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
        }
        return (res.data as any).data ?? (res.data as unknown as Location);
    },

    async getBySlug(slug: string): Promise<Location> {
        const res = await axiosClient.get<ApiResponse<Location>>(
            `/api/locations/slug/${encodeURIComponent(slug)}`,
            { validateStatus: () => true }
        );
        if (res.status !== 200) {
            throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
        }
        return (res.data as any).data ?? (res.data as unknown as Location);
    },

    async create(payload: LocationForm): Promise<Location> {
        const res = await axiosClient.post<ApiResponse<Location>>(`/api/locations`, payload, {
            validateStatus: () => true,
        });
        if (res.status !== 201 && res.status !== 200) {
            throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
        }
        return (res.data as any).data ?? (res.data as unknown as Location);
    },

    async update(id: number | string, payload: Partial<LocationForm>): Promise<Location> {
        const res = await axiosClient.put<ApiResponse<Location>>(`/api/locations/${id}`, payload, {
            validateStatus: () => true,
        });
        if (res.status !== 200) {
            throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
        }
        return (res.data as any).data ?? (res.data as unknown as Location);
    },

    async delete(id: number | string): Promise<boolean> {
        const res = await axiosClient.delete<ApiResponse<null>>(`/api/locations/${id}`, {
            validateStatus: () => true,
        });
        if (res.status !== 200 && res.status !== 204) {
            throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
        }
        return true;
    },

    /** Lấy danh sách parent hợp lệ cho một level con (nếu BE có endpoint này) */
    async getParents(params: { levelBelow: LocationLevel; keyword?: string; page?: number; limit?: number }) {
        const res = await axiosClient.get<PaginatedResponse<Location>>(`/api/locations/parents`, {
        params,
        validateStatus: () => true,
        });
        if (res.status !== 200) {
        throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
        }
        return { items: res.data.data, meta: res.data.meta };
    },

    /** Lấy cây khu vực (nếu BE có endpoint này) */
    async getTree<T = any>() {
        const res = await axiosClient.get<ApiResponse<T>>(`/api/locations/tree`, {
        validateStatus: () => true,
        });
        if (res.status !== 200) {
        throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
        }
        return (res.data as any).data ?? (res.data as unknown as T);
    },
};
