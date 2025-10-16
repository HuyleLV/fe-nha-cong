import { Apartment, ApartmentQuery, ApartmentForm } from "@/type/apartment";
import { ApiResponse, PaginationMeta } from "@/type/common";
import axiosClient from "@/utils/axiosClient";

/** Loại bỏ key có value undefined để query sạch sẽ */
const cleanParams = <T extends Record<string, any>>(p?: T): Partial<T> | undefined => {
  if (!p) return undefined;
  const out: Record<string, any> = {};
  Object.keys(p).forEach((k) => {
    const v = (p as any)[k];
    if (v !== undefined) out[k] = v;
  });
  return out as Partial<T>;
};

export const apartmentService = {
    /** List: API trả { items, meta } */
    async getAll(
        params?: ApartmentQuery
    ): Promise<{ items: Apartment[]; meta: PaginationMeta }> {
        const res = await axiosClient.get<{
            items: Apartment[];
            meta: PaginationMeta;
        }>("/api/apartments", {
            params: cleanParams(params),
            validateStatus: () => true,
        });

        if (res.status >= 400) {
        // cố gắng lấy message từ payload
            const msg =
                (res.data as any)?.message ||
                (res as any)?.data?.error ||
                `HTTP ${res.status}`;
            throw new Error(msg);
        }

        // ✅ khớp cấu trúc mới
        return {
            items: res.data?.items ?? [],
            meta: res.data?.meta ?? { total: 0, page: 1, limit: 10, pageCount: 1 },
        };
    },

    async getById(id: number | string): Promise<Apartment> {
        const res = await axiosClient.get<ApiResponse<Apartment> | Apartment>(
            `/api/apartments/${id}`,
            { validateStatus: () => true }
        );
        if (res.status !== 200) {
            const msg = (res.data as any)?.message ?? `HTTP ${res.status}`;
            throw new Error(msg);
        }
        // hỗ trợ cả 2 dạng: { data: entity } hoặc entity
        return (res.data as any)?.data ?? (res.data as Apartment);
    },

    async getBySlug(slug: string): Promise<Apartment> {
        const res = await axiosClient.get<ApiResponse<Apartment> | Apartment>(
            `/api/apartments/slug/${encodeURIComponent(slug)}`,
            { validateStatus: () => true }
        );
        if (res.status !== 200) {
            const msg = (res.data as any)?.message ?? `HTTP ${res.status}`;
            throw new Error(msg);
        }
        return (res.data as any)?.data ?? (res.data as Apartment);
    },

    async create(payload: ApartmentForm): Promise<Apartment> {
        const res = await axiosClient.post<ApiResponse<Apartment> | Apartment>(
            `/api/apartments`,
            payload,
            { validateStatus: () => true }
        );
        if (res.status !== 201 && res.status !== 200) {
            const msg = (res.data as any)?.message ?? `HTTP ${res.status}`;
            throw new Error(msg);
        }
        return (res.data as any)?.data ?? (res.data as Apartment);
    },

    async update(
        id: number | string,
        payload: Partial<ApartmentForm>
    ): Promise<Apartment> {
        const res = await axiosClient.put<ApiResponse<Apartment> | Apartment>(
            `/api/apartments/${id}`,
            payload,
            { validateStatus: () => true }
        );
        if (res.status !== 200) {
            const msg = (res.data as any)?.message ?? `HTTP ${res.status}`;
            throw new Error(msg);
        }
        return (res.data as any)?.data ?? (res.data as Apartment);
    },

    async delete(id: number | string): Promise<boolean> {
        const res = await axiosClient.delete<{ success?: boolean } | ApiResponse<null>>(
            `/api/apartments/${id}`,
            { validateStatus: () => true }
        );
        if (res.status !== 200 && res.status !== 204) {
            const msg = (res.data as any)?.message ?? `HTTP ${res.status}`;
            throw new Error(msg);
        }
        // BE hiện đang trả { success: true } → vẫn mặc định true nếu 204
        return (res.data as any)?.success ?? true;
    },
};
