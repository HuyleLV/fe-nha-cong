export type PartnerRole = "landlord" | "customer" | "operator";

export type PartnerLead = {
  id: number;
  role: PartnerRole;
  fullName: string;
  phone: string;
  email: string;
  need?: string;     
  createdAt: string; 
};

export type PartnerForm = Omit<PartnerLead, "id" | "createdAt">;

export type PartnerQuery = {
  page?: number;        // Trang hiện tại (pagination)
  limit?: number;       // Số lượng mỗi trang
  role?: PartnerRole;   // Lọc theo vai trò
  q?: string;           // Tìm kiếm theo tên / email / SĐT
};
