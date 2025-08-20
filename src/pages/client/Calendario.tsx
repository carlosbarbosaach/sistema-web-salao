// src/pages/client/Calendario.tsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import Calendar from "../../components/calendar/Calendar";
import PublicBusyList from "../../components/appointments/PublicBusyList";
import type { Appointment } from "../../types/appointment";
import AppointmentForm from "../../components/appointments/AppointmentForm"; // <— ajuste o caminho se diferente

import { db } from "../../lib/firebase";
import { collection, onSnapshot, addDoc, getDocs, Timestamp } from "firebase/firestore";

function parseDate(v: any): Date {
  if (!v) return new Date(NaN);
  if (typeof v?.toDate === "function") return v.toDate();
  if (typeof v === "string") return new Date(v);
  return new Date(v);
}
function fromLocalDateParam(v: string) {
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export default function ClienteCalendario() {
  const [search] = useSearchParams();
  const preSel = search.get("date");
  const initial = preSel ? fromLocalDateParam(preSel) : new Date();

  const [selected, setSelected] = React.useState<Date | null>(initial);
  const [items, setItems] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);

  // modal state + dados para o form
  const [openNew, setOpenNew] = React.useState(false);
  const [services, setServices] = React.useState<any[]>([]);

  // snapshot em tempo real (appointments)
  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, "appointments"), (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      const mapped: Appointment[] = rows.map((r) => ({
        id: r.id,
        title: r.title ?? "",
        client: r.client ?? "",
        phone: r.phone ?? "",
        time: r.time ?? "",
        date: parseDate(r.date),
      }));
      setItems(mapped);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // carregar serviços para o select do modal
  React.useEffect(() => {
    getDocs(collection(db, "services")).then((snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setServices(rows);
    });
  }, []);

  // horários ocupados do dia selecionado (para desabilitar no form)
  const takenForSelected = React.useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(
      items
        .filter((a) => a.date.toDateString() === selected.toDateString())
        .map((a) => a.time)
        .filter(Boolean)
    );
  }, [items, selected]);

  // submit do modal (criar agendamento)
  async function handleCreate(data: {
    title: string;
    client: string;
    phone: string;
    time: string;
    date: Date;
  }) {
    await addDoc(collection(db, "appointments"), {
      title: data.title,
      client: data.client ?? "",
      phone: data.phone ?? "",
      time: data.time, // "HH:MM"
      date: Timestamp.fromDate(startOfDay(data.date)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    setOpenNew(false);
  }

  const filtered = React.useMemo(
    () =>
      selected
        ? items.filter((a) => a.date.toDateString() === selected.toDateString())
        : [],
    [items, selected]
  );

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-800">Calendário</h1>

        {/* CTA: abre o modal */}
        <button
          onClick={() => setOpenNew(true)}
          className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Solicitar agendamento
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <Calendar
            selected={selected ?? new Date()}
            onSelect={setSelected}
            appointments={items}
          />
        </section>

        <section className="lg:col-span-1">
          {loading ? (
            <div className="rounded-xl border p-4 text-slate-500 text-sm">Carregando…</div>
          ) : (
            <PublicBusyList
              appointments={filtered}
              title="Agenda pública"
              date={selected ?? new Date()}
              emptyText="Nenhum horário ocupado neste dia."
            />
          )}
        </section>
      </div>

      {/* Modal: novo agendamento */}
      {openNew && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenNew(false)} />
          <div className="relative z-[101] w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 rounded-t-3xl">
              <h3 className="text-base font-semibold text-slate-800">Novo agendamento</h3>
              <button
                onClick={() => setOpenNew(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <AppointmentForm
                services={services}
                initial={{
                  title: "",
                  client: "",
                  phone: "",
                  time: "",
                  date: selected ?? new Date(),
                }}
                defaultDate={selected ?? new Date()}
                busyTimes={takenForSelected}
                onCancel={() => setOpenNew(false)}
                onSubmit={handleCreate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
