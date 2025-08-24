// src/components/booking/BookingForm.tsx
import React from "react";
import {
    fetchServices,
    fetchScheduleSettings,
    watchAppointmentsByDate,
    createAppointment,
    toHHMM,
} from "./bookingApi";
import type { Service } from "../../types/service";

/* Toast minimalista, sem dependências externas */
function SimpleToast({
    open,
    text,
    onClose,
    duration = 10000,
}: {
    open: boolean;
    text: string;
    onClose: () => void;
    duration?: number;
}) {
    React.useEffect(() => {
        if (!open) return;
        const t = setTimeout(onClose, duration);
        return () => clearTimeout(t);
    }, [open, duration, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <style>{`@keyframes toastbar{from{width:0%}to{width:100%}}`}</style>
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-[10000] w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 rounded-t-2xl">
                    <h4 className="text-sm font-semibold text-slate-900">Solicitação enviada</h4>
                    <button
                        onClick={onClose}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                        aria-label="Fechar"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-4 text-sm text-slate-700 whitespace-pre-line">
                    {text}
                </div>
                <div className="px-4 pb-4">
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-emerald-600" style={{ animation: "toastbar 10s linear forwards" }} />
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">Fechando em ~10s…</p>
                </div>
            </div>
        </div>
    );
}

/* Helpers de data */
function toLocalDateParam(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
function fromLocalDateParam(v: string) {
    const [y, m, d] = v.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
}

export default function BookingForm({
    date,
    presetServiceId,
    onSuccess,
    onCancel,
    servicesCollection = "services",
    scheduleDocPath = "settings/schedule",
}: {
    date: Date;
    presetServiceId?: string;
    onSuccess?: (info: { client: string; phone: string; service: string; date: Date; time: string }) => void;
    onCancel?: () => void;
    servicesCollection?: string;
    scheduleDocPath?: string;
}) {
    // inputs
    const [client, setClient] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [serviceId, setServiceId] = React.useState(presetServiceId || "");
    const [dateStr, setDateStr] = React.useState(toLocalDateParam(date));
    const [time, setTime] = React.useState("");

    // dados
    const [services, setServices] = React.useState<Service[]>([]);
    const [cfg, setCfg] = React.useState<{ openMinutes: number; closeMinutes: number; stepMinutes: number } | null>(null);
    const [busySet, setBusySet] = React.useState<Set<string>>(new Set());

    // ui
    const [submitting, setSubmitting] = React.useState(false);
    const [errors, setErrors] = React.useState<{ client?: string; phone?: string; title?: string; date?: string; time?: string }>({});
    const [toastOpen, setToastOpen] = React.useState(false);

    const dateObj = React.useMemo(() => fromLocalDateParam(dateStr), [dateStr]);

    // carrega serviços + config
    React.useEffect(() => {
        let mounted = true;
        (async () => {
            const [srv, schedule] = await Promise.all([
                fetchServices(servicesCollection),
                fetchScheduleSettings(scheduleDocPath),
            ]);
            if (!mounted) return;
            setServices(srv.filter((s) => s.active !== false));
            setCfg(schedule);
        })();
        return () => { mounted = false; };
    }, [servicesCollection, scheduleDocPath]);

    // ouve ocupados
    React.useEffect(() => {
        const unsub = watchAppointmentsByDate(dateObj, (rows) => {
            setBusySet(new Set(rows.map((r) => r.time).filter(Boolean)));
        });
        return () => unsub();
    }, [dateObj]);

    const slots = React.useMemo(() => {
        if (!cfg) return [];
        const out: string[] = [];
        for (let m = cfg.openMinutes; m <= cfg.closeMinutes; m += cfg.stepMinutes) out.push(toHHMM(m));
        return out;
    }, [cfg]);

    function validate() {
        const e: typeof errors = {};
        if (!client.trim()) e.client = "Informe o nome do cliente.";
        if (!phone.trim()) e.phone = "Informe o telefone.";
        if (!serviceId) e.title = "Selecione um serviço.";
        if (!dateStr) e.date = "Selecione uma data.";
        if (!time) e.time = "Selecione um horário.";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log("[BookingForm] submit clicado");

        if (!validate()) {
            console.log("[BookingForm] inválido:", { client, phone, serviceId, dateStr, time });
            return;
        }
        if (busySet.has(time)) {
            console.log("[BookingForm] horário ocupado:", time);
            setErrors((p) => ({ ...p, time: "Horário indisponível. Escolha outro." }));
            return;
        }

        // 🔔 Toast abre imediatamente
        setToastOpen(true);
        console.log("[BookingForm] abrindo toast…");

        const serviceName = services.find((s) => s.id === serviceId)?.name ?? serviceId;

        try {
            setSubmitting(true);
            console.log("[BookingForm] salvando no Firestore…");
            await createAppointment({ serviceName, time, date: dateObj, client, phone });
            console.log("[BookingForm] salvo no Firestore, ok");
            setSubmitting(false);

            onSuccess?.({ client, phone, service: serviceName, date: dateObj, time });
        } catch (err) {
            console.error("[BookingForm] erro ao salvar:", err);
            setSubmitting(false);
            setErrors((p) => ({ ...p, time: "Não foi possível salvar. Tente novamente." }));
            // o toast já está aberto — mantém a experiência do usuário
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Cliente */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                    <input
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        placeholder="Nome completo"
                        className={"w-full rounded-lg border px-3 py-2 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 " + (errors.client ? "border-rose-400" : "border-slate-300")}
                    />
                    {errors.client && <p className="mt-1 text-xs text-rose-600">{errors.client}</p>}
                </div>

                {/* Telefone */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(xx) xxxxx-xxxx"
                        className={"w-full rounded-lg border px-3 py-2 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 " + (errors.phone ? "border-rose-400" : "border-slate-300")}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
                </div>

                {/* Serviço */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Serviço</label>
                    <div className="relative">
                        <select
                            value={serviceId}
                            onChange={(e) => setServiceId(e.target.value)}
                            className={"appearance-none w-full rounded-lg border px-3 py-2 pr-9 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 " + (errors.title ? "border-rose-400" : "border-slate-300")}
                        >
                            <option value="" disabled>Selecione um serviço...</option>
                            {services.length ? (
                                services.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))
                            ) : (
                                <option value="" disabled>Nenhum serviço cadastrado</option>
                            )}
                        </select>
                        <svg width="16" height="16" viewBox="0 0 24 24" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true">
                            <path fill="currentColor" d="M7 10l5 5 5-5z" />
                        </svg>
                    </div>
                    {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
                </div>

                {/* Data + Horário */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                        <input
                            type="date"
                            value={dateStr}
                            onChange={(e) => setDateStr(e.target.value)}
                            className={"w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 " + (errors.date ? "border-rose-400" : "border-slate-300")}
                        />
                        {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Horário</label>
                        <div className="relative">
                            <select
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className={"appearance-none w-full rounded-lg border px-3 py-2 pr-9 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 " + (errors.time ? "border-rose-400" : "border-slate-300")}
                            >
                                <option value="" disabled>Selecione...</option>
                                {Array.isArray(slots) && slots.length === 0 && (
                                    <option value="" disabled>Sem horários neste dia</option>
                                )}
                                {slots.map((t) => {
                                    const isTaken = busySet.has(t);
                                    return (
                                        <option key={t} value={t} disabled={isTaken}>
                                            {t}{isTaken ? " — (ocupado)" : ""}
                                        </option>
                                    );
                                })}
                            </select>
                            <svg width="16" height="16" viewBox="0 0 24 24" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true">
                                <path fill="currentColor" d="M7 10l5 5 5-5z" />
                            </svg>
                        </div>
                        {errors.time && <p className="mt-1 text-xs text-rose-600">{errors.time}</p>}
                    </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-end gap-2 pt-1">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                        {submitting ? "Enviando..." : "Enviar"}
                    </button>
                </div>
            </form>

            {/* TOAST */}
            <SimpleToast
                open={toastOpen}
                onClose={() => setToastOpen(false)}
                text={
                    "Recebemos sua solicitação.\n" +
                    "O administrador vai confirmar ou recusar e você será avisado pelo WhatsApp."
                }
            />
        </>
    );
}
