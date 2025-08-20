// src/pages/client/ClienteServicos.tsx
import React from "react";
import type { Service } from "../../types/service";
import { listenServices } from "../../repositories/serviceRepo"; // <-- usa o repositório

function formatBRL(n: number) {
    try {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
    } catch {
        return `R$ ${n.toFixed(2)}`;
    }
}

export default function ClienteServicos() {
    const [items, setItems] = React.useState<Service[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const unsub = listenServices(
            (rows) => {
                setItems(rows);
                setLoading(false);
            },
            (e) => {
                console.error(e);
                setError("Falha ao carregar serviços.");
                setLoading(false);
            }
        );
        return () => unsub(); // cleanup do snapshot
    }, []);

    return (
        <section className="max-w-6xl mx-auto p-4">
            <h1 className="text-xl font-semibold text-slate-900">Serviços</h1>
            <p className="text-slate-600 mb-4">Escolha um serviço para ver valores e duração.</p>

            {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                    Carregando…
                </div>
            ) : error ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-rose-600 shadow-sm">
                    {error}
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                    Nenhum serviço disponível no momento.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((s) => (
                        <article key={s.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="text-base font-semibold text-slate-800">{s.name}</h3>
                                {s.badge && (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                                        {s.badge}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-slate-600">{s.description}</p>
                            <div className="mt-3 flex items-end justify-between">
                                <div>
                                    <div className="text-base font-semibold text-slate-900">{formatBRL(s.price)}</div>
                                    <div className="text-xs text-slate-500">~ {s.durationMin} min</div>
                                </div>
                                <a
                                    href="/cliente/agendamento"
                                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                                >
                                    Agendar
                                </a>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
