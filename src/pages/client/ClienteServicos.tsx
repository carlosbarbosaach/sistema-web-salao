// src/pages/client/ClienteServicos.tsx
import React from "react";
import type { Service } from "../../types/service";
import { getAllServicesOnce } from "../../repositories/serviceRepo";

export default function ClienteServicos() {
    const [items, setItems] = React.useState<Service[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        (async () => {
            try {
                const rows = await getAllServicesOnce();
                setItems(rows);
            } catch (e) {
                console.error(e);
                setError("Não foi possível carregar os serviços.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-semibold text-slate-800">Serviços</h1>
            </div>

            {loading ? (
                <p className="mt-6 text-sm text-slate-500">Carregando…</p>
            ) : error ? (
                <p className="mt-6 text-sm text-rose-600">{error}</p>
            ) : items.length === 0 ? (
                <div className="mt-6 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                    Nenhum serviço disponível no momento.
                </div>
            ) : (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((s) => (
                        <article
                            key={s.id}
                            className="rounded-3xl border border-slate-200 bg-white hover:shadow-sm transition-shadow"
                        >
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="text-base font-semibold text-slate-800">{s.name}</h3>
                                    {s.badge && (
                                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                            {s.badge}
                                        </span>
                                    )}
                                </div>

                                {s.description && (
                                    <p className="mt-1 text-sm text-slate-600 line-clamp-3">{s.description}</p>
                                )}

                                <div className="mt-4 flex items-end justify-between">
                                    <div className="space-y-1">
                                        {/* você removeu preço do lado admin; aqui pode omitir também */}
                                        <div className="text-xs text-slate-500 tabular-nums">
                                            ~ {s.durationMin ?? 0} min
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
