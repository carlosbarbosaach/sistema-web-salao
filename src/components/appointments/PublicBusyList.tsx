// src/components/appointments/PublicBusyList.tsx
import React from "react";
import type { Appointment } from "../../types/appointment";
import { getSlotsForDate, isSameDay } from "../../utils/schedule";

type Props = {
  title?: string;
  date: Date;
  appointments: Appointment[];
  emptyText?: string;
};

export default function PublicBusyList({
  title = "Agenda pública",
  date,
  appointments,
  emptyText = "Sem horários publicados neste dia.",
}: Props) {
  const slots = getSlotsForDate(date);

  const busyTimes = React.useMemo(() => {
    const set = new Set<string>();
    for (const a of appointments) {
      if (isSameDay(a.date, date)) set.add(a.time);
    }
    return set;
  }, [appointments, date]);

  if (slots.length === 0) {
    return (
      <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 text-sm font-medium text-slate-700">
          {title}
        </div>
        <div className="m-4 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          {emptyText}
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 text-sm font-medium text-slate-700">
        {title}
      </div>
      <ul className="divide-y divide-slate-200">
        {slots.map((t) => {
          const busy = busyTimes.has(t);
          return (
            <li key={t} className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-slate-800">{t}</span>
              <span
                className={
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " +
                  (busy ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")
                }
              >
                {busy ? "Ocupado" : "Disponível"}
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
