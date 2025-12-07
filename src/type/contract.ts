export type ContractForm = {
  buildingId?: number | null;
  apartmentId?: number | null;
  customerId?: number | null;
  customerName?: string | null;
  rentAmount?: string | null | number;
  depositAmount?: string | null | number;
  depositPaid?: string | null | number;
  startDate?: string | null;
  expiryDate?: string | null;
  status?: string | null;
  note?: string | null;
  invoiceTemplate?: string | null;
  paymentCycle?: string | null;
  billingStartDate?: string | null;
  attachments?: string[] | null;
  attachmentsSingle?: string | null;
  serviceFees?: ContractServiceFee[] | null;
};

export type ContractServiceFee = {
  serviceId?: number | null;
  meter?: string | null;
  initialIndex?: number | null;
  quantity?: number | null;
  unitPrice?: string | number | null;
  unit?: string | null;
  billingDate?: string | null;
};

export type ContractRow = {
  id?: number;
  buildingId?: number | null;
  apartmentId?: number | null;
  customerId?: number | null;
  customerName?: string | null;
  customer?: any;
  rentAmount?: string | number | null;
  depositAmount?: string | number | null;
  depositPaid?: string | number | null;
  startDate?: string | null;
  expiryDate?: string | null;
  status?: string | null;
};

export type ContractStats = {
  total?: number;
  expiringSoon?: number;
  expired?: number;
  terminated?: number;
};
