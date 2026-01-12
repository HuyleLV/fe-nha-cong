import axiosClient from "@/utils/axiosClient";
import { apiUrl } from "@/utils/apiUrl";
import { News, NewsForm } from "@/type/news";
import { PaginationMeta } from "@/type/common";

export const newsService = {

  async getAll(params?: { page?: number; limit?: number }): Promise<{ items: News[]; meta: PaginationMeta }>
  {
    try {
      const payload = await axiosClient.get<any, any>(apiUrl("/api/news"), { params });

      const items: News[] = Array.isArray(payload?.items)
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

      return { items, meta };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tải danh sách tin tức";
      throw new Error(msg);
    }
  },

  async getBySlug(slug: string): Promise<News> {
    try {
      const payload = await axiosClient.get<any, any>(apiUrl(`/api/news/slug/${encodeURIComponent(slug)}`));
      return (payload?.data ?? payload) as News;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tải tin";
      throw new Error(msg);
    }
  },

  async getById(id: number | string): Promise<News> {
    try {
      const payload = await axiosClient.get<any, any>(apiUrl(`/api/news/${encodeURIComponent(String(id))}`));
      return (payload?.data ?? payload) as News;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tải tin";
      throw new Error(msg);
    }
  },

  async create(body: NewsForm): Promise<News> {
    try {
      const payload = await axiosClient.post<any, any>(apiUrl(`/api/news`), body);
      return (payload?.data ?? payload) as News;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tạo tin";
      throw new Error(msg);
    }
  },

  async update(id: number | string, body: NewsForm): Promise<News> {
    try {
      const payload = await axiosClient.put<any, any>(apiUrl(`/api/news/${encodeURIComponent(String(id))}`), body);
      return (payload?.data ?? payload) as News;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể cập nhật tin";
      throw new Error(msg);
    }
  },

  async delete(id: number | string): Promise<boolean> {
    try {
      await axiosClient.delete<any, any>(apiUrl(`/api/news/${encodeURIComponent(String(id))}`));
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể xóa tin";
      throw new Error(msg);
    }
  },
};
