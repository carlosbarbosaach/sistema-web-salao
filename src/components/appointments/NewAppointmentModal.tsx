import Modal from "../common/Modal";
import AppointmentForm from "./AppointmentForm";
import type { Appointment } from "../../types/appointment";
import type { Service } from "../../types/service"; // ✅

type Props = {
  isOpen: boolean;
  defaultDate: Date | null;
  onClose: () => void;
  onSubmit: (data: Omit<Appointment, "id">) => void;
  services: Service[]; // ✅
};

export default function NewAppointmentModal({
  isOpen,
  defaultDate,
  onClose,
  onSubmit,
  services, // ✅
}: Props) {
  return (
    <Modal isOpen={isOpen} title="Novo agendamento" onClose={onClose}>
      <AppointmentForm
        services={services}   // ✅ repassa pro form
        defaultDate={defaultDate}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
