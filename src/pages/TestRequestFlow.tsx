// src/pages/TestRequestFlow.tsx
import ClientRequestTest from "../components/test/ClientRequestTest";
import AdminRequestsTest from "../components/test/AdminRequestsTest";

export default function TestRequestFlow() {
    return (
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pt-[100px] pb-8">
            <h1 className="text-xl md:text-2xl font-semibold text-slate-800 mb-4">
                Flow de Teste — Solicitação & Aprovação
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClientRequestTest />
                <AdminRequestsTest />
            </div>
        </div>
    );
}
