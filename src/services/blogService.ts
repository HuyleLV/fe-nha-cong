import axiosClient from "@/utils/axiosClient";
import { apiUrl } from "@/utils/apiUrl";
import { Blog, BlogForm } from "@/type/blog";
import { PaginationMeta } from "@/type/common";

export const blogService = {

  async getAll(params?: { page?: number; limit?: number }): Promise<{ items: Blog[]; meta: PaginationMeta }>
  {
    try {
  const payload = await axiosClient.get<any, any>(apiUrl("/api/blog"), { params });

      const items: Blog[] = Array.isArray(payload?.items)
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
      const msg = err?.response?.data?.message || err?.message || "Không thể tải danh sách bài viết";
      throw new Error(msg);
    }
  },

  /** GET /api/blog/slug/:slug → entity or { data: entity } */
  async getBySlug(slug: string): Promise<Blog> {
    try {
  const payload = await axiosClient.get<any, any>(apiUrl(`/api/blog/slug/${encodeURIComponent(slug)}`));
      return (payload?.data ?? payload) as Blog;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tải bài viết";
      throw new Error(msg);
    }
  },

  /** GET /api/blog/:id → entity or { data: entity } */
  async getById(id: number | string): Promise<Blog> {
    try {
  const payload = await axiosClient.get<any, any>(apiUrl(`/api/blog/${encodeURIComponent(String(id))}`));
      return (payload?.data ?? payload) as Blog;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tải bài viết";
      throw new Error(msg);
    }
  },

  /** POST /api/blog */
  async create(body: BlogForm): Promise<Blog> {
    try {
  const payload = await axiosClient.post<any, any>(apiUrl(`/api/blog`), body);
      return (payload?.data ?? payload) as Blog;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tạo bài viết";
      throw new Error(msg);
    }
  },

  /** PUT /api/blog/:id */
  async update(id: number | string, body: BlogForm): Promise<Blog> {
    try {
  const payload = await axiosClient.put<any, any>(apiUrl(`/api/blog/${encodeURIComponent(String(id))}`), body);
      return (payload?.data ?? payload) as Blog;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể cập nhật bài viết";
      throw new Error(msg);
    }
  },

  /** DELETE /api/blog/:id */
  async delete(id: number | string): Promise<boolean> {
    try {
  await axiosClient.delete<any, any>(apiUrl(`/api/blog/${encodeURIComponent(String(id))}`));
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể xóa bài viết";
      throw new Error(msg);
    }
  },
};