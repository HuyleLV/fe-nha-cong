export type Bed = {
  id: number;
  name: string;
  rentPrice: string;
  depositAmount?: string | null;
  status?: string;
  apartmentId?: number | null;
};
