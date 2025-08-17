import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import Calendar from "../../components/calendar/Calendar";
import AppointmentList from "../../components/appointments/AppointmentList";
import type { Appointment } from "../../types/appointment";

/* mock simples */
const APPTS: Appointment[] = [
  { id: 1, title: "Corte Feminino", client: "Ana Paula", phone: "(48) 99811-7717", time: "09:00", date: new Date(2025, 7, 16) },
  { id: 2, title: "Coloração", client: "Carla Souza", phone: "(48) 99922-3344", time: "11:00", date: new Date(2025, 7, 16) },
  { id: 3, title: "Corte Masculino", client: "Eduardo Lima", phone: "(48) 98877-1100", time: "14:00", date: new Date(2025, 7, 17) },
];

/* helpers: SEM timezone (local) */
function toLocalDateParam(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fromLocalDateParam(v: string) {
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export default function ClienteCalendario() {
  const [search] = useSearchParams();
  const preSel = search.get("date");

  // use parser LOCAL em vez de new Date(preSel) (que trata como UTC)
  const initial = preSel ? fromLocalDateParam(preSel) : new Date();
  const [selected, setSelected] = React.useState<Date | null>(initial);

  const filtered = React.useMemo(
    () => selected ? APPTS.filter(a => a.date.toDateString() === selected.toDateString()) : [],
    [selected]
  );

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-800">Calendário</h1>
        <Link
          to={`/cliente/agendamento?date=${selected ? toLocalDateParam(selected) : ""}`}
          className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Solicitar agendamento
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <Calendar selected={selected} onSelect={setSelected} appointments={APPTS} />
        </section>

        <section className="lg:col-span-1">
          <AppointmentList
            appointments={filtered}
            title="Agenda pública"
            date={selected ?? new Date()}
            emptyText="Nenhum horário ocupado neste dia."
            publicView
          />
        </section>
      </div>
    </div>
  );
}
