export type Asset = {
  id: number;
  name: string;
  brand?: string | null;
  color?: string | null;
  modelOrYear?: string | null;
  origin?: string | null;
  value?: string; // numeric string
  quantity?: number;
  status?: string;
  warrantyPeriod?: string | null;
  buildingId?: number | null;
  apartmentId?: number | null;
  bedId?: number | null;
  notes?: string | null;
  images?: string | null;
};
