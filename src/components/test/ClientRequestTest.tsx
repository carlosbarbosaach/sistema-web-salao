// src/components/test/ClientRequestTest.tsx
import React from "react";
import { getDocs, collection, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { createAppointmentRequest } from "../../repositories/appointmentRequestRepo";
import type { Service } from "../../types/service";

function ymd(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export default function ClientRequestTest() {
    const [services, setServices] = React.useState<Service[]>([]);
    const [client, setClient] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [serviceTitle, setServiceTitle] = React.useState("");
    const [dateStr, setDateStr] = React.useState(ymd(new Date()));
    const [time, setTime] = React.useState("");

    const [msg, setMsg] = React.useState<string | null>(null);
    const [err, setErr] = React.useState<string | null>(null);

    React.useEffect(() => {
        (async () => {
            const snap = await getDocs(query(collection(db, "services"), orderBy("name", "asc")));
            const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Service[];
            setServices(rows);
        })();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null); setErr(null);

        if (!client.trim() || !phone.trim() || !serviceTitle || !dateStr || !time) {
            setErr("Preencha todos os campos.");
            return;
        }
        const [y, m, d] = dateStr.split("-").map(Number);
        const dt = new Date(y, (m || 1) - 1, d || 1);

        try {
            await createAppointmentRequest({
                title: serviceTitle,   // salva como string (compatível com as rules)
                client,
                phone,
                time,
                date: dt,
            });
            setMsg("Solicitação enviada! ✅");
            setClient(""); setPhone(""); setServiceTitle(""); setTime("");
        } catch (e: any) {
            console.error(e);
            setErr(e?.message || "Falha ao enviar.");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-800">Teste — Solicitação (cliente)</h3>

            <div>
                <label className="block text-sm text-slate-700">Nome</label>
                <input className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={client} onChange={(e) => setClient(e.target.value)} />
            </div>

            <div>
                <label className="block text-sm text-slate-700">Telefone</label>
                <input className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div>
                <label className="block text-sm text-slate-700">Serviço</label>
                <select className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={serviceTitle} onChange={(e) => setServiceTitle(e.target.value)}>
                    <option value="" disabled>Selecione…</option>
                    {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-slate-700">Data</label>
                    <input type="date" className="mt-1 w-full rounded-lg border px-3 py-2"
                        value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm text-slate-700">Hora</label>
                    <input type="time" className="mt-1 w-full rounded-lg border px-3 py-2"
                        value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
            </div>

            <div className="flex justify-end">
                <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
                    Enviar solicitação
                </button>
            </div>

            {msg && <p className="text-sm text-emerald-700">{msg}</p>}
            {err && <p className="text-sm text-rose-600">{err}</p>}
        </form>
    );
}
