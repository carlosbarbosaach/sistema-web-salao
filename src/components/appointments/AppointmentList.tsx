// src/components/appointments/AppointmentList.tsx
import React from "react";
import type { Appointment } from "../../types/appointment";
import { getSlotsForDate, isSameDay } from "../../utils/schedule";

type Props = {
  title?: string;
  date: Date;
  appointments: Appointment[];
};

export default function AppointmentList({ title = "Agendamentos do dia", date, appointments }: Props) {
  const slots = getSlotsForDate(date);

  // Mapa: time -> appointment (pega o 1º do horário)
  const map = React.useMemo(() => {
    const m = new Map<string, Appointment>();
    for (const a of appointments) {
      if (isSameDay(a.date, date)) m.set(a.time, a);
    }
    return m;
  }, [appointments, date]);

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-medium text-slate-700">{title}</h3>
          <p className="text-xs text-slate-500">{date.toLocaleDateString("pt-BR")}</p>
        </div>
        <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-600">
          {slots.length}
        </span>
      </div>

      {slots.length === 0 ? (
        <div className="m-4 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          Sem horários neste dia.
        </div>
      ) : (
        <ul className="divide-y divide-slate-200">
          {slots.map((t) => {
            const a = map.get(t);
            const busy = !!a;
            return (
              <li key={t} className="px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{t}</p>
                  {busy ? (
                    <p className="text-xs text-slate-600 truncate">
                      {a!.client} • {a!.title} • {a!.phone}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">Disponível</p>
                  )}
                </div>
                <span
                  className={
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " +
                    (busy ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")
                  }
                >
                  {busy ? "Ocupado" : "Livre"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
