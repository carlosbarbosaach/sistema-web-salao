import React from "react";
import { cn } from "../../utils/cn";
import { sameDay } from "../../utils/date";
import type { Appointment } from "../../types/appointment";

type Props = {
  date: Date;
  selected: Date | null;
  onSelect: (d: Date) => void;
  appointments: Appointment[];
  currentMonth: Date;
};

export default function DayCell({
  date,
  selected,
  onSelect,
  appointments,
  currentMonth,
}: Props) {
  const isSelected = !!selected && sameDay(date, selected);
  const isOtherMonth = date.getMonth() !== currentMonth.getMonth();
  const hasAppt = appointments.some((a) => sameDay(a.date, date));

  return (
    <button
      onClick={() => onSelect(date)}
      className={cn(
        "relative h-12 w-12 flex items-center justify-center text-sm transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300",
        isOtherMonth ? "text-slate-300" : "text-slate-700",
        isSelected ? "bg-indigo-600 rounded-2xl shadow-sm" : "rounded-full hover:bg-slate-100"
      )}
      aria-pressed={isSelected}
    >
      <span className={cn("font-medium", isSelected && "text-white")}>
        {date.getDate()}
      </span>

      {hasAppt && (
        <span
          className={cn(
            "absolute left-1/2 -translate-x-1/2 bottom-1 h-1.5 w-1.5 rounded-full",
            isSelected ? "bg-white" : "bg-indigo-600"
          )}
        />
      )}
    </button>
  );
}
