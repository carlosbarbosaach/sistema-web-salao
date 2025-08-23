import React from "react";

type Variant = "success" | "error" | "info";

type RequestInfo = {
  client: string;
  phone: string;
  service: string;
  date: Date;
  time: string;
};

function formatPhoneBR(raw: string) {
  let d = String(raw || "").replace(/\D/g, "");
  if (d.startsWith("55") && d.length > 11) d = d.slice(2);
  d = d.slice(0, 11);
  if (!d) return "";
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  const isCell = d.length === 11;
  const left = rest.slice(0, isCell ? 5 : 4);
  const right = rest.slice(isCell ? 5 : 4);
  return right ? `(${ddd}) ${left}-${right}` : `(${ddd}) ${left}`;
}

function Icon({ variant }: { variant: Variant }) {
  const base = "h-5 w-5";
  if (variant === "success") {
    return (
      <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
        <path fill="#10B981" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm-1 14-4-4 1.414-1.414L11 12.172l4.586-4.586L17 9l-6 7Z"/>
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
        <path fill="#EF4444" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 13h-2v2h2v-2Zm0-8h-2v6h2V7Z"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
      <path fill="#6366F1" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z"/>
    </svg>
  );
}

export default function RequestToast({
  open,
  info,
  variant = "success",
  title = "Solicitação enviada",
  message = "O administrador vai confirmar ou recusar e avisará você pelo WhatsApp informado.",
  durationMs = 10000,
  onClose,
}: {
  open: boolean;
  info: RequestInfo;
  variant?: Variant;
  title?: string;
  message?: string;
  durationMs?: number;
  onClose: () => void;
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

  const bar =
    variant === "success" ? "bg-emerald-600" :
    variant === "error"   ? "bg-rose-600"    :
                            "bg-indigo-600";

  const secondsLeft = Math.ceil(remaining / 1000);

  return (
    <div className="fixed bottom-4 right-4 z-[120] max-w-sm">
      <style>{`
        @keyframes fillWidth { from { width: 0% } to { width: 100% } }
        @keyframes stripeMove { from { background-position: 0 0 } to { background-position: 40px 0 } }
      `}</style>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <Icon variant={variant} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="mt-0.5 text-sm text-slate-600">{message}</p>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <dl className="grid grid-cols-1 gap-y-1 text-[13px] text-slate-700">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Nome</dt>
                  <dd className="font-medium text-slate-900 truncate">{info.client}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Telefone</dt>
                  <dd className="font-medium text-slate-900">{formatPhoneBR(info.phone)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Serviço</dt>
                  <dd className="font-medium text-slate-900 truncate">{info.service}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Horário</dt>
                  <dd className="font-medium text-slate-900">
                    {info.date.toLocaleDateString("pt-BR")} • {info.time}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <button
            onClick={onClose}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="px-4 pb-3">
          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div className={`relative h-full ${bar}`} style={{ animation: `fillWidth ${durationMs}ms linear forwards` }}>
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(255,255,255,.7) 0, rgba(255,255,255,.7) 10px, transparent 10px, transparent 20px)",
                  backgroundSize: "40px 100%",
                  animation: "stripeMove 800ms linear infinite",
                }}
              />
            </div>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Fechando em {secondsLeft}s…</div>
        </div>
      </div>
    </div>
  );
}
