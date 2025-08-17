import type { Appointment } from "../../types/appointment";

export default function RecentAppointments({ items }: { items: Appointment[] }) {
  return (
    <ul className="divide-y divide-slate-200">
      {items.map((a) => (
        <li key={a.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-slate-800 truncate">{a.client}</p>
              <p className="text-sm text-slate-500 truncate">
                {a.title} • {a.time}
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {a.date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
