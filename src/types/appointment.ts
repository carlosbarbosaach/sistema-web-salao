// types/appointment.ts
export type Appointment = {
  id: number;
  date: Date;
  time: string;      // "HH:mm"
  client: string;    // nome da cliente
  phone: string;     // telefone da cliente
  title?: string;    // (opcional) serviço, ex.: "Priscila Alisamentos"
};
