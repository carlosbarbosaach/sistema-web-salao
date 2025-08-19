import type { Service } from "../types/service";

export const services: Service[] = [
  { id: "1", name: "Corte Feminino", description: "Corte, lavagem e finalização.", price: 120, durationMin: 50, badge: "Popular" },
  { id: "2", name: "Corte Masculino", description: "Corte clássico ou moderno + finalização.", price: 70, durationMin: 35 },
  { id: "3", name: "Escova Modeladora", description: "Modelagem com escova e finalização.", price: 90, durationMin: 45 },
  { id: "4", name: "Coloração", description: "Coloração completa com diagnóstico.", price: 260, durationMin: 120, badge: "Novo" },
  { id: "5", name: "Luzes/Mechas", description: "Técnicas de iluminação e tonalização.", price: 420, durationMin: 180 },
  { id: "6", name: "Progressiva", description: "Alinhamento e redução de volume.", price: 480, durationMin: 150, badge: "Promo" },
  { id: "7", name: "Hidratação Power", description: "Tratamento profundo + massagem capilar.", price: 140, durationMin: 40 },
  { id: "8", name: "Botox Capilar", description: "Reconstrução e brilho imediato.", price: 320, durationMin: 110 },
  { id: "9", name: "Design de Sobrancelhas", description: "Design personalizado com pinça.", price: 55, durationMin: 25 },
];
