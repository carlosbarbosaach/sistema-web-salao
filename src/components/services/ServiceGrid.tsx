// src/components/services/ServiceGrid.tsx
import type { Service } from "../../types/service";
import ServiceCard from "./ServiceCard";

type Props = {
    services: Service[];
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
};

export default function ServiceGrid({ services, onEdit, onDelete }: Props) {
    return (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
                <ServiceCard key={s.id} service={s} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    );
}
