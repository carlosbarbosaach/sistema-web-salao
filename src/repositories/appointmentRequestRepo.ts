// src/repositories/appointmentRequestRepo.ts
import {
  collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc,
  serverTimestamp, Timestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";

export type AppointmentRequest = {
  id: string;
  title: string;   // nome do serviço (texto)
  client: string;
  phone: string;
  date: Date;      // timestamp -> Date
  time: string;    // "HH:mm"
  status: "pending" | "approved" | "rejected";
  createdAt?: Timestamp | null;
};

function toLocalDate(v: any): Date {
  if (v?.toDate) return v.toDate();
  return new Date(v);
}

export function listenRequests(onNext: (rows: AppointmentRequest[]) => void, onError?: (e:any)=>void) {
  const q = query(collection(db, "appointment_requests"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const rows: AppointmentRequest[] = snap.docs.map(d => {
      const x: any = d.data();
      return {
        id: d.id,
        title: String(x.title || ""),
        client: String(x.client || ""),
        phone: String(x.phone || ""),
        date: toLocalDate(x.date),
        time: String(x.time || ""),
        status: (x.status as any) ?? "pending",
        createdAt: x.createdAt ?? null,
      };
    });
    onNext(rows);
  }, onError);
}

// quando aprova: cria em "appointments" e marca a request como approved (ou apaga)
export async function approveRequest(r: AppointmentRequest) {
  // cria agendamento público (cliente vê como ocupado)
  const y = r.date.getFullYear();
  const m = String(r.date.getMonth() + 1).padStart(2, "0");
  const d = String(r.date.getDate()).padStart(2, "0");
  const dateStr = `${y}-${m}-${d}`;

  await addDoc(collection(db, "appointments"), {
    title: r.title,
    client: r.client,
    phone: r.phone,
    date: dateStr,    // string "YYYY-MM-DD" (fácil de consultar)
    time: r.time,
    public: true,
    createdAt: serverTimestamp(),
  });

  // marque como aprovada (ou deleteDoc se preferir remover da fila)
  await updateDoc(doc(db, "appointment_requests", r.id), {
    status: "approved",
    updatedAt: serverTimestamp(),
  });
}

export async function rejectRequest(rid: string) {
  await updateDoc(doc(db, "appointment_requests", rid), {
    status: "rejected",
    updatedAt: serverTimestamp(),
  });
}
