// src/components/appointments/HorarioSelect.tsx
interface HorarioSelectProps {
  slots: string[];
  busyTimes: string[];
  value: string;
  onChange: (time: string) => void;
}

export default function HorarioSelect({ slots, busyTimes, value, onChange }: HorarioSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">Horário</label>
      <div className="relative mt-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none pr-9 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="" disabled>Selecione…</option>
          {slots.map((t) => {
            const isTaken = busyTimes.includes(t);
            return (
              <option key={t} value={t} disabled={isTaken}>
                {t}{isTaken ? " — (ocupado)" : ""}
              </option>
            );
          })}
        </select>
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        >
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </div>
    </div>
  );
}
