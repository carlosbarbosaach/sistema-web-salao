import React from "react";

export default function SimpleToast({
  open,
  message = "Sua solicitação foi enviada! O administrador irá confirmar via WhatsApp.",
  onClose,
  durationMs = 10000,
}: {
  open: boolean;
  message?: string;
  onClose: () => void;
  durationMs?: number;
}) {
  const [remaining, setRemaining] = React.useState(durationMs);

  React.useEffect(() => {
    if (!open) { setRemaining(durationMs); return; }
    const start = Date.now();
    const t = setTimeout(onClose, durationMs);
    const iv = setInterval(() => {
      setRemaining(Math.max(0, durationMs - (Date.now() - start)));
    }, 100);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [open, durationMs, onClose]);

  if (!open) return null;
  const s = Math.ceil(remaining / 1000);

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 md:justify-end md:items-start">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative mt-14 md:mt-8 w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="flex items-start gap-3 p-4">
          <div className="mt-0.5 text-emerald-600">✔️</div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-900">Solicitação enviada</h4>
            <p className="mt-1 text-sm text-slate-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-emerald-600" style={{ animation: `bar ${durationMs}ms linear forwards` }} />
          </div>
          <style>{`@keyframes bar{from{width:0%}to{width:100%}}`}</style>
          <div className="mt-2 text-[11px] text-slate-500">Fechando em {s}s…</div>
        </div>
      </div>
    </div>
  );
}
