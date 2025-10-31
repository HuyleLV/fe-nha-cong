// services/favoriteService.ts
import axiosClient from "@/utils/axiosClient";
import { apiUrl } from "@/utils/apiUrl";
import { FavoriteItem } from "@/type/favorite";
import { PaginationMeta } from "@/type/common";

export interface CreateFavoriteRequest {
  apartmentId: number;
}

export interface ToggleFavoriteResponse {
  favorited: boolean;
}

export interface RemoveFavoriteResponse {
  success: boolean;
}

export interface IsFavoritedResponse {
  favorited: boolean;
}

export const favoriteService = {
    async getMyFavorites(page: number = 1, limit: number = 12): Promise<{ items: FavoriteItem[]; meta: PaginationMeta }> {
        try {
            const payload = await axiosClient.get<{ items: FavoriteItem[]; meta: PaginationMeta }, any>(
                apiUrl(`/api/favorites`),
                { params: { page, limit } }
            );
            return {
                items: payload?.items ?? payload?.data ?? [],
                meta: payload?.meta ?? { total: (payload?.items || []).length || 0, page, limit, pageCount: 1 },
            };
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Không thể tải danh sách yêu thích";
            throw new Error(msg);
        }
    },

    /** Thêm vào danh sách yêu thích */
    async addFavorite(data: CreateFavoriteRequest): Promise<FavoriteItem> {
        try {
            const payload = await axiosClient.post<any, any>(
                apiUrl(`/api/favorites`),
                data
            );
            return (payload?.data ?? payload) as FavoriteItem;
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Không thể thêm yêu thích";
            throw new Error(msg);
        }
    },

    /** Bỏ yêu thích */
    async removeFavorite(apartmentId: number): Promise<RemoveFavoriteResponse> {
        try {
            const payload = await axiosClient.delete<any, any>(
                apiUrl(`/api/favorites/${apartmentId}`)
            );
            return (payload?.data ?? payload) as RemoveFavoriteResponse;
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Không thể xóa yêu thích";
            throw new Error(msg);
        }
    },

    /** Toggle (bật/tắt) yêu thích */
    async toggleFavorite(data: CreateFavoriteRequest): Promise<ToggleFavoriteResponse> {
        try {
            const payload = await axiosClient.post<any, any>(
                apiUrl(`/api/favorites/toggle`),
                data
            );
            return (payload?.data ?? payload) as ToggleFavoriteResponse;
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Không thể toggle yêu thích";
            throw new Error(msg);
        }
    },

    /** Kiểm tra xem phòng đã được yêu thích chưa */
    async isFavorited(apartmentId: number): Promise<IsFavoritedResponse> {
        try {
            const payload = await axiosClient.get<any, any>(
                apiUrl(`/api/favorites/${apartmentId}`)
            );
            return (payload?.data ?? payload) as IsFavoritedResponse;
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Không thể kiểm tra trạng thái yêu thích";
            throw new Error(msg);
        }
    },
};
