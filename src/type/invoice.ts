export interface InvoiceItem {
  serviceName: string;
  unitPrice?: string | null;
  unit?: string | null;
  meter?: string | null; // tên công tơ / mã công tơ
  initialIndex?: string | null; // chỉ số đầu
  meterIndex?: string | null; // legacy: chỉ số (kept for compatibility)
  quantity?: string | null;
  vat?: string | null;
  billingDate?: string | null; // YYYY-MM-DD - ngày tính phí
  fromDate?: string | null; // YYYY-MM-DD
  toDate?: string | null;   // YYYY-MM-DD
  amount?: string | null;
}

export interface InvoicePayload {
  buildingId: number;
  apartmentId: number;
  contractId?: number | null;
  // customer information (populated from the contract when available)
  customerId?: number | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerAddress?: string | null;
  period: string; // YYYY-MM
  issueDate?: string | null; // YYYY-MM-DD
  dueDate?: string | null;  // YYYY-MM-DD
  printTemplate?: string | null;
  note?: string | null;
  items: InvoiceItem[];
}
