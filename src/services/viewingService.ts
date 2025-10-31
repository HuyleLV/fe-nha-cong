import axiosClient from "@/utils/axiosClient";
import { apiUrl } from "@/utils/apiUrl";


export type CreateViewingInput = {
  apartmentId: number;
  /** thời điểm mong muốn xem phòng - ISO 8601 string (e.g. 2025-10-12T14:30:00.000Z) */
  preferredAt: string;
  /** tên người đặt lịch */
  name: string;
  /** số điện thoại liên hệ */
  phone: string;
  /** ghi chú thêm (optional) */
  note?: string;
};

export type Viewing = {
  id: number;
  apartmentId: number;
  userId?: number | null;
  preferredAt: string;
  status: "pending" | "confirmed" | "cancelled" | "done";
  name: string;
  phone: string;
  email?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const viewingService = {
  async create(input: CreateViewingInput): Promise<Viewing> {
    const res = await axiosClient.post<Viewing | { data: Viewing }>(apiUrl("/api/viewings"), input);
    return ((res as any)?.data ?? res) as Viewing;
  },
  async mine(params?: { page?: number; limit?: number }): Promise<{ items: Viewing[]; meta: any }>{
  const payload = (await axiosClient.get(apiUrl(`/api/viewings/mine`), { params })) as any;
    if (Array.isArray(payload)) return { items: payload as Viewing[], meta: null };
    return payload as { items: Viewing[]; meta: any };
  },

  // Admin
  async adminList(params?: { q?: string; status?: string; apartmentId?: number; buildingId?: number; page?: number; limit?: number }): Promise<{ items: Viewing[]; meta: any }>{
  const data = await axiosClient.get<{ items: Viewing[]; meta: any } | Viewing[]>(apiUrl(`/api/viewings/admin`), { params }) as unknown as { items: Viewing[]; meta: any } | Viewing[];
    if (Array.isArray(data)) return { items: data, meta: null };
    return data as { items: Viewing[]; meta: any };
  },
  async adminUpdateStatus(id: number, payload: { status: 'pending'|'confirmed'|'cancelled'; staffNote?: string }) {
  const data = await axiosClient.patch(apiUrl(`/api/viewings/admin/${id}/status`), payload);
    return data;
  },
  async adminRemove(id: number) {
  const data = await axiosClient.delete(apiUrl(`/api/viewings/admin/${id}`));
    return data;
  },
  async adminGet(id: number): Promise<Viewing> {
    const data = await axiosClient.get(apiUrl(`/api/viewings/admin/${id}`)) as unknown as Viewing;
    return data;
  }
};
