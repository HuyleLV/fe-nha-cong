export type PaginationMeta = { page: number; limit: number; pageCount: number; total: number };
export type ApiResponse<T> = { success: boolean; data: T; meta?: PaginationMeta };   // meta optional
export type PaginatedResponse<T> = { success: boolean; data: T[]; meta: PaginationMeta };