// src/types/appointment.ts
export type Appointment = {
  id: string;           // <- string para bater com Firestore
  title: string;
  client: string;
  phone: string;
  time: string;         // "HH:mm"
  date: Date;           // sempre Date dentro do app
};
