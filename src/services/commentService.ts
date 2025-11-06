import axiosClient from "@/utils/axiosClient";
import { apiUrl } from "@/utils/apiUrl";

export interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  user?: { id: number; name?: string; avatarUrl?: string; phoneVerified?: boolean };
}

export type PaginatedComments = { items: CommentItem[]; total: number };

export const commentService = {
  async list(targetType: string, targetId: string | number, page = 1, limit = 6): Promise<PaginatedComments> {
    const path = apiUrl(`/api/comments/${encodeURIComponent(targetType)}/${encodeURIComponent(String(targetId))}`);
    const res = await axiosClient.get<PaginatedComments>(path, { params: { page, limit } as any });
    return (res as any) ?? { items: [], total: 0 };
  },

  async create(payload: { targetType: string; targetId: string | number; content: string }) {
    const path = apiUrl(`/api/comments`);
    const res = await axiosClient.post(path, payload);
    return res as any;
  },
};
 
