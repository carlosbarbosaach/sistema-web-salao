import React from "react";

type RequestItem = {
  id: string | number;
  cliente: string;
  servico?: string;
  hora?: string; // "HH:mm"
  status?: "pendente" | "aprovada" | "cancelada";
};

type Props = {
  title?: string;
  date?: Date | null;
  items?: RequestItem[]; // se vier, conta os pendentes; se vazio, mostra empty state
  emptyText?: string;
};

function formatPtBR(d?: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RequestsCard({
  title = "Solicitações",
  date = new Date(),
  items = [],
  emptyText = "Nenhuma solicitação no momento.",
}: Props) {
  const pendentes = items.filter((i) => (i.status ?? "pendente") === "pendente");
  const count = pendentes.length;

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* header do card */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 rounded-t-3xl">
        <h3 className="text-sm font-medium text-slate-700">{title}</h3>
        <span className="text-xs text-slate-500">{formatPtBR(date)}</span>
      </header>

      {/* bloco interno */}
      <div className="p-4">
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
            <span className="text-sm font-medium text-slate-700">
              Solicitações pendentes
            </span>
            <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-600">
              {count}
            </span>
          </div>

          {/* lista (rolável) ou empty */}
          {count > 0 ? (
            <ul className="divide-y divide-slate-200 max-h-96 overflow-auto">
              {pendentes.map((r) => (
                <li key={r.id} className="px-4 py-3 text-sm hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">{r.cliente}</p>
                      {r.servico && (
                        <p className="text-slate-500 truncate">{r.servico}</p>
                      )}
                    </div>
                    {r.hora && (
                      <span className="text-slate-600 shrink-0 tabular-nums">{r.hora}</span>
                    )}
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
