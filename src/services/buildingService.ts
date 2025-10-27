import axiosClient from "@/utils/axiosClient";
import { Building, BuildingForm, BuildingQuery } from "@/type/building";

export type BuildingListMeta = { total: number; page: number; limit: number; pageCount: number };

const cleanParams = <T extends Record<string, any>>(p?: T): Partial<T> | undefined => {
  if (!p) return undefined;
  const out: Record<string, any> = {};
  for (const k of Object.keys(p)) {
    const v = (p as any)[k];
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
};

export const buildingService = {
  async getAll(params?: BuildingQuery): Promise<{ items: Building[]; meta: BuildingListMeta }>{
    const payload = await axiosClient.get<
      { items: Building[]; meta: BuildingListMeta },
      { items: Building[]; meta: BuildingListMeta }
    >("/api/buildings", { params: cleanParams(params) });
    return {
      items: payload?.items ?? [],
      meta: payload?.meta ?? { total: 0, page: 1, limit: 10, pageCount: 1 },
    };
  },

  async getById(idOrSlug: number | string): Promise<Building> {
    const payload = await axiosClient.get<any, any>(`/api/buildings/${encodeURIComponent(String(idOrSlug))}`);
    return (payload?.data ?? payload) as Building;
  },

  async create(body: BuildingForm): Promise<Building> {
    const payload = await axiosClient.post<any, any>(`/api/buildings`, body);
    return (payload?.data ?? payload) as Building;
  },

  async update(id: number | string, body: BuildingForm): Promise<Building> {
    const payload = await axiosClient.patch<any, any>(`/api/buildings/${encodeURIComponent(String(id))}`, body);
    return (payload?.data ?? payload) as Building;
  },

  async remove(id: number | string): Promise<boolean> {
    const payload = await axiosClient.delete<any, any>(`/api/buildings/${encodeURIComponent(String(id))}`);
    return (payload as any)?.success ?? true;
  },
};
