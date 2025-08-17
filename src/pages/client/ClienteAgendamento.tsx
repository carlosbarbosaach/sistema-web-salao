import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Service } from "../../types/service";

/* mesmos serviços da vitrine (poderia vir de API/Contexto) */
const SERVICES: Service[] = [
    { id: 1, name: "Corte Feminino", description: "", price: 120, durationMin: 50, badge: "Popular" },
    { id: 2, name: "Corte Masculino", description: "", price: 70, durationMin: 35 },
    { id: 3, name: "Coloração", description: "", price: 260, durationMin: 120, badge: "Novo" },
    { id: 4, name: "Progressiva", description: "", price: 480, durationMin: 150, badge: "Promoção" },
];

/* helpers p/ data (LOCAL) e telefone */
function toDateInputValue(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
function fromLocalDateParam(v: string) {
    const [y, m, d] = v.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1); // <- LOCAL, sem UTC
}
function maskPhoneBr(raw: string) {
    const d = raw.replace(/\D/g, "");
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

export default function ClienteAgendamento() {
    const [search] = useSearchParams();
    const navigate = useNavigate();

    const preService = decodeURIComponent(search.get("service") || "");
    const preDate = search.get("date");
    const initialDate = preDate ? fromLocalDateParam(preDate) : new Date();

    const [client, setClient] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [service, setService] = React.useState(preService || "");
    const [dateStr, setDateStr] = React.useState(toDateInputValue(initialDate));
    const [time, setTime] = React.useState("");
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [ok, setOk] = React.useState(false);

    // Classe base padronizada (cinza suave, sem efeitos)
    const INPUT_BASE =
        "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm " +
        "text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-0";
    const INPUT_ERROR = " border-rose-300";

    function validate() {
        const e: Record<string, string> = {};
        if (!client.trim()) e.client = "Informe seu nome.";
        const digits = phone.replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 11) e.phone = "Telefone inválido.";
        if (!service) e.service = "Selecione o serviço.";
        if (!dateStr) e.date = "Selecione a data.";
        if (!time) e.time = "Selecione o horário.";
        return e;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const eMap = validate();
        setErrors(eMap);
        if (Object.keys(eMap).length) return;

        setOk(true);
        setTimeout(() => {
            navigate(`/cliente/calendario?date=${dateStr}`, { replace: true });
        }, 1200);
    }

    return (
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pb-8">
            <h1 className="text-xl md:text-2xl font-semibold text-slate-800">Solicitar agendamento</h1>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 space-y-4">
                        {/* nome */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Seu nome</label>
                            <input
                                value={client}
                                onChange={(e) => setClient(e.target.value)}
                                placeholder="Nome completo"
                                className={INPUT_BASE + (errors.client ? INPUT_ERROR : "")}
                            />
                            {errors.client && <p className="mt-1 text-xs text-rose-600">{errors.client}</p>}
                        </div>

                        {/* telefone */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Telefone</label>
                            <input
                                type="tel"
                                inputMode="tel"
                                value={phone}
                                onChange={(e) => setPhone(maskPhoneBr(e.target.value))}
                                placeholder="(xx) xxxxx-xxxx"
                                className={INPUT_BASE + (errors.phone ? INPUT_ERROR : "")}
                            />
                            {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
                        </div>

                        {/* serviço */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Serviço</label>
                            <div className="relative mt-1">
                                <select
                                    value={service}
                                    onChange={(e) => setService(e.target.value)}
                                    className={"appearance-none pr-9 cursor-pointer " + INPUT_BASE + (errors.service ? INPUT_ERROR : "")}
                                >
                                    <option value="" disabled>Selecione um serviço…</option>
                                    {SERVICES.map((s) => (
                                        <option key={s.id} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                                    aria-hidden="true"
                                >
                                    <path fill="currentColor" d="M7 10l5 5 5-5z" />
                                </svg>
                            </div>
                            {errors.service && <p className="mt-1 text-xs text-rose-600">{errors.service}</p>}
                        </div>

                        {/* data + hora */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Data</label>
                                <input
                                    type="date"
                                    value={dateStr}
                                    onChange={(e) => setDateStr(e.target.value)}
                                    className={INPUT_BASE + (errors.date ? INPUT_ERROR : "")}
                                />
                                {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Horário</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className={INPUT_BASE + (errors.time ? INPUT_ERROR : "")}
                                />
                                {errors.time && <p className="mt-1 text-xs text-rose-600">{errors.time}</p>}
                            </div>
                        </div>

                        {/* ações */}
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="cursor-pointer inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                            >
                                Voltar
                            </button>
                            <button
                                type="submit"
                                className="cursor-pointer inline-flex items-center rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-900"
                            >
                                Enviar solicitação
                            </button>
                        </div>

                        {ok && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                Solicitação enviada! Entraremos em contato para confirmar.
                            </div>
                        )}
                    </form>
                </section>

                {/* dica lateral */}
                <aside className="lg:col-span-1">
                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4">
                        <h3 className="text-sm font-medium text-slate-700">Como funciona?</h3>
                        <p className="mt-1 text-sm text-slate-600">
                            Esta é uma <b>solicitação</b> de horário. O salão confirmará a disponibilidade e
                            enviará automaticamente uma mensagem pelo WhatsApp com os detalhes e
                            instruções para confirmar sua presença.
                        </p>
                        <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 space-y-1">
                            <li>Informe seus dados.</li>
                            <li>Selecione um serviço.</li>
                            <li>Escolha data e hora preferenciais.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
