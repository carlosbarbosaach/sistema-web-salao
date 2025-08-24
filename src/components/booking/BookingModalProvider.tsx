// src/components/booking/BookingModalProvider.tsx
import React from "react";
import BookingModal from "./BookingModal";
import SimpleToast from "../common/SimpleToast";

export type OpenBookingOptions = { date?: Date; presetServiceId?: string };

type Ctx = { isOpen: boolean; open: (o?: OpenBookingOptions) => void; close: () => void };
const Ctx = React.createContext<Ctx | null>(null);
export const useBookingModal = () => {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useBookingModal must be inside BookingModalProvider");
  return v;
};

export function BookingModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date>(new Date());
  const [presetServiceId, setPresetServiceId] = React.useState<string | undefined>();
  const [toastOpen, setToastOpen] = React.useState(false);

  const open = (o?: OpenBookingOptions) => {
    if (o?.date) setDate(o.date);
    setPresetServiceId(o?.presetServiceId);
    setOpen(true);
  };
  const close = () => setOpen(false);

  return (
    <Ctx.Provider value={{ isOpen, open, close }}>
      {children}

      <BookingModal
        isOpen={isOpen}
        onClose={close}
        date={date}
        presetServiceId={presetServiceId}
        onSuccess={() => {
          setOpen(false);      // fecha modal
          setToastOpen(true);  // abre toast
          // opcional: console para depuração
          console.log("[Booking] Solicitação enviada — aguardando confirmação no WhatsApp.");
        }}
      />

      <SimpleToast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message="Sua solicitação foi enviada! O administrador irá confirmar via WhatsApp."
        durationMs={10000}
      />
    </Ctx.Provider>
  );
}
