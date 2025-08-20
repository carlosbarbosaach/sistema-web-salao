import React from "react";
import { collection, getDocs, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AdminTools() {
  const [running, setRunning] = React.useState(false);
  const [logs, setLogs] = React.useState<string[]>([]);
  const [done, setDone] = React.useState(false);

  async function makeAllAppointmentsPublic() {
    setRunning(true);
    setLogs([]);
    setDone(false);
    try {
      const q = query(collection(db, "appointments"), orderBy("date", "asc"));
      const snap = await getDocs(q);

      let updated = 0;
      const total = snap.size;

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (!data.public) {
          await updateDoc(docSnap.ref, { public: true });
          updated++;
        }
      }

      setLogs((l) => [
        ...l,
        `Total de documentos: ${total}`,
        `Atualizados (public: true): ${updated}`,
      ]);
      setDone(true);
    } catch (e: any) {
      setLogs((l) => [...l, `Erro: ${e?.message || String(e)}`]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-8">
      <h1 className="text-xl md:text-2xl font-semibold text-slate-800">Ferramentas de Admin</h1>
      <p className="text-sm text-slate-500">Rotinas pontuais no banco (admin).</p>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">
          Marcar todos os agendamentos como públicos
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Define <code>public: true</code> em todos os docs de <code>appointments</code> que ainda
          não têm esse campo. É preciso estar logado como admin.
        </p>

        <button
          onClick={makeAllAppointmentsPublic}
          disabled={running}
          className="mt-3 inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {running ? "Executando…" : "Executar"}
        </button>

        {logs.length > 0 && (
          <pre className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 overflow-auto">
            {logs.join("\n")}
          </pre>
        )}
        {done && <p className="mt-2 text-sm text-emerald-700">Pronto! Todos públicos. ✅</p>}
      </div>
    </div>
  );
}
