import axiosClient from "@/utils/axiosClient";
import { Blog, BlogForm } from "@/type/blog";
import { PaginationMeta, ApiResponse, PaginatedResponse } from "@/type/common";

export const blogService = {
    async getAll(params?: { page?: number; limit?: number }): Promise<{ items: Blog[]; meta: PaginationMeta }> {
      const res = await axiosClient.get<PaginatedResponse<Blog>>("/api/blog", {
          params, validateStatus: () => true,
      });
      if (res.status !== 200) throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);

      return { items: res.data.data, meta: res.data.meta }; // ✅ dùng items
    },

    async getBySlug(slug: string): Promise<Blog> {
      const res = await axiosClient.get<ApiResponse<Blog>>(`/api/blog/slug/${slug}`, {
        validateStatus: () => true,
      });
      if (res.status >= 400) {
        throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
      }
      return (res.data as any).data ?? (res.data as unknown as Blog);
    },

    async getById(id: number | string): Promise<Blog> {
      const res = await axiosClient.get<ApiResponse<Blog>>(`/api/blog/${id}`, {
        validateStatus: () => true,
      });
      if (res.status !== 200) {
        throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
      }
      return (res.data as any).data ?? (res.data as unknown as Blog);
    },
    
    async create(payload: BlogForm): Promise<Blog> {
      const res = await axiosClient.post<ApiResponse<Blog>>(`/api/blog`, payload, {
        validateStatus: () => true,
      });
      if (res.status !== 201 && res.status !== 200) {
        throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
      }
      return (res.data as any).data ?? (res.data as unknown as Blog);
    },
  
    async update(id: number | string, payload: BlogForm): Promise<Blog> {
      const res = await axiosClient.put<ApiResponse<Blog>>(`/api/blog/${id}`, payload, {
        validateStatus: () => true,
      });
      if (res.status !== 200) {
        throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
      }
      return (res.data as any).data ?? (res.data as unknown as Blog);
    },
  
    async delete(id: number | string): Promise<boolean> {
      const res = await axiosClient.delete<ApiResponse<null>>(`/api/blog/${id}`, {
        validateStatus: () => true,
      });
      if (res.status !== 200 && res.status !== 204) {
        throw new Error((res.data as any)?.message ?? `HTTP ${res.status}`);
      }
      return true;
    },
};