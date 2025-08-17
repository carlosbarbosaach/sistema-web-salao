import { cn } from "../../utils/cn";

type Props = {
  date: Date;
  currentMonth: Date;
  selected: Date | null;
  onSelect: (d: Date) => void;
  hasBusy?: boolean; // se true, mostra o pontinho SEMPRE
};

export default function DayCell({
  date,
  currentMonth,
  selected,
  onSelect,
  hasBusy = false,
}: Props) {
  const isSelected = !!selected && date.toDateString() === selected.toDateString();
  const isOtherMonth = date.getMonth() !== currentMonth.getMonth();

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
      aria-label={date.toDateString()}
    >
      <span className={cn("font-medium", isSelected && "text-white")}>
        {date.getDate()}
      </span>

      {/* Pontinho de “tem agendamento”: SEMPRE visível quando hasBusy=true */}
      {hasBusy && (
        <span
          className={cn(
            "absolute left-1/2 -translate-x-1/2 bottom-1 h-1.5 w-1.5 rounded-full",
            isSelected ? "bg-emerald-300" : "bg-emerald-600"
          )}
        />
      )}
    </button>
  );
}
