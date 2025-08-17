import React from "react";
import type { Appointment } from "../../types/appointment";

/* Helpers */
function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
}
function parseTimeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}
function waLink(phone: string, text?: string) {
  const d = phone.replace(/\D/g, "");
  const withCountry = d.startsWith("55") ? d : `55${d}`;
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${withCountry}${query}`;
}
function formatPtBR(d?: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/* Ícones */
function WhatsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2a9 9 0 00-7.8 13.4L3 22l6.8-1.2A9 9 0 1012 2zm0 2a7 7 0 11-3.6 13l-.26-.14-3.1.56.57-3.02-.16-.28A7 7 0 0112 4zm3.66 9.49c-.2-.1-1.17-.58-1.35-.65-.18-.07-.31-.1-.44.1-.13.2-.51.65-.63.79-.12.14-.23.16-.43.06-.2-.1-.86-.32-1.64-1.01-.6-.53-1-1.18-1.12-1.38-.12-.2 0-.31.09-.41.1-.1.2-.24.3-.36.1-.12.13-.2.2-.33.07-.13.04-.25-.02-.35-.06-.1-.44-1.07-.61-1.47-.16-.38-.33-.33-.45-.34h-.38c-.13 0-.33.05-.5.25-.17.2-.66.64-.66 1.56 0 .92.68 1.8.78 1.92.1.12 1.33 2.02 3.22 2.76.45.18.8.29 1.07.37.45.14.86.12 1.18.07.36-.05 1.17-.48 1.33-.95.16-.47.16-.88.1-.95-.05-.07-.18-.11-.38-.21z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm1 11h-4V7h2v4h2z" />
    </svg>
  );
}

/** === Card padronizado (claro + acento indigo) === */
export default function AppointmentList({
  appointments,
  title = "Agendamentos",
  date = null,
  emptyText = "Nenhum agendamento neste dia.",
  publicView = false, // <<< NOVO
}: {
  appointments: Appointment[];
  title?: string;
  date?: Date | null;
  emptyText?: string;
  publicView?: boolean; // <<< NOVO
}) {
  const items = React.useMemo(
    () => [...appointments].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)),
    [appointments]
  );
  const count = items.length;
  const subHeader = publicView ? "Horários ocupados" : "Agendamentos do dia";

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
            <span className="text-sm font-medium text-slate-700">{subHeader}</span>
            <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-600">
              {count}
            </span>
          </div>

          {/* lista rolável ou empty */}
          {count > 0 ? (
            <ul className="divide-y divide-slate-200 max-h-96 overflow-auto">
              {items.map((a) => {
                const digits = a.phone.replace(/\D/g, "");
                return (
                  <li key={a.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3.5">
                      {/* avatar */}
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                        {publicView ? "★" : initials(a.client)}
                      </div>

                      {/* conteúdo */}
                      <div className="min-w-0 flex-1">
                        {publicView ? (
                          <>
                            <p className="font-medium text-slate-800 truncate">Horário ocupado</p>
                            <p className="text-xs text-slate-500">Reservado</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-slate-800 truncate">{a.client}</p>
                            <a
                              href={`tel:${digits}`}
                              className="text-sm text-slate-500 hover:text-slate-700 hover:underline"
                              title="Ligar"
                            >
                              {formatPhone(a.phone)}
                            </a>
                          </>
                        )}
                      </div>

                      {/* hora + (WhatsApp somente privado) */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 tabular-nums">
                          <ClockIcon /> {a.time}
                        </span>

                        {!publicView && (
                          <a
                            href={waLink(a.phone, `Olá ${a.client.split(" ")[0]}, tudo bem? Sobre seu agendamento às ${a.time}…`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Enviar WhatsApp para ${a.client}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            title="WhatsApp"
                          >
                            <WhatsIcon />
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
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
