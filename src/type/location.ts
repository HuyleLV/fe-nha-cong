export type LocationLevel = "Province" | "City" | "District";

export type Location = {
  id: number;
  name: string | null;
  slug: string | null;
  level: LocationLevel;
  parent?: Location | null;
  coverImageUrl?: string | null;
  createdAt: string;   // ISO string từ BE
  updatedAt: string;   // ISO string từ BE
};

export type LocationForm = {
  name: string;
  slug: string;
  level: LocationLevel;
  parentId?: number | null;
  coverImageUrl?: string | null;
};