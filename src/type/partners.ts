// type/partner.ts
export type PartnerRole = "landlord" | "customer" | "operator";

export type PartnerLead = {
  id: number;
  role: PartnerRole;
  fullName: string;
  phone: string;
  email: string;
  note?: string;
  propertyCount?: number; // landlord
  budget?: number;        // customer
  companyName?: string;   // operator
  createdAt: string;      // ISO
};

export type PartnerForm = Omit<PartnerLead, "id" | "createdAt">;

export type PartnerQuery = {
  page?: number;
  limit?: number;
  role?: PartnerRole;
  q?: string; // search by name/email/phone
};
