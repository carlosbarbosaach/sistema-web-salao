import React from "react";
import DayCell from "./DayCell";
import type { Appointment } from "../../types/appointment";

/** Converte vários formatos para Date local */
function asLocalDate(d: any): Date {
  if (!d) return new Date(NaN);
  if (typeof d?.toDate === "function") return d.toDate(); // Firestore Timestamp
  if (d instanceof Date) return d;
  if (typeof d === "string") {
    // tenta "YYYY-MM-DD"
    const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const y = Number(m[1]);
      const mm = Number(m[2]);
      const dd = Number(m[3]);
      return new Date(y, mm - 1, dd);
    }
    // fallback: Date parse
    const p = new Date(d);
    return isNaN(p.getTime()) ? new Date(NaN) : p;
  }
  return new Date(d);
}

/** Gera uma grade de 6x7 a partir do 1º dia do mês (domingo primeiro) */
function getMonthMatrix(month: Date): Date[] {
  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1);
  const startDow = first.getDay(); // 0..6 (Dom..Sáb)
  const start = new Date(y, m, 1 - startDow);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

type Props = {
  selected: Date | null;
  onSelect: (d: Date) => void;
  appointments: Appointment[];     // lista do MÊS (ou geral; usamos só a data)
  onMonthChange?: (firstDayOfMonth: Date) => void;
};

export default function Calendar({
  selected,
  onSelect,
  appointments,
  onMonthChange,
}: Props) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  // Set com os dias ocupados (por toDateString) — pontinhos SEMPRE usará isso
  const busyByDay = React.useMemo(() => {
    const set = new Set<string>();
    for (const a of appointments ?? []) {
      const d = asLocalDate((a as any).date);
      if (!isNaN(d.getTime())) set.add(d.toDateString());
    }
    return set;
  }, [appointments]);

  const matrix = React.useMemo(() => getMonthMatrix(currentMonth), [currentMonth]);

  const monthLabel = `${currentMonth.toLocaleDateString("pt-BR", {
    month: "long",
  })}/${currentMonth.getFullYear()}`;

  function goMonth(delta: number) {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1);
    setCurrentMonth(next);
    onMonthChange?.(next);
  }

  function goToday() {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    setCurrentMonth(first);
    onMonthChange?.(first);
    onSelect(today);
  }

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 rounded-t-3xl">
        <h3 className="text-sm font-medium text-slate-700">Calendário</h3>
        <span className="text-xs text-slate-500">
          {(selected ?? new Date()).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </header>

      <div className="p-4">
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          {/* Navegação */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => goMonth(-1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                aria-label="Mês anterior"
              >
                ←
              </button>
              <span className="text-sm font-medium capitalize text-slate-800">
                {monthLabel}
              </span>
              <button
                onClick={() => goMonth(1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                aria-label="Próximo mês"
              >
                →
              </button>
            </div>

            <button
              onClick={goToday}
              className="px-3 py-1 text-xs rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Hoje
            </button>
          </div>

          {/* Cabeçalho da semana */}
          <div className="px-2 pb-2 pt-1">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500 mb-1">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid de dias */}
            <div className="grid grid-cols-7 gap-1">
              {matrix.map((date) => {
                const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                return (
                  <div key={key} className="flex items-center justify-center py-1">
                    <DayCell
                      date={date}
                      currentMonth={currentMonth}
                      selected={selected}
                      onSelect={onSelect}
                      hasBusy={busyByDay.has(date.toDateString())}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
