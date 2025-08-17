// src/pages/cliente/ClienteAgendamento.tsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Service } from "../../types/service";
import type { Appointment } from "../../types/appointment";
import { listenAppointments } from "../../repositories/appointmentRepo";
import { slotsForDate, busyTimesFor } from "../../utils/schedule";

// 🔗 Firestore
import {
  addDoc,
  collection,
  Timestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

/* ===================== Helpers ===================== */
function toDateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fromLocalDateParam(v: string) {
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1); // LOCAL
}
function maskPhoneBr(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}
const onlyDigits = (s: string) => s.replace(/\D/g, "");

/* ========== Modal de Notificação com barra animada (auto-close) ========== */
type NoticeVariant = "success" | "error" | "info";

function NoticeIcon({ variant }: { variant: NoticeVariant }) {
  const base = "h-5 w-5";
  if (variant === "success") {
    return (
      <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
        <path fill="#10B981" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm-1 14-4-4 1.414-1.414L11 12.172l4.586-4.586L17 9l-6 7Z" />
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
        <path fill="#EF4444" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 13h-2v2h2v-2Zm0-8h-2v6h2V7Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
      <path fill="#6366F1" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z" />
    </svg>
  );
}

function NotificationModal({
  open,
  title,
  message,
  variant = "success",
  durationMs = 5000,
  onClose,
}: {
  open: boolean;
  title: string;
  message?: string;
  variant?: NoticeVariant;
  durationMs?: number;
  onClose: () => void;
}) {
  const [remaining, setRemaining] = React.useState(durationMs);

  React.useEffect(() => {
    if (!open) {
      setRemaining(durationMs);
      return;
    }
    const start = Date.now();
    const t = setTimeout(onClose, durationMs);
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      setRemaining(Math.max(0, durationMs - elapsed));
    }, 100);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [open, durationMs, onClose]);

  if (!open) return null;

  const barColor =
    variant === "success" ? "bg-emerald-600"
      : variant === "error" ? "bg-rose-600"
        : "bg-indigo-600";

  const secondsLeft = Math.ceil(remaining / 1000);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <style>
        {`
        @keyframes fillWidth {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes stripeMove {
          from { background-position: 0 0; }
          to   { background-position: 40px 0; }
        }
        `}
      </style>

      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative z-[121] w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-lg"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3 p-4">
          <div className="mt-0.5">
            <NoticeIcon variant={variant} />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
            {message && <p className="mt-1 text-sm text-slate-600">{message}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`relative h-full ${barColor}`}
              style={{ animation: `fillWidth ${durationMs}ms linear forwards` }}
            >
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(255,255,255,.7) 0, rgba(255,255,255,.7) 10px, transparent 10px, transparent 20px)",
                  backgroundSize: "40px 100%",
                  animation: "stripeMove 800ms linear infinite",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Fechando em {secondsLeft}s…
          </div>
        </div>
      </div>
    </div>
  );
}
/* ==================================================== */

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

  // 🔔 notificação
  const [notice, setNotice] = React.useState<{
    open: boolean;
    variant: NoticeVariant;
    title: string;
    message?: string;
  }>({ open: false, variant: "success", title: "" });

  // 🔗 appointments para saber horários ocupados
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  React.useEffect(() => {
    const unsub = listenAppointments(
      (rows) => setAppointments(rows),
      (e) => console.error(e)
    );
    return () => unsub();
  }, []);

  // 🔗 services do Firestore (ordem por nome)
  const [services, setServices] = React.useState<Service[]>([]);
  React.useEffect(() => {
    const q = query(collection(db, "services"), orderBy("name", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Service[] = snap.docs.map((d) => {
          const x: any = d.data();
          return {
            id: d.id,
            name: x.name,
            description: x.description ?? "",
            price: x.price ?? 0,
            durationMin: x.durationMin ?? 0,
            badge: x.badge,
          } as Service;
        });
        setServices(rows);
      },
      (err) => console.error(err)
    );
    return () => unsub();
  }, []);

  // Data selecionada como Date (LOCAL)
  const selectedDate = React.useMemo(() => fromLocalDateParam(dateStr), [dateStr]);

  // Slots fixos do dia (ex.: domingo = [])
  const daySlots = React.useMemo(() => slotsForDate(selectedDate), [selectedDate]);

  // Horários já ocupados no dia
  const taken = React.useMemo(
    () => busyTimesFor(selectedDate, appointments),
    [selectedDate, appointments]
  );

  // Se o horário atual ficou inválido, limpa
  React.useEffect(() => {
    if (!time) return;
    if (!daySlots.includes(time) || taken.includes(time)) {
      setTime("");
    }
  }, [daySlots, taken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Estilo base
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eMap = validate();
    setErrors(eMap);
    if (Object.keys(eMap).length) return;

    try {
      // 🔥 Cria a solicitação no Firestore (coleção "requests")
      await addDoc(collection(db, "requests"), {
        client,
        phone, // mantemos formatado para leitura
        phoneDigits: onlyDigits(phone),
        service,
        date: Timestamp.fromDate(selectedDate),
        time,
        status: "pending",
        createdAt: Timestamp.now(),
      });

      setNotice({
        open: true,
        variant: "success",
        title: "Solicitação enviada!",
        message:
          "Recebemos seu pedido. Em breve entraremos em contato para confirmar.",
      });
    } catch (err: any) {
      console.error(err);
      setNotice({
        open: true,
        variant: "error",
        title: "Não foi possível enviar",
        message: err?.message || "Tente novamente em instantes.",
      });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pb-8">
      <h1 className="text-xl md:text-2xl font-semibold text-slate-800">
        Solicitar agendamento
      </h1>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 space-y-4"
          >
            {/* nome */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Seu nome
              </label>
              <input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Nome completo"
                className={INPUT_BASE + (errors.client ? INPUT_ERROR : "")}
              />
              {errors.client && (
                <p className="mt-1 text-xs text-rose-600">{errors.client}</p>
              )}
            </div>

            {/* telefone */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Telefone
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(maskPhoneBr(e.target.value))}
                placeholder="(xx) xxxxx-xxxx"
                className={INPUT_BASE + (errors.phone ? INPUT_ERROR : "")}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
              )}
            </div>

            {/* serviço (do Firestore) */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Serviço
              </label>
              <div className="relative mt-1">
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className={
                    "appearance-none pr-9 cursor-pointer " +
                    INPUT_BASE +
                    (errors.service ? INPUT_ERROR : "")
                  }
                >
                  <option value="" disabled>
                    {services.length ? "Selecione um serviço…" : "Carregando…"}
                  </option>
                  {services.map((s) => (
                    <option key={String(s.id)} value={s.name}>
                      {s.name}
                    </option>
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
              {errors.service && (
                <p className="mt-1 text-xs text-rose-600">{errors.service}</p>
              )}
            </div>

            {/* data + hora (hora com slots fixos e ocupados desabilitados) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Data
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className={INPUT_BASE + (errors.date ? INPUT_ERROR : "")}
                />
                {errors.date && (
                  <p className="mt-1 text-xs text-rose-600">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Horário
                </label>
                {daySlots.length === 0 ? (
                  <div className="mt-1 text-xs text-slate-500">
                    Sem atendimento neste dia. Escolha outra data.
                  </div>
                ) : (
                  <div className="relative mt-1">
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={
                        "appearance-none pr-9 cursor-pointer " +
                        INPUT_BASE +
                        (errors.time ? INPUT_ERROR : "")
                      }
                    >
                      <option value="" disabled>
                        Selecione um horário…
                      </option>
                      {daySlots.map((slot) => {
                        const isTaken = taken.includes(slot);
                        return (
                          <option key={slot} value={slot} disabled={isTaken}>
                            {slot} {isTaken ? "— ocupado" : "— disponível"}
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
                )}
                {errors.time && (
                  <p className="mt-1 text-xs text-rose-600">{errors.time}</p>
                )}
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
                disabled={daySlots.length === 0 || services.length === 0}
              >
                Enviar solicitação
              </button>
            </div>
          </form>
        </section>

        {/* dica lateral */}
        <aside className="lg:col-span-1">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4">
            <h3 className="text-sm font-medium text-slate-700">Como funciona?</h3>
            <p className="mt-1 text-sm text-slate-600">
              Esta é uma <b>solicitação</b> de horário. O salão confirmará a
              disponibilidade e enviará automaticamente uma mensagem pelo
              WhatsApp com os detalhes e instruções para confirmar sua presença.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Informe seus dados.</li>
              <li>Selecione um serviço.</li>
              <li>Escolha data e hora disponível.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Modal: notificação */}
      <NotificationModal
        open={notice.open}
        title={notice.title}
        message={notice.message}
        variant={notice.variant}
        onClose={() => {
          const goingTo = `/cliente/calendario?date=${dateStr}`;
          setNotice((n) => ({ ...n, open: false }));
          navigate(goingTo, { replace: true });
        }}
      />
    </div>
  );
}
