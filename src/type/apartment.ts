// src/types/apartment.ts
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
  lat?: string | null;
  lng?: string | null;
  bedrooms: number;
  bathrooms: number;
  areaM2?: string | null;
  rentPrice: string;
  currency: string;
  status: ApartmentStatus;
  coverImageUrl?: string | null;
  addressPath?: string | null;

  // ===== Phí dịch vụ =====
  electricityPricePerKwh?: number | null;       // 4.000 đ/Kwh
  waterPricePerM3?: number | null;              // 35.000 đ/m3
  internetPricePerRoom?: number | null;         // 100.000 đ/Phòng
  commonServiceFeePerPerson?: number | null;    // 130.000 đ/Người

  // ===== Nội thất =====
  hasAirConditioner: boolean;     // Điều hoà
  hasWaterHeater: boolean;        // Nóng lạnh
  hasKitchenCabinet: boolean;     // Kệ bếp
  hasWashingMachine: boolean;     // Máy giặt
  hasWardrobe: boolean;           // Tủ quần áo

  // ===== Tiện nghi =====
  hasPrivateBathroom: boolean;    // Vệ sinh khép kín
  hasMezzanine: boolean;          // Gác xép
  noOwnerLiving: boolean;         // Không chung chủ
  flexibleHours: boolean;         // Giờ linh hoạt

  createdById: number;
  createdAt: string;
  updatedAt: string;
};

export type ApartmentForm = {
  title: string;
  slug: string;
  excerpt?: string;
  description?: string;
  locationId: number;
  streetAddress?: string;
  lat?: string | null;
  lng?: string | null;
  bedrooms?: number;
  bathrooms?: number;
  areaM2?: string | null;
  rentPrice: string;
  currency?: string;
  status: ApartmentStatus;
  coverImageUrl?: string | null;
  focusKeyword?: string;

  // ===== Phí dịch vụ =====
  electricityPricePerKwh?: number | null;
  waterPricePerM3?: number | null;
  internetPricePerRoom?: number | null;
  commonServiceFeePerPerson?: number | null;

  // ===== Nội thất =====
  hasAirConditioner?: boolean;
  hasWaterHeater?: boolean;
  hasKitchenCabinet?: boolean;
  hasWashingMachine?: boolean;
  hasWardrobe?: boolean;

  // ===== Tiện nghi =====
  hasPrivateBathroom?: boolean;
  hasMezzanine?: boolean;
  noOwnerLiving?: boolean;
  flexibleHours?: boolean;
};

export type ApartmentQuery = {
  // ===== Địa điểm =====
  locationId?: number;
  locationSlug?: string;

  // ===== Giá thuê =====
  minPrice?: number;
  maxPrice?: number;

  // ===== Diện tích =====
  minArea?: number;
  maxArea?: number;

  // ===== Phòng =====
  bedrooms?: number;
  bathrooms?: number;

  // ===== Trạng thái =====
  status?: ApartmentStatus;

  // ===== Tìm kiếm =====
  q?: string;

  // ===== Tiện nghi =====
  hasPrivateBathroom?: boolean;
  hasMezzanine?: boolean;
  noOwnerLiving?: boolean;
  hasAirConditioner?: boolean;
  hasWaterHeater?: boolean;
  hasWashingMachine?: boolean;
  hasWardrobe?: boolean;
  flexibleHours?: boolean;

  // ===== Sắp xếp =====
  /** newest | price_asc | price_desc | area_desc */
  sort?: "newest" | "price_asc" | "price_desc" | "area_desc";

  // ===== Phân trang =====
  page?: number;
  limit?: number;
};
