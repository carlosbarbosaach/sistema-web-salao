// src/pages/Serviços.tsx
import React from "react";
import {
  listenServices,
  createService,
  updateService,
  deleteService,
} from "../repositories/serviceRepo";
import type { Service } from "../types/service";
import ServiceForm from "../components/services/ServiceForm";
import ConfirmModal from "../components/common/ConfirmModal";
import PrivateLayout from "../layouts/PrivateLayout";

type FormValues = Omit<Service, "id">;

function badgeClass(b?: string) {
  if (!b) return "";
  const base =
    "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold";
  switch (b.toLowerCase()) {
    case "novo":
      return `${base} bg-indigo-50 text-indigo-700`;
    case "popular":
      return `${base} bg-violet-50 text-violet-700`;
    case "promo":
    case "promoção":
      return `${base} bg-emerald-50 text-emerald-700`;
    default:
      return `${base} bg-slate-100 text-slate-700`;
  }
}

export default function Servicos({ title = "Serviços" }: { title?: string }) {
  const [items, setItems] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [openForm, setOpenForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Service | null>(null);
  const [confirmDel, setConfirmDel] = React.useState<{ id: string; name: string } | null>(null);

  React.useEffect(() => {
    const unsub = listenServices(
      (rows) => {
        setItems(rows);
        setLoading(false);
      },
      (e) => {
        console.error(e);
        setError("Falha ao carregar serviços.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  function handleNew() {
    setEditing(null);
    setOpenForm(true);
  }
  function handleEdit(s: Service) {
    setEditing(s);
    setOpenForm(true);
  }
  async function handleSubmit(data: FormValues) {
    try {
      if (editing) await updateService(editing.id, data);
      else await createService(data);
      setOpenForm(false);
      setEditing(null);
    } catch (e) {
      console.error(e);
      alert(
        "Não foi possível salvar. Verifique as permissões nas Rules e se você está logado como admin."
      );
    }
  }
  async function handleDelete() {
    if (!confirmDel) return;
    try {
      await deleteService(confirmDel.id);
    } catch (e) {
      console.error(e);
      alert("Não foi possível excluir.");
    } finally {
      setConfirmDel(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pt-[100px] pb-8">
      <PrivateLayout />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-800">{title}</h1>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Novo serviço
        </button>
      </div>

      {/* Lista em cards */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            Carregando…
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-rose-600 shadow-sm">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Nenhum serviço. Clique em “Novo serviço” para cadastrar.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((s) => (
              <article
                key={s.id}
                className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col"
              >
                {/* Título + badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{s.name}</h3>
                  </div>
                  {s.badge ? <span className={badgeClass(s.badge)}>{s.badge}</span> : null}
                </div>

                {/* Descrição */}
                {s.description ? (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{s.description}</p>
                ) : (
                  <p className="mt-2 text-sm text-slate-400 italic">Sem descrição.</p>
                )}

                {/* Duração (sem preço) + ações */}
                <div className="mt-4 flex items-end justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs text-slate-500">Duração estimada</div>
                    <div className="text-base font-semibold text-slate-900 tabular-nums">
                      ~ {s.durationMin} min
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmDel({ id: s.id, name: s.name })}
                      className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Form */}
      {openForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setOpenForm(false);
              setEditing(null);
            }}
          />
          <div className="relative z-[101] w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 rounded-t-3xl">
              <h3 className="text-base font-semibold text-slate-800">
                {editing ? "Editar serviço" : "Novo serviço"}
              </h3>
              <button
                onClick={() => {
                  setOpenForm(false);
                  setEditing(null);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <ServiceForm
                initial={editing ?? undefined}
                onCancel={() => {
                  setOpenForm(false);
                  setEditing(null);
                }}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal: confirmar exclusão */}
      <ConfirmModal
        isOpen={!!confirmDel}
        title="Excluir serviço"
        description={
          confirmDel ? (
            <>
              Tem certeza que deseja excluir <b>{confirmDel.name}</b>? Essa ação não pode ser
              desfeita.
            </>
          ) : null
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}
