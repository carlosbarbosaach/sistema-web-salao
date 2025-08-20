// src/pages/cliente/ClienteCalendario.tsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import Calendar from "../../components/calendar/Calendar";
import PublicBusyList from "../../components/appointments/PublicBusyList";
import type { Appointment } from "../../types/appointment";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useBookingModal } from "../../components/booking/BookingModalProvider";

function parseDate(v: any): Date {
  if (!v) return new Date(NaN);
  if (typeof v?.toDate === "function") return v.toDate(); // Firestore Timestamp
  if (typeof v === "string") return new Date(v);
  return new Date(v);
}

function fromLocalDateParam(v: string) {
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export default function ClienteCalendario() {
  const [search] = useSearchParams();
  const preSel = search.get("date");
  const initial = preSel ? fromLocalDateParam(preSel) : new Date();

  const [selected, setSelected] = React.useState<Date | null>(initial);
  const [items, setItems] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);

  const { open } = useBookingModal();

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
        <button
          onClick={() => open({ date: selected ?? new Date() })}
          className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Solicitar agendamento
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <Calendar selected={selected ?? new Date()} onSelect={setSelected} appointments={items} />
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
    </div>
  );
}
