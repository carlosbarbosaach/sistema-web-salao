// src/components/test/AdminRequestsTest.tsx
import React from "react";
import {
    listenAppointmentRequests,
    updateRequestStatus,
    deleteRequest,
    type AppointmentRequest
} from "../../repositories/appointmentRequestRepo";
import { createAppointmentAdmin } from "../../repositories/appointmentRepo";
import { useAuth } from "../../auth/AuthProvider"; // se você tiver esse hook; senão remova moderatedBy

export default function AdminRequestsTest() {
    const [items, setItems] = React.useState<AppointmentRequest[]>([]);
    const { user } = useAuth?.() ?? { user: null as any };

    React.useEffect(() => {
        const unsub = listenAppointmentRequests(setItems, console.error);
        return () => unsub();
    }, []);

    async function approve(r: AppointmentRequest) {
        // 1) cria agendamento
        await createAppointmentAdmin({
            title: r.title,
            client: r.client,
            phone: r.phone,
            time: r.time,
            date: r.date,
            public: true,
        });
        // 2) marca como aprovada (ou delete, se preferir)
        await updateRequestStatus(r, "approved", { moderatorUid: user?.uid });
        await deleteRequest(r.id); // opcional: remove da fila após aprovar
    }

    async function reject(r: AppointmentRequest) {
        await updateRequestStatus(r, "rejected", { moderatorUid: user?.uid });
        await deleteRequest(r.id); // remove da fila
    }

    const pending = items.filter(i => i.status === "pending");

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Teste — Solicitações (admin)</h3>
                <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-600">
                    {pending.length}
                </span>
            </div>

            {pending.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                    Nenhuma solicitação pendente.
                </div>
            ) : (
                <ul className="divide-y divide-slate-200">
                    {pending.map((r) => (
                        <li key={r.id} className="py-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">{r.client}</p>
                                    <p className="text-xs text-slate-600 truncate">{r.phone} • {r.title}</p>
                                    <p className="text-xs text-slate-600">{r.date.toLocaleDateString("pt-BR")} • {r.time}</p>
                                </div>
                                <div className="shrink-0 flex items-center gap-1">
                                    <button
                                        onClick={() => approve(r)}
                                        className="inline-flex items-center rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                                    >
                                        Aprovar
                                    </button>
                                    <button
                                        onClick={() => reject(r)}
                                        className="inline-flex items-center rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                                    >
                                        Recusar
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
