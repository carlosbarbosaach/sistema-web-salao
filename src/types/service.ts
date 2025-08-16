// src/types/service.ts
export type Service = {
  id: number;
  name: string;
  description: string;
  price: number;       // BRL
  durationMin: number;
  badge?: "Novo" | "Popular" | "Promo";
};
