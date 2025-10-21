import { Apartment } from "./apartment";

export type FavoriteItem = {
    id: number;
    userId: number;
    apartmentId: number;
    createdAt: string;
    apartment: Apartment | null;
  };