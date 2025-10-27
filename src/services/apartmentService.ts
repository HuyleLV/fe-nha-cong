// src/services/apartment.service.ts
import { Apartment, ApartmentQuery, ApartmentForm } from "@/type/apartment";
import { ApiResponse, PaginationMeta } from "@/type/common";
import axiosClient from "@/utils/axiosClient";

/** Kiểu dữ liệu cho trang chủ (home-sections) */
export type ApiSectionHome = {
  district: { id: number; name: string; slug: string; level?: string };
  apartments: (Apartment & { favorited?: boolean; addressPath?: string | null })[];
};

export type HomeSectionsResponse = {
  city: { id: number; name: string; slug: string; level?: string };
  sections: ApiSectionHome[];
};

/** Loại bỏ key có value undefined để query sạch sẽ */
const cleanParams = <T extends Record<string, any>>(p?: T): Partial<T> | undefined => {
  if (!p) return undefined;
  const out: Record<string, any> = {};
  for (const k of Object.keys(p)) {
    const v = (p as any)[k];
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
};

export const apartmentService = {
  /** GET /api/apartments → { items, meta } */
  async getAll(params?: ApartmentQuery): Promise<{ items: Apartment[]; meta: PaginationMeta }> {
    try {
      const payload = await axiosClient.get<
        { items: Apartment[]; meta: PaginationMeta },
        { items: Apartment[]; meta: PaginationMeta }
      >(
        "/api/apartments",
        { params: cleanParams(params) }
      );

      return {
        items: payload?.items ?? [],
        meta: payload?.meta ?? { total: 0, page: 1, limit: 10, pageCount: 1 },
      };
    } catch (err: any) {
      throw new Error(err?.message || "Không thể tải danh sách căn hộ");
    }
  },

  async getHomeSections(params: {
    citySlug: string;
    limitPerDistrict?: number;
    signal?: AbortSignal;
  }): Promise<HomeSectionsResponse> {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";
    const url = `${base}/api/apartments/home-sections`;

    try {
      const payload = await axiosClient.get<HomeSectionsResponse, HomeSectionsResponse>(url, {
        params: {
          citySlug: params.citySlug,
          limitPerDistrict: params.limitPerDistrict ?? 4,
        },
        signal: params.signal,
      });

      return payload; 
    } catch (err: any) {
      throw new Error(err?.message || "Không thể tải dữ liệu home-sections");
    }
  },

  /** GET /api/apartments/:idOrSlug → hỗ trợ trả trực tiếp entity hoặc { data: entity } */
  async getById(idOrSlug: number | string): Promise<Apartment> {
    try {
      const payload = await axiosClient.get<any, any>(`/api/apartments/${encodeURIComponent(String(idOrSlug))}`);
      return (payload?.data ?? payload) as Apartment;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tải căn hộ";
      throw new Error(msg);
    }
  },

  /** Đồng nhất: gọi chung endpoint :idOrSlug cho slug */
  async getBySlug(slug: string): Promise<Apartment> {
    return this.getById(slug);
  },

  /** POST /api/apartments */
  async create(body: ApartmentForm): Promise<Apartment> {
    try {
      const payload = await axiosClient.post<any, any>(`/api/apartments`, body);
      return (payload?.data ?? payload) as Apartment;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tạo căn hộ";
      throw new Error(msg);
    }
  },

  async update(
    id: number | string,
    payload: Partial<ApartmentForm> & { imagesStrategy?: "merge" | "replace" }
  ): Promise<Apartment> {
    try {
      const response = await axiosClient.patch<any, any>(
        `/api/apartments/${encodeURIComponent(String(id))}`,
        payload
      );
      return (response?.data ?? response) as Apartment;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể cập nhật căn hộ";
      throw new Error(msg);
    }
  },

  /** PATCH /api/apartments/:id/video */
  async updateVideo(id: number | string, videoUrl?: string | null): Promise<{ message?: string; images?: string[] }> {
    try {
      const payload = await axiosClient.patch<any, any>(`/api/apartments/${encodeURIComponent(String(id))}/video`, { videoUrl });
      return (payload?.data ?? payload) as { message?: string; images?: string[] };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể cập nhật video";
      throw new Error(msg);
    }
  },

  /** DELETE /api/apartments/:id */
  async delete(id: number | string): Promise<boolean> {
    try {
      const payload = await axiosClient.delete<any, any>(
        `/api/apartments/${encodeURIComponent(String(id))}`
      );
      return (payload as any)?.success ?? true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể xoá căn hộ";
      throw new Error(msg);
    }
  },
};
