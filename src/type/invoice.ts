export interface InvoiceItem {
  serviceName: string;
  unitPrice?: string | null;
  meterIndex?: string | null;
  quantity?: string | null;
  vat?: string | null;
  fromDate?: string | null; // YYYY-MM-DD
  toDate?: string | null;   // YYYY-MM-DD
  amount?: string | null;
}

export interface InvoicePayload {
  buildingId: number;
  apartmentId: number;
  contractId?: number | null;
  period: string; // YYYY-MM
  issueDate?: string | null; // YYYY-MM-DD
  dueDate?: string | null;  // YYYY-MM-DD
  printTemplate?: string | null;
  note?: string | null;
  items: InvoiceItem[];
}
