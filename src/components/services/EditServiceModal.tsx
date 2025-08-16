// src/components/services/EditServiceModal.tsx
import React from "react";
import Modal from "../common/Modal";
import ServiceForm from "./ServiceForm";
import type { Service } from "../../types/service";

type Props = {
    isOpen: boolean;
    service: Service | null;
    onClose: () => void;
    onSubmit: (data: Omit<Service, "id">) => void;
};

export default function EditServiceModal({ isOpen, service, onClose, onSubmit }: Props) {
    return (
        <Modal isOpen={isOpen} title="Editar serviço" onClose={onClose}>
            <ServiceForm
                initial={
                    service
                        ? {
                            name: service.name,
                            description: service.description,
                            price: service.price,
                            durationMin: service.durationMin,
                            badge: service.badge,
                        }
                        : undefined
                }
                onSubmit={onSubmit}
                onCancel={onClose}
            />
        </Modal>
    );
}
