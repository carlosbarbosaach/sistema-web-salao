import React from "react";

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function TopServicesTable({
  rows,
}: {
  rows: Array<{ name: string; qty: number; revenue: number }>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="text-left px-4 py-2 font-medium">Serviço</th>
            <th className="text-right px-4 py-2 font-medium">Qtd</th>
            <th className="text-right px-4 py-2 font-medium">Receita</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((r) => (
            <tr key={r.name} className="hover:bg-slate-50">
              <td className="px-4 py-2 text-slate-800">{r.name}</td>
              <td className="px-4 py-2 text-right tabular-nums">{r.qty}</td>
              <td className="px-4 py-2 text-right tabular-nums">
                {formatBRL(r.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
