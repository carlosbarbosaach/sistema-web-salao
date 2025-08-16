import React from "react";
import type { Service } from "../../types/service";

type FormValues = Omit<Service, "id">;

type Props = {
    initial?: Partial<FormValues>;
    onSubmit: (data: FormValues) => void;
    onCancel: () => void;
};

/* Helpers de preço */
function formatBRL(n: number) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function parseBRLToNumber(text: string) {
    const digits = text.replace(/\D/g, "");
    return digits ? Number(digits) / 100 : 0;
}

export default function ServiceForm({ initial, onSubmit, onCancel }: Props) {
    // placeholders only (sem defaults preenchidos)
    const [name, setName] = React.useState(initial?.name ?? "");
    const [description, setDescription] = React.useState(initial?.description ?? "");
    const [priceText, setPriceText] = React.useState(
        initial?.price != null ? formatBRL(initial.price) : ""
    );
    const [durationText, setDurationText] = React.useState(
        initial?.durationMin != null ? String(initial.durationMin) : ""
    );
    const [badge, setBadge] = React.useState<FormValues["badge"]>(initial?.badge);
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
        const digits = e.target.value.replace(/\D/g, "");
        const amount = digits ? Number(digits) / 100 : 0;
        setPriceText(digits ? formatBRL(amount) : "");
    }

    function validate(v: { name: string; description: string; price: number; durationMin: number }) {
        const e: Record<string, string> = {};
        if (!v.name.trim()) e.name = "Informe o nome do serviço.";
        if (!v.description.trim()) e.description = "Informe a descrição.";
        if (v.price <= 0) e.price = "Preço deve ser maior que zero.";
        if (v.durationMin <= 0) e.durationMin = "Duração deve ser maior que zero.";
        return e;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const price = parseBRLToNumber(priceText);
        const durationMin = Number(durationText || 0);

        const eMap = validate({ name, description, price, durationMin });
        setErrors(eMap);
        if (Object.keys(eMap).length > 0) return;

        const payload: FormValues = {
            name,
            description,
            price,
            durationMin,
            badge,
        };
        onSubmit(payload);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
                <label className="block text-sm font-medium text-slate-700">Nome</label>
                <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${errors.name
                            ? "border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            : "border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        }`}
                    placeholder="Ex.: Corte Feminino"
                />
                {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
            </div>

            {/* Descrição */}
            <div>
                <label className="block text-sm font-medium text-slate-700">Descrição</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${errors.description
                            ? "border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            : "border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        }`}
                    placeholder="Detalhe o que está incluso no serviço…"
                />
                {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
            </div>

            {/* Preço + Duração */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Preço (R$)</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={priceText}
                        onChange={handlePriceChange}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${errors.price
                                ? "border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                                : "border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            }`}
                        placeholder="0,00"
                    />
                    {errors.price && <p className="mt-1 text-xs text-rose-600">{errors.price}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Duração (min)</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={durationText}
                        onChange={(e) => setDurationText(e.target.value.replace(/\D/g, ""))}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${errors.durationMin
                                ? "border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                                : "border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            }`}
                        placeholder="60"
                    />
                    {errors.durationMin && <p className="mt-1 text-xs text-rose-600">{errors.durationMin}</p>}
                </div>
            </div>

            {/* Badge (com seta custom) */}
            <div>
                <label className="block text-sm font-medium text-slate-700">Badge (opcional)</label>
                <div className="relative mt-1">
                    <select
                        value={badge ?? ""}
                        onChange={(e) => setBadge((e.target.value || undefined) as FormValues["badge"])}
                        className="w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    >
                        <option value="">—</option>
                        <option value="Novo">Novo</option>
                        <option value="Popular">Popular</option>
                        <option value="Promo">Promo</option>
                    </select>
                    {/* seta */}
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
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                    Salvar
                </button>
            </div>
        </form>
    );
}
