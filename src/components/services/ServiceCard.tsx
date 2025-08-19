import type { Service } from "../../types/service";
import { formatBRL } from "../../utils/format";
import Badge from "../common/Badge";
import { PencilIcon, TrashIcon } from "../icons";

type Props = {
  service: Service;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function ServiceCard({ service, onEdit, onDelete }: Props) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white hover:shadow-sm transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-800">{service.name}</h3>
          {service.badge && <Badge>{service.badge}</Badge>}
        </div>

        <p className="mt-1 text-sm text-slate-600 line-clamp-3">{service.description}</p>

        <div className="mt-4 flex items-end justify-between">
          <div className="space-y-1">
            <div className="text-base font-semibold text-slate-900">
              {formatBRL(service.price)}
            </div>
            <div className="text-xs text-slate-500 tabular-nums">~ {service.durationMin} min</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(service.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
              title="Editar"
              aria-label={`Editar ${service.name}`}
            >
              <PencilIcon /> Editar
            </button>
            <button
              onClick={() => onDelete(service.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 cursor-pointer"
              title="Excluir"
              aria-label={`Excluir ${service.name}`}
            >
              <TrashIcon /> Excluir
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
