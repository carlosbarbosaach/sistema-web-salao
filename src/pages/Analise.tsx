// pages/Analise.tsx
import React from "react";
import type { Appointment } from "../types/appointment";
import type { Service } from "../types/service";
import {
  Card, CardHeader, CardBody, SubBox,
  Kpi, MiniLine, TopServicesTable, RecentAppointments
} from "../components/analysis";
import PrivateLayout from "../layouts/PrivateLayout";

/* Mocks */
const SERVICES_MOCK: Service[] = [
  { id: 1, name: "Corte Feminino", description: "", price: 120, durationMin: 50, badge: "Popular" },
  { id: 2, name: "Corte Masculino", description: "", price: 70, durationMin: 35 },
  { id: 3, name: "Escova Modeladora", description: "", price: 90, durationMin: 45 },
  { id: 4, name: "Coloração", description: "", price: 260, durationMin: 120, badge: "Novo" },
  { id: 5, name: "Progressiva", description: "", price: 480, durationMin: 150, badge: "Promo" },
];

const APPTS_MOCK: Appointment[] = [
  { id: 1, title: "Corte Feminino", client: "Ana Paula", phone: "(48) 99811-7717", time: "09:00", date: new Date(2025, 7, 10) },
  { id: 2, title: "Coloração", client: "Carla Souza", phone: "(48) 99922-3344", time: "11:00", date: new Date(2025, 7, 11) },
  { id: 3, title: "Corte Masculino", client: "Eduardo Lima", phone: "(48) 98877-1100", time: "14:00", date: new Date(2025, 7, 11) },
  { id: 4, title: "Progressiva", client: "Priscila Santos", phone: "(48) 99777-5522", time: "16:00", date: new Date(2025, 7, 12) },
  { id: 5, title: "Escova Modeladora", client: "Bianca Alves", phone: "(48) 98123-4567", time: "10:00", date: new Date(2025, 7, 13) },
  { id: 6, title: "Corte Feminino", client: "Maria Silva", phone: "(48) 98888-7777", time: "13:30", date: new Date(2025, 7, 14) },
  { id: 7, title: "Coloração", client: "Julia Pereira", phone: "(48) 99111-2222", time: "15:00", date: new Date(2025, 7, 14) },
  { id: 8, title: "Corte Masculino", client: "Carlos Eduardo", phone: "(48) 99876-5432", time: "09:30", date: new Date(2025, 7, 15) },
  { id: 9, title: "Progressiva", client: "Lara Nogueira", phone: "(48) 99700-1010", time: "12:00", date: new Date(2025, 7, 15) },
  { id: 10, title: "Corte Feminino", client: "Fernanda Costa", phone: "(48) 98222-3333", time: "17:00", date: new Date(2025, 7, 16) },
];

/* Helpers */
function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
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
function priceFor(title: string) {
  return SERVICES_MOCK.find(s => s.name === title)?.price ?? 0;
}

/* Página */
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
  const [period, setPeriod] = React.useState<PeriodKey>("month");
  const { start, end } = getRange(period);

  const appts = React.useMemo(
    () => APPTS_MOCK.filter(a => a.date >= start && a.date <= end),
    [period, start, end]
  );

  const total = appts.length;
  const revenue = appts.reduce((acc, a) => acc + priceFor(a.title), 0);
  const ticket = total ? revenue / total : 0;
  const uniqueClients = new Set(appts.map(a => a.client)).size;

  const days = rangeDays(start, end);
  const series = days.map(d => appts.filter(a => sameDay(a.date, d)).length);

  const topMap = new Map<string, { qty: number; revenue: number }>();
  appts.forEach(a => {
    const p = priceFor(a.title);
    const cur = topMap.get(a.title) ?? { qty: 0, revenue: 0 };
    topMap.set(a.title, { qty: cur.qty + 1, revenue: cur.revenue + p });
  });
  const topRows = [...topMap.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // ===== Paginação dos "Últimos agendamentos" =====
  const PAGE_SIZE = 5;
  const sortedAppts = React.useMemo(
    () => [...appts].sort((a, b) => b.date.getTime() - a.date.getTime()),
    [appts]
  );
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(sortedAppts.length / PAGE_SIZE));
  React.useEffect(() => {
    // se trocar o período e a página ficar fora do range, volta pra 1
    setPage(1);
  }, [period]);

  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, sortedAppts.length);
  const pageItems = sortedAppts.slice(startIdx, endIdx);

  function exportCsv() {
    const header = ["data", "hora", "cliente", "servico", "preco"];
    const lines = appts.map(a => [
      a.date.toISOString().slice(0, 10),
      a.time,
      a.client.replace(/,/g, " "),
      a.title.replace(/,/g, " "),
      priceFor(a.title)
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
      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Agendamentos" value={String(total)} />
        <Kpi label="Receita estimada" value={formatBRL(revenue)} />
        <Kpi label="Ticket médio" value={formatBRL(ticket)} />
        <Kpi label="Clientes únicos" value={String(uniqueClients)} />
      </section>

      {/* Gráfico + Top serviços */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Agendamentos por dia"
            right={`${days[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} — ${days[days.length - 1].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`}
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
