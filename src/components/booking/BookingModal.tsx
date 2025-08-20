import React from "react";
import BookingForm from "./BookingForm";

export default function BookingModal({
  isOpen,
  onClose,
  date,
  presetServiceId,
  servicesCollection = "services",
  scheduleDocPath = "settings/schedule",
}: {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  presetServiceId?: string;
  servicesCollection?: string;
  scheduleDocPath?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative z-[101] w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 rounded-t-2xl">
            <h3 className="text-base font-semibold text-slate-800">Novo agendamento</h3>
            <button
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          <div className="p-5">
            <BookingForm
              date={date}
              presetServiceId={presetServiceId}
              servicesCollection={servicesCollection}
              scheduleDocPath={scheduleDocPath}
              onCancel={onClose}
              onSuccess={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
