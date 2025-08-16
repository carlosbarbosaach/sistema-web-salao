// src/components/common/ConfirmDialog.tsx
import React from "react";
import Modal from "./Modal";

type Props = {
    isOpen: boolean;
    title?: string;
    message?: string | React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    tone?: "default" | "danger";
};

export default function ConfirmDialog({
    isOpen,
    title = "Confirmar ação",
    message = "Tem certeza?",
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    onConfirm,
    onCancel,
    tone = "default",
}: Props) {
    return (
        <Modal isOpen={isOpen} title={title} onClose={onCancel}>
            <div className="space-y-4">
                <div className="text-sm text-slate-700">{message}</div>
                <div className="flex items-center justify-end gap-2">
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
                        className={
                            tone === "danger"
                                ? "inline-flex items-center rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
                                : "inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        }
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
