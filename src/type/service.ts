export type FeeType =
  | 'rent'
  | 'deposit'
  | 'water'
  | 'electric'
  | 'internet'
  | 'cleaning'
  | 'management_fee'
  | 'parking'
  | 'service_fee'
  | 'laundry'
  | 'room_transfer_fee'
  | 'other';

export type PriceType =
  | 'fixed'
  | 'per_unit'
  | 'percent'
  | 'meter_fixed'
  | 'meter_quota'
  | 'quantity_quota';

export interface ServiceItem {
  id?: number;
  name: string;
  feeType?: FeeType | null;
  priceType?: PriceType | null;
  taxRate?: string | number | null;
  buildingId?: number | null;
  note?: string | null;
  unitPrice?: string | number | null;
  unit?: 'phong' | 'giuong' | 'kwh' | 'm3' | 'm2' | 'xe' | 'luot' | null;
}
