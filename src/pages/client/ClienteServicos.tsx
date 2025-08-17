import React from "react";
import { Link } from "react-router-dom";
import type { Service } from "../../types/service";

const SERVICES: Service[] = [
  { id: 1, name: "Corte Feminino", description: "Corte, lavagem e finalização.", price: 120, durationMin: 50, badge: "Popular" },
  { id: 2, name: "Corte Masculino", description: "Corte clássico ou moderno.", price: 70, durationMin: 35 },
  { id: 3, name: "Coloração", description: "Coloração completa com diagnóstico.", price: 260, durationMin: 120, badge: "Novo" },
  { id: 4, name: "Progressiva", description: "Alinhamento e redução de volume.", price: 480, durationMin: 150, badge: "Promoção" },
];

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
      {children}
    </span>
  );
}

export default function ClienteServicos() {
  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-800">Serviços</h1>
        <Link
          to="/cliente/agendamento"
          className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Agendar agora
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map((s) => (
          <article key={s.id} className="rounded-3xl border border-slate-200 bg-white hover:shadow-sm transition-shadow">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-800">{s.name}</h3>
                {s.badge && <Badge>{s.badge}</Badge>}
              </div>

              <p className="mt-1 text-sm text-slate-600 line-clamp-3">{s.description}</p>

              <div className="mt-4 flex items-end justify-between">
                <div className="space-y-1">
                  <div className="text-base font-semibold text-slate-900">{formatBRL(s.price)}</div>
                  <div className="text-xs text-slate-500 tabular-nums">~ {s.durationMin} min</div>
                </div>

                <Link
                  to={`/cliente/agendamento?service=${encodeURIComponent(s.name)}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Agendar
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
