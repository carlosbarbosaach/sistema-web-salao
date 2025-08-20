// src/pages/client/ClienteAgendamento.tsx
import { useEffect, useMemo, useState } from "react";
import AppointmentForm from "../../components/appointments/AppointmentForm";
import HorarioSelect from "../../components/appointments/HorarioSelect";
import type { Service } from "../../types/service";
import type { Appointment } from "../../types/appointment";
import { db } from "../../lib/firebase";
import {
    addDoc,
    collection,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    where,
    serverTimestamp,
    Timestamp,
    type Unsubscribe,
} from "firebase/firestore";

// helpers
function todayISO() {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(
        t.getDate()
    ).padStart(2, "0")}`;
}
function fromDateInputValue(v: string) {
    const [y, m, d] = v.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
}

const ALL_SLOTS = [
    "09:00", "10:00", "11:00",
    "13:00", "14:00", "15:00", "16:00", "17:00"
];

export default function ClienteAgendamento() {
    const [services, setServices] = useState<Service[]>([]);
    const [dateISO, setDateISO] = useState<string>(todayISO());
    const [busyTimes, setBusyTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const busySet = useMemo(() => new Set(busyTimes), [busyTimes]);

    // 1) Serviços (uma vez)
    useEffect(() => {
        (async () => {
            const qS = query(collection(db, "services"), orderBy("name", "asc"));
            const snap = await getDocs(qS);
            const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Service[];
            setServices(rows);
        })();
    }, []);

    // 2) Timeslots ocupados do dia (tempo real)
    useEffect(() => {
        if (!dateISO) return;
        let unsub: Unsubscribe | undefined;

        (async () => {
            const qSlots = query(
                collection(db, "timeslots"),
                where("date", "==", dateISO),
                where("available", "==", false)
            );
            unsub = onSnapshot(
                qSlots,
                (snap) => {
                    const taken = snap.docs
                        .map((d) => (d.data() as any).time as string)
                        .map((t) => (t || "").slice(0, 5))
                        .filter(Boolean)
                        .sort((a, b) => a.localeCompare(b));
                    setBusyTimes(Array.from(new Set(taken)));
                },
                (err) => {
                    console.error(err);
                    setBusyTimes([]);
                }
            );
        })();

        return () => unsub?.();
    }, [dateISO]);

    // 3) Enviar solicitação
    async function handleSubmit(data: Omit<Appointment, "id">) {
        const finalTime = selectedTime || data.time;
        if (busySet.has(finalTime)) {
            alert("Esse horário acabou de ficar ocupado. Por favor, escolha outro.");
            return;
        }
        await addDoc(collection(db, "requests"), {
            title: data.title,
            client: data.client,
            phone: data.phone,
            time: finalTime,
            date: Timestamp.fromDate(data.date),
            createdAt: serverTimestamp(),
            status: "pending",
        });
        alert("Solicitação enviada! Entraremos em contato para confirmar.");
    }

    return (
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pb-8">
            <h1 className="text-xl md:text-2xl font-semibold text-slate-800">Solicitar agendamento</h1>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna principal (form) */}
                <section className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4">
                        <AppointmentForm
                            services={services}
                            defaultDate={fromDateInputValue(dateISO)}
                            busyTimes={busyTimes}
                            onDateChange={(iso) => setDateISO(iso)}
                            onSubmit={handleSubmit}
                            onCancel={() => history.back()}
                        />
                    </div>

            
                </section>

                {/* dica lateral */}
                <aside className="lg:col-span-1">
                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4">
                        <h3 className="text-sm font-medium text-slate-700">Como funciona?</h3>
                        <p className="mt-1 text-sm text-slate-600">
                            Esta é uma <b>solicitação</b> de horário. O salão confirmará a disponibilidade e
                            enviará automaticamente uma mensagem pelo WhatsApp com os detalhes e
                            instruções para confirmar sua presença.
                        </p>
                        <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 space-y-1">
                            <li>Informe seus dados.</li>
                            <li>Selecione um serviço.</li>
                            <li>Escolha data e hora preferenciais.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
