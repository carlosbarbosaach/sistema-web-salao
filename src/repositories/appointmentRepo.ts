// src/repositories/appointmentRepo.ts
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export type CreateAppointmentAdminPayload = {
  title: string;         // nome do serviço
  client: string;
  phone: string;
  time: string;          // "HH:mm"
  date: Date;            // salvo como Timestamp
  public?: boolean;      // se quiser exibir publicamente
};

export async function createAppointmentAdmin(p: CreateAppointmentAdminPayload) {
  await addDoc(collection(db, "appointments"), {
    title: p.title,
    client: p.client,
    phone: p.phone,
    time: p.time,
    date: Timestamp.fromDate(p.date),   // pode ser timestamp; suas rules permitem
    public: p.public ?? true,
    createdAt: serverTimestamp(),
  });
}
