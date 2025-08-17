// src/pages/cliente/ClienteCalendario.tsx
import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import Calendar from "../../components/calendar/Calendar";
import type { Appointment } from "../../types/appointment";
import { listenAppointments } from "../../repositories/appointmentRepo";
import { getSlotsForDate, isSameDay } from "../../utils/schedule";

// helpers (LOCAL, sem UTC)
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
  const initial = preSel ? fromLocalDateParam(preSel) : new Date();

  const [selected, setSelected] = React.useState<Date | null>(initial);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  // 🔗 Firestore (agenda pública)
  React.useEffect(() => {
    const unsub = listenAppointments(
      (rows) => setAppointments(rows),
      (e) => {
        console.error(e);
        setError("Falha ao carregar agenda pública.");
      }
    );
    return () => unsub();
  }, []);

  // slots do dia + set de ocupados
  const slots = React.useMemo(() => getSlotsForDate(selected ?? undefined), [selected]);
  const busySet = React.useMemo(() => {
    const s = new Set<string>();
    if (selected) {
      appointments.forEach((a) => {
        if (isSameDay(a.date, selected)) s.add(a.time);
      });
    }
    return s;
  }, [appointments, selected]);

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
          {/* Passamos appointments para o Calendar para os “pontinhos” */}
          <Calendar selected={selected} onSelect={setSelected} appointments={appointments} />
        </section>

        <section className="lg:col-span-1">
          <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 rounded-t-3xl">
              <h3 className="text-sm font-medium text-slate-700">Horários do dia</h3>
              <span className="text-xs text-slate-500">
                {selected?.toLocaleDateString("pt-BR")}
              </span>
            </header>

            {error ? (
              <div className="p-4 text-sm text-rose-600">{error}</div>
            ) : slots.length === 0 ? (
              <div className="m-4 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                Sem horários neste dia.
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {slots.map((t) => {
                  const busy = busySet.has(t);
                  return (
                    <li key={t} className="px-4 py-3 flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-800 tabular-nums">{t}</span>
                      {busy ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                          Ocupado
                        </span>
                      ) : (
                        <Link
                          to={`/cliente/agendamento?date=${selected ? toLocalDateParam(selected) : ""}&time=${t}`}
                          className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                        >
                          Disponível
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
}
