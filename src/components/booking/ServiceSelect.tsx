// src/components/booking/ServiceSelect.tsx
import React from "react";
import { fetchServices, type Service } from "./bookingApi";

export default function ServiceSelect({
    value,
    onChange,
    disabled,
    label = "Serviço",
    placeholder = "Selecione um serviço",
    servicesCollection,
}: {
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    label?: string;
    placeholder?: string;
    servicesCollection?: string; // caminho alternativo, ex.: "barbershop_services"
}) {
    const [services, setServices] = React.useState<Service[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let mounted = true;
        fetchServices(servicesCollection).then((rows) => {
            if (mounted) {
                setServices(rows);
                setLoading(false);
            }
        });
        return () => {
            mounted = false;
        };
    }, [servicesCollection]);

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <select
                className="mt-1 block w-full rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled || loading}
                required
            >
                <option value="" disabled>
                    {loading ? "Carregando…" : placeholder}
                </option>
                {services.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
