// src/types/service.ts
export type Service = {
  id: string;                 // <- era number, mude para string
  name: string;
  description: string;
  price: number;              // em BRL (centavos não, número normal)
  durationMin: number;
  badge?: "Novo" | "Popular" | "Promo"; // use "Promo" (não "Promoção")
  active?: boolean;
  createdAt?: any;            // Firestore timestamp
  updatedAt?: any;
};
