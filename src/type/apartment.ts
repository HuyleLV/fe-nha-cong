import { Location } from "./location";

export type ApartmentStatus = "draft" | "published" | "archived";

/** Bản đọc về (read model) từ API */
export type Apartment = {
  id: number;
  title: string;
  slug: string;

  excerpt?: string | null;
  description?: string | null;

  /** Khóa ngoại – luôn có */
  locationId: number;
  /** Khóa ngoại – có thể null nếu không thuộc tòa nào */
  buildingId?: number | null;

  /** Optional: API có thể trả kèm location (expand/eager); đừng bắt buộc */
  location?: Location;

  streetAddress?: string | null;

  /** Toạ độ chi tiết của phòng (có thể null nếu dùng toạ độ của tòa) */
  lat?: string | null;
  lng?: string | null;

  bedrooms: number;
  bathrooms: number;
  livingRooms?: number;
  roomCode?: string | null; // Mã phòng/căn hộ nội bộ (ví dụ P302)
  /** Số tầng trong toà nhà (>=1). Null nếu không rõ hoặc không thuộc toà */
  floorNumber?: number | null;
  /** Sức chứa (số người ở tối đa) */
  guests?: number;
  areaM2?: string | null;

  /** numeric string */
  rentPrice: string;
  currency: string;
  /** Ưu đãi theo phần trăm (0-100). Null/undefined nếu không có ưu đãi */
  discountPercent?: number | null;

  status: ApartmentStatus;

  /** Ảnh đại diện */
  coverImageUrl?: string | null;
  /** Bộ ảnh gallery */
  images?: string[];             // NEW

  /** (Tuỳ hệ thống) đường dẫn địa chỉ dạng text */
  addressPath?: string | null;

  // ===== Phí dịch vụ =====
  electricityPricePerKwh?: number | null;
  waterPricePerM3?: number | null;
  internetPricePerRoom?: number | null;
  commonServiceFeePerPerson?: number | null;
  serviceFeeNote?: string | null;
  furnitureNote?: string | null;
  amenitiesNote?: string | null;

  // ===== Nội thất =====
  hasAirConditioner: boolean;
  hasWaterHeater: boolean;
  hasKitchenCabinet: boolean;
  hasWashingMachine: boolean;
  hasWardrobe: boolean;
  // New furniture (2025-11)
  hasBed?: boolean;
  hasMattress?: boolean;
  hasBedding?: boolean; // ga gối chăn
  hasDressingTable?: boolean;
  hasSofa?: boolean;
  hasSharedBathroom?: boolean;
  hasWashingMachineShared?: boolean;
  hasWashingMachinePrivate?: boolean;
  hasDesk?: boolean;
  hasKitchenTable?: boolean;
  hasRangeHood?: boolean;
  hasFridge?: boolean;

  // ===== Tiện nghi =====
  hasPrivateBathroom: boolean;
  hasMezzanine: boolean;
  noOwnerLiving: boolean;
  flexibleHours: boolean;
  
  // ===== New amenities (2025-11) =====
  hasElevator: boolean;
  allowPet: boolean;
  allowElectricVehicle: boolean;

  /** Whether this apartment is verified by admin/system */
  isVerified?: boolean;

  favorited?: boolean;

  createdById: number;
  createdAt: string;
  updatedAt: string;
};

/** Bản ghi form gửi lên (create/update) */
export type ApartmentForm = {
  title: string;
  slug?: string;                  // để BE tự sinh nếu không truyền
  excerpt?: string;
  description?: string;
  /** Video URL (YouTube/Vimeo/mp4). Will be placed first in images on submit */
  videoUrl?: string | null;

  locationId: number;
  buildingId?: number | null;

  streetAddress?: string;

  lat?: string | null;
  lng?: string | null;

  bedrooms?: number;
  bathrooms?: number;
  livingRooms?: number;
  roomCode?: string; // Mã phòng/căn hộ nội bộ (ví dụ P302)
  floorNumber?: number; // Tầng (>=1) nếu thuộc toà nhà
  /** Sức chứa (số người ở tối đa) */
  guests?: number;
  areaM2?: string | null;

  /** numeric string */
  rentPrice: string;
  currency?: string;              // default "VND" ở BE
  status?: ApartmentStatus;       // default "draft" ở BE
  discountPercent?: number | null; // Ưu đãi (%), 0-100

  coverImageUrl?: string | null;
  images?: string[];              // NEW

  // ===== Phí dịch vụ =====
  electricityPricePerKwh?: number | null;
  waterPricePerM3?: number | null;
  internetPricePerRoom?: number | null;
  commonServiceFeePerPerson?: number | null;
  serviceFeeNote?: string | null;
  furnitureNote?: string | null;
  amenitiesNote?: string | null;

  // ===== Nội thất =====
  hasAirConditioner?: boolean;
  hasWaterHeater?: boolean;
  hasKitchenCabinet?: boolean;
  hasWashingMachine?: boolean;
  hasWardrobe?: boolean;
  // New furniture (2025-11)
  hasBed?: boolean;
  hasMattress?: boolean;
  hasBedding?: boolean; // ga gối chăn
  hasDressingTable?: boolean;
  hasSofa?: boolean;
  hasSharedBathroom?: boolean;
  hasWashingMachineShared?: boolean;
  hasWashingMachinePrivate?: boolean;
  hasDesk?: boolean;
  hasKitchenTable?: boolean;
  hasRangeHood?: boolean;
  hasFridge?: boolean;

  // ===== Tiện nghi =====
  hasPrivateBathroom?: boolean;
  hasMezzanine?: boolean;
  noOwnerLiving?: boolean;
  flexibleHours?: boolean;
  
  // ===== New amenities (2025-11) =====
  hasElevator?: boolean;
  allowPet?: boolean;
  allowElectricVehicle?: boolean;

  /** Admin flag: verified */
  isVerified?: boolean;

  /** SEO tuỳ hệ thống */
  focusKeyword?: string;
};

/** Tham số query khi list */
export type ApartmentQuery = {
  // ===== Khóa ngoại =====
  locationId?: number;
  buildingId?: number;           
  /** Lọc theo tầng cụ thể (>=1) */
  floorNumber?: number;
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
  /** Số phòng khách */
  livingRooms?: number;
  /** Sức chứa (số khách) */
  guests?: number;

  // ===== Trạng thái =====
  status?: ApartmentStatus;

  // ===== Tìm kiếm =====
  q?: string;

  hasPrivateBathroom?: boolean;
  hasMezzanine?: boolean;
  noOwnerLiving?: boolean;
  hasAirConditioner?: boolean;
  hasWaterHeater?: boolean;
  hasWashingMachine?: boolean;
  hasWardrobe?: boolean;
  flexibleHours?: boolean;
  
  // ===== New amenities filters (2025-11) =====
  hasElevator?: boolean;
  allowPet?: boolean;
  allowElectricVehicle?: boolean;

  // Ưu đãi
  hasDiscount?: boolean;
  minDiscount?: number;

  sort?: "newest" | "price_asc" | "price_desc" | "area_desc" | "discount_desc";

  page?: number;
  limit?: number;
};
