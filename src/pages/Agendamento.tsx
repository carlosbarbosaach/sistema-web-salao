// pages/Agendamento.tsx
import React from "react";
import Calendar from "../components/calendar/Calendar";
import AppointmentList from "../components/appointments/AppointmentList";
import RequestsCard from "../components/requests/RequestsCard";
import NewAppointmentModal from "../components/appointments/NewAppointmentModal";
import type { Appointment } from "../types/appointment";
import type { Service } from "../types/service";
import PrivateLayout from "../layouts/PrivateLayout";

/* Ícone */
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
    </svg>
  );
}

/* Serviços para o select do modal (mock) */
const SERVICES_FOR_SELECT: Service[] = [
  { id: 1, name: "Corte Feminino", description: "", price: 120, durationMin: 50 },
  { id: 2, name: "Corte Masculino", description: "", price: 70, durationMin: 35 },
  { id: 3, name: "Coloração", description: "", price: 260, durationMin: 120 },
  { id: 4, name: "Progressiva", description: "", price: 480, durationMin: 150 },
];

export default function Agendamento() {
  const [selected, setSelected] = React.useState<Date | null>(new Date());

  // estado para listar e adicionar
  const [appointments, setAppointments] = React.useState<Appointment[]>([
    { id: 1, title: "Priscila Alisamentos", client: "Priscila Rodrigues", phone: "(11) 98765-4321", time: "09:00", date: new Date(2025, 7, 16) },
    { id: 2, title: "Corte Masculino",      client: "Carlos Eduardo",     phone: "(11) 99888-1122", time: "14:00", date: new Date(2025, 7, 16) },
    { id: 3, title: "Coloração",            client: "Ana Paula",          phone: "(11) 3344-5566", time: "11:00", date: new Date(2025, 7, 17) },
  ]);

  // modal “Novo agendamento”
  const [openNew, setOpenNew] = React.useState(false);
  const openNewModal = () => setOpenNew(true);
  const closeNewModal = () => setOpenNew(false);

  // util p/ gerar id
  function nextId(list: Appointment[]) {
    return (list.length ? Math.max(...list.map((a) => a.id)) : 0) + 1;
  }

  function handleCreateSubmit(data: Omit<Appointment, "id">) {
    setAppointments((prev) => [{ id: nextId(prev), ...data }, ...prev]);
    setOpenNew(false);
  }

  const filtered = React.useMemo(
    () =>
      selected
        ? appointments.filter((a) => a.date.toDateString() === selected.toDateString())
        : [],
    [appointments, selected]
  );

  // solicitações (vazio = empty state)
  const solicitacoes: Array<{
    id: number; cliente: string; servico?: string; hora?: string; status?: "pendente" | "aprovada" | "cancelada";
  }> = [];

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pt-[100px] pb-8">
      <PrivateLayout />
      {/* Título da página */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Painel de Agendamentos</h1>
      </div>

      {/* GRID principal: calendário (2/3) + coluna direita (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Esquerda: Calendário (ocupa 2 colunas no desktop) */}
        <section className="lg:col-span-2">
          <Calendar selected={selected} onSelect={setSelected} appointments={appointments} />
        </section>

        {/* Direita: CTA + Agendamentos + Solicitações */}
        <aside className="lg:col-span-1 space-y-4">
          {/* CTA no topo da coluna direita */}
          <div className="flex justify-end">
            <button
              onClick={openNewModal}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <PlusIcon /> Novo agendamento
            </button>
          </div>

          <AppointmentList
            appointments={filtered}
            title="Agendamentos"
            date={selected ?? new Date()}
          />

          <RequestsCard
            title="Solicitações"
            date={selected ?? new Date()}
            items={solicitacoes}
          />
        </aside>
      </div>

      {/* Modal de novo agendamento */}
      <NewAppointmentModal
        isOpen={openNew}
        defaultDate={selected}
        onClose={closeNewModal}
        onSubmit={handleCreateSubmit}
        services={SERVICES_FOR_SELECT}
      />
    </div>
  );
}
