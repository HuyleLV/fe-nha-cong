import { Apartment } from "@/type/apartment";
import { Location } from "@/type/location";

/**
 * Dữ liệu từng khu vực (quận/huyện) mà trang chủ hiển thị.
 * Mỗi khu vực có danh sách apartment rút gọn.
 */
export type ApiSection = {
  /** Thông tin quận/huyện */
  district: Pick<Location, "id" | "name" | "slug"> & {
    /** Mức phân cấp — ví dụ: "district" */
    level?: string;
  };

  /** Danh sách phòng/căn hộ hiển thị trong khu vực */
  apartments: Array<
    Pick<
      Apartment,
      | "id"
      | "title"
      | "slug"
      | "coverImageUrl"
      | "bedrooms"
      | "bathrooms"
      | "areaM2"
      | "rentPrice"
      | "currency"
      | "createdAt"
    > & {
      /** Khoá ngoại location (nếu có trong API) */
      locationId?: number;
    }
  >;
};

/**
 * Kết quả API `/api/apartments/home-sections`
 * gồm thông tin thành phố và danh sách các quận (sections).
 */
export type HomeSectionsResponse = {
  /** Thông tin thành phố cha */
  city: Pick<Location, "id" | "name" | "slug"> & {
    level?: string; // ví dụ: "city"
  };

  /** Danh sách các khu vực con (quận/huyện) */
  sections: ApiSection[];
};
