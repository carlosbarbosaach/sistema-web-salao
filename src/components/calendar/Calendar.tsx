import React from "react";
import DayCell from "./DayCell";
import { WEEK_DAYS, getMonthMatrix } from "../../utils/date";
import type { Appointment } from "../../types/appointment";

type Props = {
  selected: Date | null;
  onSelect: (d: Date) => void;
  appointments: Appointment[];
};

function formatPtBR(d?: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Calendar({ selected, onSelect, appointments }: Props) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const matrix = getMonthMatrix(currentMonth);

  const headerDate = selected ?? new Date();
  const monthLabel = `${currentMonth.toLocaleDateString("pt-BR", {
    month: "long",
  })}/${currentMonth.getFullYear()}`;

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Header (título pequeno + data à direita) */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 rounded-t-3xl">
        <h3 className="text-sm font-medium text-slate-700">Calendário</h3>
        <span className="text-xs text-slate-500">{formatPtBR(headerDate)}</span>
      </header>

      {/* Bloco interno padronizado */}
      <div className="p-4">
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          {/* Subcabeçalho com navegação */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1
                    )
                  )
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label="Mês anterior"
              >
                ←
              </button>

              <span className="text-sm font-medium capitalize text-slate-800">
                {monthLabel}
              </span>

              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1
                    )
                  )
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label="Próximo mês"
              >
                →
              </button>
            </div>

            <button
              onClick={() => {
                const today = new Date();
                setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                onSelect(today);
              }}
              className="px-3 py-1 text-xs rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              Hoje
            </button>
          </div>

          {/* Corpo: cabeçalho de semana + grid de dias */}
          <div className="px-2 pb-2 pt-1">
            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500 mb-1">
              {WEEK_DAYS.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {matrix.map((date, idx) => (
                <div key={idx} className="flex items-center justify-center py-1">
                  <DayCell
                    date={date}
                    selected={selected}
                    onSelect={onSelect}
                    appointments={appointments}
                    currentMonth={currentMonth}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
