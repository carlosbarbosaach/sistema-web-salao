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
import { asLocalDate } from "../utils/date";

// ajuda: YYYY-MM-DD a partir de Date local
export function toLocalDateStr(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

// converte doc => Appointment (date: Date local)
function docToAppointment(id: string, data: DocumentData): Appointment {
    // no Firestore você está salvando `date` como string "YYYY-MM-DD"
    // e `time` como "HH:mm"
    const [y, m, d] = String(data.date).split("-").map(Number);
    const localDate = new Date(y, (m || 1) - 1, d || 1);

    return {
        id,
        title: String(data.title || ""),
        client: String(data.client || ""),
        phone: String(data.phone || ""),
        time: String(data.time || ""),
        date: localDate,
    };
}

// 👉 sem orderBy (evita índice composto). Ordena no cliente.
export function listenAppointmentsByDate(
    dateStr: string,
    onNext: (rows: Appointment[]) => void,
    onError?: (e: any) => void
) {
    const q = query(
        collection(db, "appointments"),
        where("date", "==", dateStr)
    );

    return onSnapshot(
        q,
        (snap) => {
            const rows = snap.docs.map((d) => docToAppointment(d.id, d.data()));
            // ordena por horário "HH:mm" no cliente
            rows.sort((a, b) => a.time.localeCompare(b.time));
            onNext(rows);
        },
        onError
    );
}

type CreatePayload = {
    title: string;
    client: string;
    phone: string;   // só dígitos
    date: string;    // "YYYY-MM-DD"
    time: string;    // "HH:mm"
};

export async function createAppointment(payload: CreatePayload) {
    await addDoc(collection(db, "appointments"), {
        ...payload,
        createdAt: Timestamp.now(),
    });
}

export function listenAppointments(
  cb: (rows: Appointment[]) => void,
  onError?: (e: unknown) => void
) {
  const q = query(collection(db, "appointments"));
  return onSnapshot(
    q,
    (snap) => {
      const rows: Appointment[] = snap.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          title: data.title ?? "",
          client: data.client ?? "",  // não será exibido no cliente
          phone: data.phone ?? "",    // não será exibido no cliente
          time: data.time ?? "",
          date: asLocalDate(data.date),
        };
      });
      cb(rows);
    },
    (e) => onError?.(e)
  );
}
