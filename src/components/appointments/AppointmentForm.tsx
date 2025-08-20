import React from "react";
import type { Appointment } from "../../types/appointment";
import type { Service } from "../../types/service";
import { getSlotsForDate } from "../../utils/schedule";

/** Props do form */
type FormValues = Omit<Appointment, "id">;
type Props = {
  services: Service[];
  initial?: Partial<FormValues>;
  defaultDate?: Date | null;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  /** horários já ocupados no dia selecionado (ex.: ["10:00","13:00"]) */
  busyTimes?: string[];
  /** avisa o pai quando a data mudar (formato YYYY-MM-DD) */
  onDateChange?: (isoDate: string) => void;
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
/** Máscara BR */
function formatPhoneBR(input: string) {
  const d = onlyDigits(input).slice(0, 11);
  if (!d) return "";
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (d.length <= 2) return `(${ddd}`;
  if (d.length <= 6) return `(${ddd}) ${rest}`;
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
  busyTimes = [],
  onDateChange,
}: Props) {
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [client, setClient] = React.useState(initial?.client ?? "");
  const [phone, setPhone] = React.useState(initial?.phone ?? "");
  const [time, setTime] = React.useState(initial?.time ?? "");
  const [dateStr, setDateStr] = React.useState(
    initial?.date ? toDateInputValue(initial.date) : toDateInputValue(defaultDate ?? new Date())
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const FIELD_BASE =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm " +
    "text-slate-800 placeholder:text-slate-400 outline-none transition-colors " +
    "focus:ring-0 focus:border-slate-400 caret-slate-700";
  const FIELD_ERROR = " border-rose-300 focus:border-rose-400";

  const currentDate = React.useMemo(() => fromDateInputValue(dateStr), [dateStr]);
  const slots = React.useMemo(() => getSlotsForDate(currentDate), [currentDate]);
  const busySet = React.useMemo(() => new Set(busyTimes), [busyTimes]);

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
      phone,
      time,
      date: fromDateInputValue(dateStr),
    });
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(formatPhoneBR(e.target.value));
  }
  function handlePhonePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    setPhone(formatPhoneBR(pasted));
  }

  // Ao mudar a data: limpar time inválido e avisar o pai
  React.useEffect(() => {
    if (time && !slots.includes(time)) setTime("");
    onDateChange?.(dateStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cliente */}
      <div>
        <label className="block text-sm font-medium text-slate-700">Cliente</label>
        <input
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="Nome completo"
          className={FIELD_BASE + (errors.client ? FIELD_ERROR : "")}
        />
        {errors.client && <p className="mt-1 text-xs text-rose-600">{errors.client}</p>}
      </div>

      {/* Telefone */}
      <div>
        <label className="block text-sm font-medium text-slate-700">Telefone</label>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={phone}
          onChange={handlePhoneChange}
          onPaste={handlePhonePaste}
          placeholder="(xx) xxxxx-xxxx"
          maxLength={16}
          className={FIELD_BASE + (errors.phone ? FIELD_ERROR : "")}
          pattern="\(\d{2}\)\s?\d{4,5}-?\d{4}"
        />
        {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
      </div>

      {/* Serviço */}
      <div>
        <label className="block text-sm font-medium text-slate-700">Serviço</label>
        <div className="relative mt-1">
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={"appearance-none pr-9 " + FIELD_BASE + (errors.title ? FIELD_ERROR : "")}
          >
            <option value="" disabled>Selecione um serviço…</option>
            {services.length ? (
              services.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))
            ) : (
              <option value="" disabled>Nenhum serviço cadastrado</option>
            )}
          </select>
          <svg width="16" height="16" viewBox="0 0 24 24"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            aria-hidden="true">
            <path fill="currentColor" d="M7 10l5 5 5-5z" />
          </svg>
        </div>
        {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
      </div>

      {/* Data + Horário (com indicação de ocupados) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Data</label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className={FIELD_BASE + (errors.date ? FIELD_ERROR : "")}
          />
          {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Horário</label>
          <div className="relative mt-1">
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={"appearance-none pr-9 " + FIELD_BASE + (errors.time ? FIELD_ERROR : "")}
            >
              <option value="" disabled>Selecione…</option>
              {slots.length === 0 && (
                <option value="" disabled>Sem horários neste dia</option>
              )}
              {slots.map((t) => {
                const isTaken = busySet.has(t); // cliente não edita, então qualquer ocupado = desabilitado
                return (
                  <option key={t} value={t} disabled={isTaken}>
                    {t}{isTaken ? " — (ocupado)" : ""}
                  </option>
                );
              })}
            </select>
            <svg width="16" height="16" viewBox="0 0 24 24"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              aria-hidden="true">
              <path fill="currentColor" d="M7 10l5 5 5-5z" />
            </svg>
          </div>
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
          className="inline-flex items-center rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-900"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
