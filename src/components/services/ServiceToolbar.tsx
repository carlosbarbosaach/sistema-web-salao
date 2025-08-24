// src/components/services/ServiceToolbar.tsx
import { PlusIcon } from "../icons";

type Props = {
    title?: string;
    subtitle?: string;
    onCreate: () => void;
};

export default function ServiceToolbar({
    title = "Serviços",
    subtitle = "Módulo de gestão de serviços (inclusão, alteração e exclusão).",
    onCreate,
}: Props) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-xl md:text-2xl font-semibold text-slate-800">{title}</h1>
                <p className="text-sm text-slate-500">{subtitle}</p>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onCreate}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                    <PlusIcon /> Novo serviço
                </button>
            </div>
        </div>
    );
}
