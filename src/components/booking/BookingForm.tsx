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
    // retorna os dados da solicitação para quem chamou (Provider/Modal) exibir o toast
    onSuccess?: (info: {
        client: string;
        phone: string;
        service: string;
        date: Date;
        time: string;
    }) => void;
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
    const [cfg, setCfg] = React.useState<{
        openMinutes: number;
        closeMinutes: number;
        stepMinutes: number;
    } | null>(null);
    const [busySet, setBusySet] = React.useState<Set<string>>(new Set());

    // ui
    const [submitting, setSubmitting] = React.useState(false);
    const [errors, setErrors] = React.useState<{
        client?: string;
        phone?: string;
        title?: string;
        date?: string;
        time?: string;
    }>({});

    const dateObj = React.useMemo(() => fromLocalDateParam(dateStr), [dateStr]);

    // carrega serviços + config de horários
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
        return () => {
            mounted = false;
        };
    }, [servicesCollection, scheduleDocPath]);

    // ouve horários já ocupados para a data
    React.useEffect(() => {
        const unsub = watchAppointmentsByDate(dateObj, (rows) => {
            setBusySet(new Set(rows.map((r) => r.time).filter(Boolean)));
        });
        return () => unsub();
    }, [dateObj]);

    const slots = React.useMemo(() => {
        if (!cfg) return [];
        const out: string[] = [];
        for (let m = cfg.openMinutes; m <= cfg.closeMinutes; m += cfg.stepMinutes) {
            out.push(toHHMM(m));
        }
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
        if (!validate()) return;
        if (busySet.has(time)) {
            setErrors((p) => ({ ...p, time: "Horário indisponível. Escolha outro." }));
            return;
        }
        const serviceName = services.find((s) => s.id === serviceId)?.name ?? serviceId;

        try {
            setSubmitting(true);
            await createAppointment({
                serviceName,
                time,
                date: dateObj,
                client,
                phone,
            });
            setSubmitting(false);

            // dispara os dados para o Provider/Modal mostrar o toast
            onSuccess?.({
                client,
                phone,
                service: serviceName,
                date: dateObj,
                time,
            });
        } catch (err) {
            console.error(err);
            setSubmitting(false);
            setErrors((p) => ({ ...p, time: "Não foi possível salvar. Tente novamente." }));
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cliente */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <input
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="Nome completo"
                    className={
                        "w-full rounded-lg border px-3 py-2 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 " +
                        (errors.client ? "border-rose-400" : "border-slate-300")
                    }
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
                    className={
                        "w-full rounded-lg border px-3 py-2 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 " +
                        (errors.phone ? "border-rose-400" : "border-slate-300")
                    }
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
                        className={
                            "appearance-none w-full rounded-lg border px-3 py-2 pr-9 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 " +
                            (errors.title ? "border-rose-400" : "border-slate-300")
                        }
                    >
                        <option value="" disabled>
                            Selecione um serviço...
                        </option>
                        {services.length ? (
                            services.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>
                                Nenhum serviço cadastrado
                            </option>
                        )}
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
                        className={
                            "w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 " +
                            (errors.date ? "border-rose-400" : "border-slate-300")
                        }
                    />
                    {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Horário</label>
                    <div className="relative">
                        <select
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className={
                                "appearance-none w-full rounded-lg border px-3 py-2 pr-9 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 " +
                                (errors.time ? "border-rose-400" : "border-slate-300")
                            }
                        >
                            <option value="" disabled>
                                Selecione...
                            </option>
                            {slots.length === 0 && (
                                <option value="" disabled>
                                    Sem horários neste dia
                                </option>
                            )}
                            {slots.map((t) => {
                                const isTaken = busySet.has(t);
                                return (
                                    <option key={t} value={t} disabled={isTaken}>
                                        {t}
                                        {isTaken ? " — (ocupado)" : ""}
                                    </option>
                                );
                            })}
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
    );
}
