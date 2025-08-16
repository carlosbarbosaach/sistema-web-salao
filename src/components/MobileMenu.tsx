// components/MobileMenu.tsx
import React from "react";
import { NavLink } from "react-router-dom";

type NavItem = { to: string; label: string };

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export default function MobileMenu({
  items,
  open,
  onClose,
  mode = "private",
  onLogout,
}: {
  items: NavItem[];
  open: boolean;
  onClose: () => void;
  mode?: "public" | "private";
  onLogout?: () => void;
}) {
  // trava o scroll do body quando o menu está aberto
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev || ""; };
  }, [open]);

  return (
    <>
      {/* Scrim - cobre a página mas NÃO o header fixo */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 top-16 md:top-20 z-40 bg-black/20 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Sheet abaixo do header */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu móvel"
        className={cn(
          "md:hidden fixed inset-x-0 top-16 md:top-20 z-50 transition-all duration-200",
          open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none"
        )}
      >
        <div className="mx-auto max-w-7xl px-3">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">

            {/* Navegação */}
            <nav className="py-1">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "mx-2 my-0.5 block rounded-xl px-3 py-2.5 text-[15px] font-medium",
                      "transition-colors",
                      isActive
                        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                        : "text-slate-700 hover:bg-slate-100"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Ação de sair (somente no modo autenticado) */}
            {mode === "private" && (
              <div className="px-2 pb-2 pt-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    onClose();
                    onLogout?.();
                  }}
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
