// src/pages/Agendamento.tsx
import React from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

import Calendar from "../components/calendar/Calendar";
import AppointmentForm from "../components/appointments/AppointmentForm";
import ConfirmModal from "../components/common/ConfirmModal";

import type { Appointment } from "../types/appointment";
import type { Service } from "../types/service";
import { busyTimesFor } from "../utils/schedule";

/* ===================== Helpers ===================== */
const onlyDigits = (s: string) => s.replace(/\D/g, "");
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function toLocalDate(d: any): Date {
  if (d?.toDate) return d.toDate(); // Firestore Timestamp
  if (typeof d === "string") {
    const [y, m, day] = d.split("-").map(Number); // YYYY-MM-DD
    if (y && m) return new Date(y, (m || 1) - 1, day || 1);
  }
  return new Date(d);
}

function sortByTimeAsc(a: Appointment, b: Appointment) {
  const n = (t: string) => Number((t || "00:00").replace(":", "")); // "14:30" -> 1430
  return n(a.time) - n(b.time);
}

function waLinkFrom(phoneDigits: string, text: string) {
  const num = phoneDigits.startsWith("55") ? phoneDigits : `55${phoneDigits}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

/** (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX – ignora 55 e limita a 11 dígitos */
function formatPhoneBR(raw: string): string {
  let d = onlyDigits(raw);
  if (d.startsWith("55") && d.length > 11) d = d.slice(2);
  d = d.slice(0, 11);
  if (!d) return "";
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (d.length <= 2) return `(${ddd}`;
  if (d.length <= 6) return `(${ddd}) ${rest}`;
  const isCell = d.length === 11;
  const left = rest.slice(0, isCell ? 5 : 4);
  const right = rest.slice(isCell ? 5 : 4);
  return right ? `(${ddd}) ${left}-${right}` : `(${ddd}) ${left}`;
}

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
  durationMs = 5000, // 5s e fecha sozinho
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
      {/* keyframes locais */}
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

        {/* Barra com preenchimento animado + listras */}
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

/* Tipo local para solicitações do cliente */
type RequestDoc = {
  id: string;
  client: string;
  phone: string;
  phoneDigits?: string;
  service: string; // nome do serviço
  date: Date;
  time: string;
  status?: "pending" | "approved" | "rejected";
  createdAt?: Timestamp;
};

export default function Agendamento() {
  const [selected, setSelected] = React.useState<Date | null>(new Date());
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [requests, setRequests] = React.useState<RequestDoc[]>([]);

  // edição / exclusão / criação
  const [editing, setEditing] = React.useState<Appointment | null>(null);
  const [confirmDel, setConfirmDel] = React.useState<Appointment | null>(null);
  const [openNew, setOpenNew] = React.useState(false);

  // notificação
  const [notice, setNotice] = React.useState<{
    open: boolean;
    variant: NoticeVariant;
    title: string;
    message?: string;
  }>({ open: false, variant: "success", title: "" });

  // Carrega agendamentos
  React.useEffect(() => {
    const q = query(collection(db, "appointments"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const rows: Appointment[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          title: data.title,
          client: data.client,
          phone: data.phone,
          time: data.time,
          date: toLocalDate(data.date),
        } as Appointment;
      });
      setAppointments(rows);
    });
    return () => unsub();
  }, []);

  // Carrega serviços
  React.useEffect(() => {
    const q = query(collection(db, "services"), orderBy("name", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const rows: Service[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          name: data.name,
          description: data.description ?? "",
          price: data.price ?? 0,
          durationMin: data.durationMin ?? 0,
          badge: data.badge,
        } as Service;
      });
      setServices(rows);
    });
    return () => unsub();
  }, []);

  // Carrega solicitações pendentes
  React.useEffect(() => {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const rows: RequestDoc[] = snap.docs.map((d) => {
        const x: any = d.data();
        return {
          id: d.id,
          client: x.client,
          phone: x.phone,
          phoneDigits: x.phoneDigits,
          service: x.service,
          date: x.date?.toDate ? x.date.toDate() : new Date(x.date),
          time: x.time,
          status: x.status ?? "pending",
          createdAt: x.createdAt,
        };
      });
      setRequests(rows);
    });
    return () => unsub();
  }, []);

  // Itens do dia
  const dayItems = React.useMemo(() => {
    if (!selected) return [];
    return appointments.filter((a) => sameDay(a.date, selected)).sort(sortByTimeAsc);
  }, [appointments, selected]);

  // horários ocupados do dia selecionado (para desabilitar no form)
  const takenForSelected = React.useMemo(
    () => (selected ? busyTimesFor(selected, appointments) : []),
    [selected, appointments]
  );

  function hasConflict(date: Date, time: string) {
    return appointments.some((a) => a.time === time && sameDay(a.date, date));
  }

  // Criar novo agendamento (CTA)
  async function handleCreate(data: Omit<Appointment, "id">) {
    try {
      if (hasConflict(data.date as Date, data.time)) {
        setNotice({
          open: true,
          variant: "error",
          title: "Horário já ocupado",
          message: `Já existe agendamento em ${data.time} para este dia.`,
        });
        return;
      }
      await addDoc(collection(db, "appointments"), {
        title: data.title,
        client: data.client,
        phone: data.phone,
        time: data.time,
        date: data.date instanceof Date ? data.date : Timestamp.fromDate(new Date(data.date)),
        createdAt: Timestamp.now(),
      });
      setOpenNew(false);
      setNotice({
        open: true,
        variant: "success",
        title: "Agendamento criado!",
        message: "O novo agendamento foi salvo com sucesso.",
      });
    } catch (e: any) {
      console.error(e);
      setNotice({
        open: true,
        variant: "error",
        title: "Não foi possível criar",
        message: e?.message || "Tente novamente.",
      });
    }
  }

  // Editar (com notificação)
  async function handleUpdate(data: Omit<Appointment, "id">) {
    if (!editing) return;
    try {
      // se mudou data/hora, checar conflito
      if (
        (data.date instanceof Date ? data.date : new Date(data.date)).toDateString() !==
        editing.date.toDateString() ||
        data.time !== editing.time
      ) {
        const newDate = data.date instanceof Date ? data.date : new Date(data.date);
        if (hasConflict(newDate, data.time)) {
          setNotice({
            open: true,
            variant: "error",
            title: "Horário já ocupado",
            message: `Já existe agendamento em ${data.time} para este dia.`,
          });
          return;
        }
      }

      const ref = doc(db, "appointments", String(editing.id));
      await updateDoc(ref, {
        title: data.title,
        client: data.client,
        phone: data.phone, // para padronizar, poderia salvar onlyDigits(data.phone)
        time: data.time,
        date: data.date instanceof Date ? data.date : Timestamp.fromDate(new Date(data.date)),
        updatedAt: Timestamp.now(),
      });
      setEditing(null);
      setNotice({
        open: true,
        variant: "success",
        title: "Agendamento atualizado!",
        message: "As alterações foram salvas com sucesso.",
      });
    } catch (e: any) {
      console.error(e);
      setNotice({
        open: true,
        variant: "error",
        title: "Não foi possível salvar",
        message: e?.message || "Tente novamente em instantes.",
      });
    }
  }

  // Excluir
  async function handleDelete() {
    if (!confirmDel) return;
    try {
      const ref = doc(db, "appointments", String(confirmDel.id));
      await deleteDoc(ref);
      setConfirmDel(null);
      setNotice({
        open: true,
        variant: "success",
        title: "Agendamento excluído",
        message: "O registro foi removido.",
      });
    } catch (e: any) {
      console.error(e);
      setNotice({
        open: true,
        variant: "error",
        title: "Falha ao excluir",
        message: e?.message || "Tente novamente em instantes.",
      });
    }
  }

  // Aprovar / Recusar solicitações
  async function approveRequest(r: RequestDoc) {
    try {
      if (hasConflict(r.date, r.time)) {
        setNotice({
          open: true,
          variant: "error",
          title: "Horário já ocupado",
          message: `Já existe agendamento em ${r.time} para este dia.`,
        });
        return;
      }
      await addDoc(collection(db, "appointments"), {
        title: r.service,
        client: r.client,
        phone: r.phone,
        time: r.time,
        date: Timestamp.fromDate(r.date),
        createdAt: Timestamp.now(),
      });
      await deleteDoc(doc(db, "requests", r.id));
      setNotice({
        open: true,
        variant: "success",
        title: "Solicitação aprovada",
        message: "Agendamento criado e solicitação removida.",
      });
    } catch (e: any) {
      console.error(e);
      setNotice({
        open: true,
        variant: "error",
        title: "Falha ao aprovar",
        message: e?.message || "Tente novamente.",
      });
    }
  }

  async function rejectRequest(r: RequestDoc) {
    try {
      await deleteDoc(doc(db, "requests", r.id));
      setNotice({
        open: true,
        variant: "success",
        title: "Solicitação removida",
        message: "A solicitação foi excluída.",
      });
    } catch (e: any) {
      console.error(e);
      setNotice({
        open: true,
        variant: "error",
        title: "Falha ao remover",
        message: e?.message || "Tente novamente.",
      });
    }
  }

  // WhatsApp
  function openWhatsApp(a: Appointment) {
    const msg =
      `Olá ${a.client.split(" ")[0]}, tudo bem? Aqui é do *Priscila Alisamentos*.\n\n` +
      `Seu horário para *${a.title}* está marcado para *${a.time}* em *${a.date.toLocaleDateString("pt-BR")}*.\n` +
      `Qualquer ajuste, é só falar por aqui. 💚`;
    window.open(waLinkFrom(onlyDigits(a.phone), msg), "_blank");
  }

  function IconWhatsApp(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
        <path fill="currentColor" d="M20.52 3.48A11.94 11.94 0 0 0 12.01 0C5.38 0 .01 5.37.01 12c0 2.11.55 4.16 1.6 5.98L0 24l6.2-1.61a11.96 11.96 0 0 0 5.81 1.48h.01c6.63 0 12-5.37 12-12 0-3.2-1.25-6.2-3.5-8.39ZM12.02 21.5h-.01a9.5 9.5 0 0 1-4.85-1.33l-.35-.21-3.68.95.98-3.58-.23-.37A9.47 9.47 0 0 1 2.5 12c0-5.25 4.27-9.5 9.51-9.5 2.54 0 4.93.99 6.73 2.78a9.43 9.43 0 0 1 2.77 6.72c0 5.25-4.26 9.5-9.49 9.5Zm5.45-7.16c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.18.2-.35.22-.65.07-.3-.15-1.24-.46-2.37-1.46-.88-.78-1.48-1.74-1.66-2.03-.17-.3-.02-.47.13-.62.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.79.38-.27.3-1.04 1.02-1.04 2.5 0 1.48 1.07 2.93 1.22 3.13.15.2 2.1 3.2 5.09 4.49.71.31 1.26.49 1.69.62.71.22 1.36.19 1.87.11.57-.08 1.77-.72 2.02-1.41.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
      </svg>
    );
  }
  function IconEdit(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
        <path fill="currentColor" d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />
      </svg>
    );
  }
  function IconTrash(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
        <path fill="currentColor" d="M6 7h12v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7Zm3-5h6l1 1h4v2H4V3h4l1-1Z" />
      </svg>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pt-[100px] pb-8">

      {/* Header + CTA Novo agendamento */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Painel de Agendamentos</h1>
          <p className="text-sm text-slate-500">
            Dias com agendamentos ficam marcados com um pontinho verde no calendário.
          </p>
        </div>
        <button
          onClick={() => setOpenNew(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
          </svg>
          Novo agendamento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <section className="lg:col-span-2">
          <Calendar
            selected={selected}
            onSelect={setSelected}
            appointments={appointments}
          />
        </section>

        {/* Coluna direita: solicitações + agendamentos do dia */}
        <aside className="lg:col-span-1 space-y-4">
          {/* Solicitações pendentes */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-medium text-slate-700">Solicitações pendentes</h3>
                <p className="text-xs text-slate-500">Aprovar ou recusar pedidos dos clientes</p>
              </div>
              <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-600">
                {requests.length}
              </span>
            </div>

            {requests.length === 0 ? (
              <div className="m-4 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                Nenhuma solicitação por enquanto.
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {requests.map((r) => (
                  <li key={r.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      {/* blocão com 4 linhas: Nome, Telefone, Serviço, Horário */}
                      <div className="min-w-0">
                        {/* Nome */}
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {r.client}
                        </p>
                        {/* Telefone */}
                        <p className="mt-0.5 text-xs text-slate-600 truncate">
                          {formatPhoneBR(r.phone)}
                        </p>
                        {/* Serviço */}
                        <p className="mt-0.5 text-xs text-slate-600 truncate">
                          {r.service}
                        </p>
                        {/* Horário (data + hora) */}
                        <p className="mt-0.5 text-xs text-slate-600">
                          {r.date.toLocaleDateString("pt-BR")} • {r.time}
                        </p>
                      </div>

                      {/* CTAs – mantidos iguais */}
                      <div className="shrink-0 flex items-center gap-1">
                        <button
                          onClick={() => approveRequest(r)}
                          className="inline-flex items-center rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => rejectRequest(r)}
                          className="inline-flex items-center rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Agendamentos do dia */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-medium text-slate-700">Agendamentos do dia</h3>
                <p className="text-xs text-slate-500">
                  {selected?.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                </p>
              </div>
              <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-600">
                {dayItems.length}
              </span>
            </div>

            {dayItems.length === 0 ? (
              <div className="m-4 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                Sem agendamentos neste dia.
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {dayItems.map((a) => (
                  <li key={String(a.id)} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex gap-3">
                      <div className="min-w-0 flex-1">
                        {/* Linha 1: horário + CTAs (inalterado) */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 tabular-nums">
                            {a.time}
                          </span>

                          <div className="shrink-0 flex items-center gap-1">
                            <button
                              onClick={() => openWhatsApp(a)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                              title="WhatsApp"
                            >
                              <IconWhatsApp /> WhatsApp
                            </button>
                            <button
                              onClick={() => setEditing(a)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                              title="Editar"
                            >
                              <IconEdit /> Editar
                            </button>
                            <button
                              onClick={() => setConfirmDel(a)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                              title="Excluir"
                            >
                              <IconTrash /> Excluir
                            </button>
                          </div>
                        </div>

                        {/* ↓ Novo bloco: Nome, Telefone, Serviço (nessa ordem) */}
                        <div className="mt-2 space-y-0.5">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {a.client}
                          </p>
                          <p className="text-xs text-slate-600 truncate">
                            {formatPhoneBR(a.phone)}
                          </p>
                          <p className="text-xs text-slate-600 truncate">
                            {a.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* Modal: novo agendamento */}
      {openNew && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenNew(false)} />
          <div className="relative z-[101] w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 rounded-t-3xl">
              <h3 className="text-base font-semibold text-slate-800">Novo agendamento</h3>
              <button
                onClick={() => setOpenNew(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <AppointmentForm
                services={services}
                initial={{
                  title: "",
                  client: "",
                  phone: "",
                  time: "",
                  date: selected ?? new Date(),
                }}
                defaultDate={selected}
                busyTimes={takenForSelected}
                onCancel={() => setOpenNew(false)}
                onSubmit={handleCreate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal: editar agendamento */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
          <div className="relative z-[101] w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 rounded-t-3xl">
              <h3 className="text-base font-semibold text-slate-800">Editar agendamento</h3>
              <button
                onClick={() => setEditing(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <AppointmentForm
                services={services}
                initial={{
                  title: editing.title,
                  client: editing.client,
                  phone: formatPhoneBR(editing.phone),
                  time: editing.time,
                  date: editing.date,
                }}
                defaultDate={selected}
                busyTimes={takenForSelected}
                onCancel={() => setEditing(null)}
                onSubmit={handleUpdate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal: confirmar exclusão */}
      <ConfirmModal
        isOpen={!!confirmDel}
        title="Excluir agendamento"
        description={
          confirmDel ? (
            <>Deseja excluir o agendamento de <b>{confirmDel.client}</b> ({confirmDel.title} — {confirmDel.time})?</>
          ) : null
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
      />

      {/* Modal: notificação */}
      <NotificationModal
        open={notice.open}
        title={notice.title}
        message={notice.message}
        variant={notice.variant}
        onClose={() => setNotice((n) => ({ ...n, open: false }))}
      />
    </div>
  );
}
