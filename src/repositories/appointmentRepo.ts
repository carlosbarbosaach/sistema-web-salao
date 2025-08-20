// src/repositories/appointmentRepo.ts
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Appointment } from "../types/appointment";

/* ===================== Datas ===================== */
// YYYY-MM-DD a partir de Date (LOCAL)
export function toLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Converte qualquer coisa do Firestore -> Date local
export function asLocalDate(val: any): Date {
  if (val?.toDate) return val.toDate(); // Timestamp
  if (typeof val === "string") {
    const [y, m, d] = val.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }
  return new Date(val);
}

/* ============== Doc -> Appointment ============== */
function docToAppointment(id: string, data: DocumentData): Appointment {
  return {
    id,
    title: String(data.title || ""),
    client: String(data.client || ""),
    phone: String(data.phone || ""),
    time: String(data.time || ""),
    date: asLocalDate(data.date),
  };
}

/* ================== Listeners ==================== */
// 🔓 Público (cliente): só públicos
export function listenPublicAppointments(
  onNext: (rows: Appointment[]) => void,
  onError?: (e: any) => void
) {
  const q = query(collection(db, "appointments"), where("public", "==", true));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => docToAppointment(d.id, d.data()));
      onNext(rows);
    },
    onError
  );
}

// 👑 Admin (tudo)
export function listenAppointmentsAll(
  onNext: (rows: Appointment[]) => void,
  onError?: (e: any) => void
) {
  const q = query(collection(db, "appointments"));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => docToAppointment(d.id, d.data()));
      onNext(rows);
    },
    onError
  );
}

// Por data exata (YYYY-MM-DD). Por padrão PUBLIC ONLY.
export function listenAppointmentsByDate(
  dateStr: string,
  onNext: (rows: Appointment[]) => void,
  onError?: (e: any) => void,
  opts: { publicOnly?: boolean } = { publicOnly: true }
) {
  const base = [where("date", "==", dateStr)] as any[];
  if (opts.publicOnly !== false) base.push(where("public", "==", true));
  const q = query(collection(db, "appointments"), ...base);
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => docToAppointment(d.id, d.data()));
      rows.sort((a, b) => a.time.localeCompare(b.time));
      onNext(rows);
    },
    onError
  );
}

/* ================== Create ====================== */
type CreatePayload = {
  title: string;
  client: string;
  phone: string;             // só dígitos ou formatado (vai como veio)
  date: string | Date;       // aceita Date OU "YYYY-MM-DD"
  time: string;              // "HH:mm"
  public?: boolean;          // default true (para calendário público)
};

export async function createAppointment(payload: CreatePayload) {
  const dateStr =
    typeof payload.date === "string" ? payload.date : toLocalDateStr(payload.date);

  await addDoc(collection(db, "appointments"), {
    title: payload.title,
    client: payload.client,
    phone: payload.phone,
    date: dateStr,               // 🔒 sempre string
    time: payload.time,
    public: payload.public ?? true,
    createdAt: Timestamp.now(),
  });
}
