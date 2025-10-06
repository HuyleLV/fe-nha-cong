import { Apartment, ApartmentQuery, ApartmentForm } from "@/type/apartment";
import { ApiResponse, PaginatedResponse, PaginationMeta } from "@/type/common";
import axiosClient from "@/utils/axiosClient";

export const apartmentService = {
    async getAll(params?: ApartmentQuery): Promise<{ items: Apartment[]; meta: PaginationMeta }> {
        const res = await axiosClient.get<PaginatedResponse<Apartment>>("/api/apartments", {
            params,
            validateStatus: () => true,
        });
        if (res.status !== 200) throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
        return { items: res.data.data, meta: res.data.meta };
    },
    
    
    async getById(id: number | string): Promise<Apartment> {
        const res = await axiosClient.get<ApiResponse<Apartment>>(`/api/apartments/${id}`, {
            validateStatus: () => true,
        });
        if (res.status !== 200) throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
        return (res.data as any).data ?? (res.data as unknown as Apartment);
    },
    
    
    async getBySlug(slug: string): Promise<Apartment> {
        const res = await axiosClient.get<ApiResponse<Apartment>>(`/api/apartments/slug/${encodeURIComponent(slug)}`, {
            validateStatus: () => true,
        });
        if (res.status !== 200) throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
        return (res.data as any).data ?? (res.data as unknown as Apartment);
    },
    
    
    async create(payload: ApartmentForm): Promise<Apartment> {
        const res = await axiosClient.post<ApiResponse<Apartment>>(`/api/apartments`, payload, {
            validateStatus: () => true,
        });
        if (res.status !== 201 && res.status !== 200) throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
        return (res.data as any).data ?? (res.data as unknown as Apartment);
    },
    
    
    async update(id: number | string, payload: Partial<ApartmentForm>): Promise<Apartment> {
        const res = await axiosClient.put<ApiResponse<Apartment>>(`/api/apartments/${id}`, payload, {
            validateStatus: () => true,
        });
        if (res.status !== 200) throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
        return (res.data as any).data ?? (res.data as unknown as Apartment);
    },
    
    
    async delete(id: number | string): Promise<boolean> {
        const res = await axiosClient.delete<ApiResponse<null>>(`/api/apartments/${id}`, {
            validateStatus: () => true,
        });
        if (res.status !== 200 && res.status !== 204) throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
        return true;
    },
};