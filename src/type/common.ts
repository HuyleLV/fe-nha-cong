export type PaginationMeta = { page: number; limit: number; totalPages: number; total: number };
export type ApiResponse<T> = { success: boolean; data: T; meta?: PaginationMeta };   // meta optional
export type PaginatedResponse<T> = { success: boolean; data: T[]; meta: PaginationMeta };
export type Paged<T> = { data: T[]; total: number; page: number; limit: number };