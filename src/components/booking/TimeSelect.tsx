// src/components/booking/TimeSelect.tsx
import React from "react";
import { fetchScheduleSettings, toHHMM } from "./bookingApi";

export default function TimeSelect({
    value,
    onChange,
    takenTimes,
    label = "Horário",
    placeholder = "Selecione um horário",
    scheduleDocPath,
}: {
    value: string;
    onChange: (v: string) => void;
    takenTimes?: Set<string>;
    label?: string;
    placeholder?: string;
    scheduleDocPath?: string; // caminho alternativo, ex.: "config/agenda"
}) {
    const [opts, setOpts] = React.useState<{ value: string; disabled: boolean }[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let mounted = true;
        fetchScheduleSettings(scheduleDocPath).then((cfg) => {
            if (!mounted) return;
            const rows: { value: string; disabled: boolean }[] = [];
            for (let m = cfg.openMinutes; m <= cfg.closeMinutes; m += cfg.stepMinutes) {
                const hhmm = toHHMM(m);
                rows.push({ value: hhmm, disabled: takenTimes?.has(hhmm) ?? false });
            }
            setOpts(rows);
            setLoading(false);
        });
        return () => {
            mounted = false;
        };
    }, [scheduleDocPath, takenTimes]);

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <select
                className="mt-1 block w-full rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={loading}
                required
            >
                <option value="" disabled>
                    {loading ? "Carregando…" : placeholder}
                </option>
                {opts.map((o) => (
                    <option key={o.value} value={o.value} disabled={o.disabled}>
                        {o.value} {o.disabled ? "(ocupado)" : ""}
                    </option>
                ))}
            </select>
        </div>
    );
}
