import { Location } from "./location";

export type ApartmentStatus = "draft" | "published" | "archived";


export type Apartment = {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    description?: string | null;
    location: Location; // eager from BE
    streetAddress?: string | null;
    lat?: string | null; // decimals as string
    lng?: string | null;
    bedrooms: number;
    bathrooms: number;
    areaM2?: string | null; // numeric string
    rentPrice: string; // numeric string
    currency: string; // default VND
    status: ApartmentStatus; // default draft
    coverImageUrl?: string | null;
    addressPath?: string | null;
    createdById: number;
    createdAt: string;
    updatedAt: string;
};


export type ApartmentForm = {
    title: string;
    slug: string;
    excerpt?: string;
    description?: string; // HTML or text
    locationId: number; // send id to BE
    streetAddress?: string;
    lat?: string | null;
    lng?: string | null;
    bedrooms?: number;
    bathrooms?: number;
    areaM2?: string | null;
    rentPrice: string; // keep string to avoid float issues
    currency?: string; // default VND
    status: ApartmentStatus;
    coverImageUrl?: string | null;
};


export type ApartmentQuery = {
    page?: number;
    limit?: number;
    search?: string; // title/slug
    status?: ApartmentStatus | "all";
    locationId?: number;
    minPrice?: string; // numeric string
    maxPrice?: string;
    bedrooms?: number;
};