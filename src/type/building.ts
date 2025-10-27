export type BuildingStatus = "active" | "inactive" | "draft";

export type Building = {
  id: number;
  name: string;
  slug: string;
  address?: string | null;
  locationId?: number | null;
  lat?: string | null;
  lng?: string | null;
  floors: number;
  units: number;
  yearBuilt?: number | null;
  coverImageUrl?: string | null;
  images?: string | null; // backend stores JSON/CSV in text
  description?: string | null;
  status: BuildingStatus;
  createdBy?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type BuildingForm = {
  name: string;
  slug?: string;
  address?: string;
  locationId?: number;
  lat?: string;
  lng?: string;
  floors?: number;
  units?: number;
  yearBuilt?: number;
  coverImageUrl?: string;
  images?: string; // keep as text input (JSON/CSV) optional
  description?: string;
  status?: BuildingStatus;
};

export type BuildingQuery = {
  page?: number;
  limit?: number;
  q?: string;
  locationId?: number;
  status?: BuildingStatus;
};
