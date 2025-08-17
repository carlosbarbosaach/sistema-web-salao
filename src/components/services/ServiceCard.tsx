// src/components/services/ServiceCard.tsx
import type { Service } from "../../types/service";

export default function ServiceCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Service;
  onEdit?: (s: Service) => void;
  onDelete?: (s: Service) => void;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col">
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-slate-900">{item.name}</h3>
        {item.badge ? (
          <span className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700">
            {item.badge}
          </span>
        ) : null}
      </div>

      {item.description ? (
        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{item.description}</p>
      ) : (
        <p className="mt-2 text-sm text-slate-400 italic">Sem descrição.</p>
      )}

      <div className="mt-4 flex items-end justify-between">
        <div className="space-y-1">
          <div className="text-xs text-slate-500 tabular-nums">~ {Number(item.durationMin ?? 0)} min</div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(item)}
              className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
            >
              Excluir
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
