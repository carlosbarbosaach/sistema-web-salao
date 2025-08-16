// src/pages/Servicos.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { INITIAL_SERVICES } from "../data/services";
import type { Service } from "../types/service";
import ServiceToolbar from "../components/services/ServiceToolbar";
import ServiceGrid from "../components/services/ServiceGrid";
import Modal from "../components/common/Modal";
import ServiceForm from "../components/services/ServiceForm";
import EditServiceModal from "../components/services/EditServiceModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import PrivateLayout from "../layouts/PrivateLayout";

export default function Servicos({ title = "Serviços" }: { title?: string }) {
  const [services, setServices] = React.useState<Service[]>(INITIAL_SERVICES);

  // Novo
  const [openNew, setOpenNew] = React.useState(false);

  // Editar
  const [editOpen, setEditOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Service | null>(null);

  // Excluir
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Service | null>(null);

  const navigate = useNavigate();

  function nextId(list: Service[]) {
    return (list.length ? Math.max(...list.map((s) => s.id)) : 0) + 1;
  }

  /** Novo */
  function handleCreateOpen() {
    setOpenNew(true);
  }
  function handleCreateClose() {
    setOpenNew(false);
  }
  function handleCreateSubmit(data: Omit<Service, "id">) {
    setServices((prev) => [{ id: nextId(prev), ...data }, ...prev]);
    setOpenNew(false);
  }

  /** Editar */
  function handleEditOpen(id: number) {
    const item = services.find((s) => s.id === id) || null;
    setEditTarget(item);
    setEditOpen(!!item);
  }
  function handleEditClose() {
    setEditOpen(false);
    setEditTarget(null);
  }
  function handleEditSubmit(data: Omit<Service, "id">) {
    if (!editTarget) return;
    setServices((prev) =>
      prev.map((s) => (s.id === editTarget.id ? { ...s, ...data } : s))
    );
    handleEditClose();
  }

  /** Excluir */
  function handleDeleteOpen(id: number) {
    const item = services.find((s) => s.id === id) || null;
    setDeleteTarget(item);
    setDeleteOpen(!!item);
  }
  function handleDeleteCancel() {
    setDeleteOpen(false);
    setDeleteTarget(null);
  }
  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    handleDeleteCancel();
    // TODO: chamar API de exclusão aqui
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pt-[100px] pb-8">
      <PrivateLayout />
      <ServiceToolbar title={title} onCreate={handleCreateOpen} />
      <ServiceGrid
        services={services}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />
      <p className="mt-6 text-xs text-slate-500">
        Módulo de gestão de serviços (inclusão, alteração e exclusão).
      </p>

      {/* Modal: Novo serviço */}
      <Modal isOpen={openNew} title="Novo serviço" onClose={handleCreateClose}>
        <ServiceForm onSubmit={handleCreateSubmit} onCancel={handleCreateClose} />
      </Modal>

      {/* Modal: Editar serviço */}
      <EditServiceModal
        isOpen={editOpen}
        service={editTarget}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
      />

      {/* Modal: Excluir (sim/não) */}
      <ConfirmDialog
        isOpen={deleteOpen}
        title="Excluir serviço"
        message={
          <span>
            Tem certeza que deseja excluir{" "}
            <strong>{deleteTarget?.name}</strong>?
            <br />
            Esta ação não poderá ser desfeita.
          </span>
        }
        confirmLabel="Sim, excluir"
        cancelLabel="Não, cancelar"
        tone="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
