// components/common/ConfirmModal.tsx
import React from "react";
import Modal from "./Modal";

type Props = {
  isOpen: boolean;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary" | "neutral";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  isOpen,
  title = "Confirmar ação",
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: Props) {
  const v =
    variant === "danger"
      ? "bg-rose-600 hover:bg-rose-700 focus:ring-rose-300"
      : variant === "primary"
      ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300"
      : "bg-slate-800 hover:bg-slate-900 focus:ring-slate-300";

  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <div className="space-y-4">
        {description ? (
          <p className="text-sm text-slate-600">{description}</p>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus:ring-2 ${v}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
