export type PartnerRole = "landlord" | "customer" | "operator";
export type PartnerStatus = "pending" | "approved" | "cancelled";

export type PartnerLead = {
  id: number;
  role: PartnerRole;
  fullName: string;
  phone: string;
  email: string;
  need?: string;     
  status?: PartnerStatus;
  createdAt: string; 
};

export type PartnerForm = Omit<PartnerLead, "id" | "createdAt">;

export type PartnerQuery = {
  page?: number;        // Trang hiện tại (pagination)
  limit?: number;       // Số lượng mỗi trang
  role?: PartnerRole;   // Lọc theo vai trò
  status?: PartnerStatus; // Lọc theo trạng thái
  q?: string;           // Tìm kiếm theo tên / email / SĐT
};
