// src/components/booking/bookingApi.ts
import { db } from "../../lib/firebase";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    where,
} from "firebase/firestore";
import type { Service } from "../../types/service";
import type { Appointment } from "../../types/appointment";

export async function fetchServices(colPath = "services"): Promise<Service[]> {
    const snap = await getDocs(collection(db, colPath));
    return snap.docs.map((d) => {
        const data = d.data() as any;
        // normaliza badge "Promoção" -> "Promo" para bater com o tipo
        const badge = data.badge === "Promoção" ? "Promo" : data.badge;
        return { id: d.id, ...data, badge } as Service;
    });
}

export type ScheduleSettings = {
    openMinutes: number; // ex.: 8*60
    closeMinutes: number; // ex.: 18*60
    stepMinutes: number; // ex.: 30
};

const DEFAULT_SCHEDULE: ScheduleSettings = {
    openMinutes: 8 * 60,
    closeMinutes: 18 * 60,
    stepMinutes: 30,
};

export async function fetchScheduleSettings(docPath = "settings/schedule"): Promise<ScheduleSettings> {
    const ref = doc(db, ...docPath.split("/"));
    const snap = await getDoc(ref);
    if (!snap.exists()) return DEFAULT_SCHEDULE;
    const data = snap.data() as Partial<ScheduleSettings>;
    return {
        openMinutes: data.openMinutes ?? DEFAULT_SCHEDULE.openMinutes,
        closeMinutes: data.closeMinutes ?? DEFAULT_SCHEDULE.closeMinutes,
        stepMinutes: data.stepMinutes ?? DEFAULT_SCHEDULE.stepMinutes,
    };
}

export function startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
export function nextDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
}

export function parseDate(v: any): Date {
    if (!v) return new Date(NaN);
    if (typeof (v as any)?.toDate === "function") return (v as any).toDate();
    if (typeof v === "string") return new Date(v);
    return new Date(v);
}

export function watchAppointmentsByDate(date: Date, cb: (rows: Appointment[]) => void) {
    const ref = collection(db, "appointments");
    const q = query(
        ref,
        where("date", ">=", Timestamp.fromDate(startOfDay(date))),
        where("date", "<", Timestamp.fromDate(nextDay(date))),
        orderBy("date", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        cb(
            rows.map((r) => ({
                id: r.id as string,
                title: (r as any).title ?? "",
                client: (r as any).client ?? "",
                phone: (r as any).phone ?? "",
                time: (r as any).time ?? "",
                date: parseDate((r as any).date),
            }))
        );
    });
    return unsub;
}

export async function createAppointment(input: {
    serviceName: string; // será salvo em Appointment.title
    time: string; // HH:mm
    date: Date; // somente data
    client?: string;
    phone?: string;
}) {
    return addDoc(collection(db, "appointments"), {
        title: input.serviceName,
        client: input.client ?? "",
        phone: input.phone ?? "",
        time: input.time,
        date: Timestamp.fromDate(startOfDay(input.date)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
}

export function toHHMM(totalMinutes: number) {
    const h = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const m = String(totalMinutes % 60).padStart(2, "0");
    return `${h}:${m}`;
}
