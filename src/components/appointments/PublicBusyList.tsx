import React from "react";
import type { Appointment } from "../../types/appointment";

/* Helpers */
function parseTimeToMinutes(t: string) {
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
}
function formatPtBR(d?: Date | null) {
    if (!d) return "";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/** Lista pública: só horários ocupados (sem dados pessoais) */
export default function PublicBusyList({
    appointments,
    title = "Agenda do dia",
    date = null,
    emptyText = "Nenhum horário ocupado neste dia.",
}: {
    appointments: Appointment[];
    title?: string;
    date?: Date | null;
    emptyText?: string;
}) {
    const items = React.useMemo(
        () => [...appointments].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)),
        [appointments]
    );
    const count = items.length;

    return (
        <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 rounded-t-3xl">
                <h3 className="text-sm font-medium text-slate-700">{title}</h3>
                <span className="text-xs text-slate-500">{formatPtBR(date)}</span>
            </header>

            {/* corpo */}
            <div className="p-4">
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    {/* subheader */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                        <span className="text-sm font-medium text-slate-700">Horários ocupados</span>
                        <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-600">
                            {count}
                        </span>
                    </div>

                    {/* lista ou empty */}
                    {count > 0 ? (
                        <ul className="divide-y divide-slate-200">
                            {items.map((a) => (
                                <li key={a.id} className="px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        {/* horário */}
                                        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 tabular-nums">
                                            {/* bolinha de status */}
                                            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                                            {a.time}
                                        </span>
                                        {/* rótulo genérico */}
                                        <span className="text-xs text-slate-600">Ocupado</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="m-4 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                            {emptyText}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
