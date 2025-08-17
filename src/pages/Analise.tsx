// src/pages/Analise.tsx
import React from "react";
import type { Appointment } from "../types/appointment";
import type { Service } from "../types/service";
import {
  Card, CardHeader, CardBody, SubBox,
  Kpi, MiniLine, TopServicesTable, RecentAppointments
} from "../components/analysis";
import PrivateLayout from "../layouts/PrivateLayout";

// 🔗 Firestore
import { db } from "../lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

/* ===================== Helpers ===================== */
function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}
function startOfDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function rangeDays(from: Date, to: Date) {
  const out: Date[] = [];
  let cur = startOfDay(from);
  const end = startOfDay(to);
  while (cur <= end) { out.push(cur); cur = addDays(cur, 1); }
  return out;
}
// Timestamp | string | Date -> Date (LOCAL)
function toLocalDate(d: any): Date {
  if (d?.toDate) return d.toDate();
  if (typeof d === "string") {
    const [y, m, day] = d.split("-").map(Number);
    if (y && m) return new Date(y, (m || 1) - 1, day || 1);
  }
  return new Date(d);
}

/* ===================== Períodos ===================== */
type PeriodKey = "today" | "7d" | "month" | "30d";
function getRange(period: PeriodKey) {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start = new Date(end);
  if (period === "today") start = end;
  if (period === "7d") start = addDays(end, -6);
  if (period === "30d") start = addDays(end, -29);
  if (period === "month") start = new Date(end.getFullYear(), end.getMonth(), 1);
  return { start, end };
}
function periodLabel(period: PeriodKey) {
  if (period === "today") return "Hoje";
  if (period === "7d") return "Últimos 7 dias";
  if (period === "30d") return "Últimos 30 dias";
  return "Este mês";
}

export default function Analise({ title = "Análise" }: { title?: string }) {
  /* ===================== State: Firestore ===================== */
  const [services, setServices] = React.useState<Service[]>([]);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);

  // Services
  React.useEffect(() => {
    const q = query(collection(db, "services"), orderBy("name", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const rows: Service[] = snap.docs.map((d) => {
        const s: any = d.data();
        return {
          id: d.id,
          name: s.name,
          description: s.description ?? "",
          price: s.price ?? 0,
          durationMin: s.durationMin ?? 0,
          badge: s.badge,
        } as Service;
      });
      setServices(rows);
    });
    return () => unsub();
  }, []);

  // Appointments
  React.useEffect(() => {
    const q = query(collection(db, "appointments"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const rows: Appointment[] = snap.docs.map((d) => {
        const a: any = d.data();
        return {
          id: d.id,
          title: a.title,
          client: a.client,
          phone: a.phone,
          time: a.time,
          date: toLocalDate(a.date),
        } as Appointment;
      });
      setAppointments(rows);
    });
    return () => unsub();
  }, []);

  const serviceCount = services.length;
  const apptTotalAll = appointments.length;

  /* ===================== Período selecionado ===================== */
  const [period, setPeriod] = React.useState<PeriodKey>("month");
  const { start, end } = getRange(period);

  // Filtra agendamentos pelo período
  const appts = React.useMemo(
    () => appointments.filter(a => a.date >= start && a.date <= end),
    [appointments, start, end]
  );

  // preço por serviço usando services do Firestore
  const priceMap = React.useMemo(() => {
    const m = new Map<string, number>();
    services.forEach(s => m.set(s.name, s.price || 0));
    return m;
  }, [services]);
  const priceFor = React.useCallback((title: string) => priceMap.get(title) ?? 0, [priceMap]);

  /* ===================== Métricas ===================== */
  const total = appts.length;
  const revenue = appts.reduce((acc, a) => acc + priceFor(a.title), 0);
  const ticket = total ? revenue / total : 0;
  const uniqueClients = new Set(appts.map(a => a.client)).size;

  // Série diária
  const days = React.useMemo(() => rangeDays(start, end), [start, end]);
  const series = React.useMemo(
    () => days.map(d => appts.filter(a => sameDay(a.date, d)).length),
    [days, appts]
  );

  // Top serviços
  const topRows = React.useMemo(() => {
    const topMap = new Map<string, { qty: number; revenue: number }>();
    appts.forEach(a => {
      const p = priceFor(a.title);
      const cur = topMap.get(a.title) ?? { qty: 0, revenue: 0 };
      topMap.set(a.title, { qty: cur.qty + 1, revenue: cur.revenue + p });
    });
    return [...topMap.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [appts, priceFor]);

  /* ===================== Últimos agendamentos (pagina) ===================== */
  const PAGE_SIZE = 5;
  const sortedAppts = React.useMemo(
    () => [...appts].sort((a, b) => b.date.getTime() - a.date.getTime()),
    [appts]
  );
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(sortedAppts.length / PAGE_SIZE));
  React.useEffect(() => setPage(1), [period]);

  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, sortedAppts.length);
  const pageItems = sortedAppts.slice(startIdx, endIdx);

  /* ===================== Export CSV ===================== */
  function exportCsv() {
    const header = ["data", "hora", "cliente", "servico", "preco"];
    const lines = appts.map(a => [
      a.date.toISOString().slice(0, 10),
      a.time,
      a.client.replace(/,/g, " "),
      a.title.replace(/,/g, " "),
      String(priceFor(a.title)),
    ]);
    const csv = [header, ...lines].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const aTag = document.createElement("a");
    aTag.href = url;
    aTag.download = `analise_${start.toISOString().slice(0, 10)}_${end.toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(aTag);
    aTag.click();
    document.body.removeChild(aTag);
    URL.revokeObjectURL(url);
  }

  /* ===================== UI ===================== */
  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pt-[100px] pb-8">
      <PrivateLayout />

      {/* Header + ações */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500">Visão geral operacional e financeira por período.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodKey)}
              className="appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              title="Selecionar período"
            >
              <option value="today">Hoje</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="month">Este mês</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
            <svg width="16" height="16" viewBox="0 0 24 24" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">
              <path fill="currentColor" d="M7 10l5 5 5-5z" />
            </svg>
          </div>

          <button
            onClick={exportCsv}
            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <Kpi label="Serviços cadastrados" value={String(serviceCount)} />
        <Kpi label="Agendamentos cadastrados" value={String(apptTotalAll)} />
        <Kpi label="Agendamentos (período)" value={String(total)} />
        <Kpi label="Receita estimada" value={formatBRL(revenue)} />
        <Kpi label="Ticket médio" value={formatBRL(ticket)} />
        <Kpi label="Clientes únicos" value={String(uniqueClients)} />
      </section>

      {/* Gráfico + Top serviços */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Agendamentos por dia"
            right={
              days.length
                ? `${days[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} — ${days[days.length - 1].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`
                : periodLabel(period)
            }
          />
          <CardBody>
            <SubBox>
              <div className="px-4 py-3 bg-slate-50 text-sm font-medium text-slate-700">
                Tendência diária
              </div>
              <div className="p-4">
                <MiniLine points={series} />
              </div>
            </SubBox>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Top serviços" right={periodLabel(period)} />
          <CardBody>
            <SubBox>
              <div className="px-4 py-3 bg-slate-50 text-sm font-medium text-slate-700">
                Quantidade e receita
              </div>
              <div className="p-2">
                <TopServicesTable rows={topRows} />
              </div>
            </SubBox>
          </CardBody>
        </Card>
      </section>

      {/* Últimos agendamentos (com paginação 5/5) */}
      <section className="mt-6">
        <Card>
          <CardHeader title="Últimos agendamentos" right={periodLabel(period)} />
          <CardBody>
            <SubBox>
              {/* barra com paginação */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                <span className="text-sm font-medium text-slate-700">Lista</span>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>
                    {sortedAppts.length === 0
                      ? "0"
                      : `${startIdx + 1}–${endIdx}`} de {sortedAppts.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Página anterior"
                      title="Anterior"
                    >
                      ‹
                    </button>
                    <span className="px-1.5 py-1 rounded-md border border-slate-200">
                      pág. {page}/{totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || sortedAppts.length === 0}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Próxima página"
                      title="Próximo"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>

              <RecentAppointments items={pageItems} />
            </SubBox>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
