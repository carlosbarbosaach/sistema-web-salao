export type Service = {
  id: string;        
  name: string;
  description: string;
  price: number;              
  durationMin: number;
  badge?: "Novo" | "Popular" | "Promo"; 
  createdAt?: any;           
  updatedAt?: any;
};
