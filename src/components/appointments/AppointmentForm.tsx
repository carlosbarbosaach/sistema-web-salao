import React from "react";
import type { Appointment } from "../../types/appointment";
import type { Service } from "../../types/service";

/** Props do form */
type FormValues = Omit<Appointment, "id">;
type Props = {
    services: Service[];
    initial?: Partial<FormValues>;
    defaultDate?: Date | null;
    onSubmit: (data: FormValues) => void;
    onCancel: () => void;
};

/* Helpers */
function toDateInputValue(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
function fromDateInputValue(v: string) {
    const [y, m, d] = v.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
}
function onlyDigits(s: string) {
    return s.replace(/\D/g, "");
}

/** Máscara BR: (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX */
function formatPhoneBR(input: string) {
    const d = onlyDigits(input).slice(0, 11); // limita a 11 dígitos
    if (!d) return "";

    const ddd = d.slice(0, 2);
    const rest = d.slice(2);

    // Montagem progressiva enquanto digita
    if (d.length <= 2) return `(${ddd}`;
    if (d.length <= 6) return `(${ddd}) ${rest}`; // até 4 após DDD (sem hífen ainda)

    // Fixo (10 dígitos) => 4+4 | Celular (11) => 5+4
    const isCell = d.length > 10;
    const left = rest.slice(0, isCell ? 5 : 4);
    const right = rest.slice(isCell ? 5 : 4);

    return right ? `(${ddd}) ${left}-${right}` : `(${ddd}) ${left}`;
}

export default function AppointmentForm({
    services,
    initial,
    defaultDate,
    onSubmit,
    onCancel,
}: Props) {
    // title = nome do serviço selecionado
    const [title, setTitle] = React.useState(initial?.title ?? "");
    const [client, setClient] = React.useState(initial?.client ?? "");
    const [phone, setPhone] = React.useState(initial?.phone ?? "");
    const [time, setTime] = React.useState(initial?.time ?? "");
    const [dateStr, setDateStr] = React.useState(
        initial?.date ? toDateInputValue(initial.date) : toDateInputValue(defaultDate ?? new Date())
    );

    const [errors, setErrors] = React.useState<Record<string, string>>({});

    function validate() {
        const e: Record<string, string> = {};
        if (!client.trim()) e.client = "Informe o nome do cliente.";
        const d = onlyDigits(phone);
        if (d.length < 10 || d.length > 11) e.phone = "Telefone inválido.";
        if (!title.trim()) e.title = "Selecione o serviço.";
        if (!time) e.time = "Selecione o horário.";
        if (!dateStr) e.date = "Selecione a data.";
        return e;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const eMap = validate();
        setErrors(eMap);
        if (Object.keys(eMap).length) return;

        onSubmit({
            title,
            client,
            phone, // já vem mascarado para exibição; onlyDigits() é usado na validação
            time,
            date: fromDateInputValue(dateStr),
        });
    }

    // Handlers do telefone com máscara
    function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPhone(formatPhoneBR(e.target.value));
    }
    function handlePhonePaste(e: React.ClipboardEvent<HTMLInputElement>) {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text");
        setPhone(formatPhoneBR(pasted));
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cliente */}
            <div>
                <label className="block text-sm font-medium text-slate-700">Cliente</label>
                <input
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="Nome completo"
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${errors.client
                            ? "border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            : "border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        }`}
                />
                {errors.client && <p className="mt-1 text-xs text-rose-600">{errors.client}</p>}
            </div>

            {/* Telefone (com máscara BR) */}
            <div>
                <label className="block text-sm font-medium text-slate-700">Telefone</label>
                <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    onPaste={handlePhonePaste}
                    placeholder="(48) 99811-7717"
                    maxLength={16} // "(99) 99999-9999" tem 16 chars
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${errors.phone
                            ? "border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            : "border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        }`}
                    pattern="\(\d{2}\)\s?\d{4,5}-?\d{4}"
                />
                {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
            </div>

            {/* Serviço (select com serviços cadastrados) */}
            <div>
                <label className="block text-sm font-medium text-slate-700">Serviço</label>
                <div className="relative mt-1">
                    <select
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full appearance-none rounded-lg border px-3 py-2 pr-10 text-sm bg-white focus:outline-none ${errors.title
                                ? "border-rose-300 focus:ring-2 focus:ring-rose-200"
                                : "border-slate-300 focus:ring-2 focus:ring-emerald-300"
                            }`}
                    >
                        <option value="" disabled>
                            Selecione um serviço…
                        </option>
                        {services.length > 0 ? (
                            services.map((s) => (
                                <option key={s.id} value={s.name}>
                                    {s.name}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>
                                Nenhum serviço cadastrado
                            </option>
                        )}
                    </select>
                    {/* seta custom */}
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

            {/* Data + Hora */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Data</label>
                    <input
                        type="date"
                        value={dateStr}
                        onChange={(e) => setDateStr(e.target.value)}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${errors.date
                                ? "border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                                : "border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            }`}
                    />
                    {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Horário</label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${errors.time
                                ? "border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                                : "border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            }`}
                    />
                    {errors.time && <p className="mt-1 text-xs text-rose-600">{errors.time}</p>}
                </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                    Salvar
                </button>
            </div>
        </form>
    );
}
