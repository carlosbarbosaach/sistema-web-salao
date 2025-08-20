import React from "react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";

type NavItem = { to: string; label: string };

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export default function PublicHeader({ brand = "Priscila Alisamentos" }: { brand?: string }) {
  const [open, setOpen] = React.useState(false);

  const nav: NavItem[] = [
    { to: "/cliente/calendario", label: "Calendário" },
    { to: "/cliente/servicos", label: "Serviços" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-[60] bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Logo name={brand} />

          {/* navegação desktop */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navegação do cliente">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                    isActive ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                             : "text-slate-700 hover:bg-slate-100"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* menu mobile + trigger */}
          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 hover:bg-slate-100"
            aria-label="Abrir menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="text-xl">{open ? "✕" : "☰"}</span>
          </button>
        </div>

        {/* MobileMenu já padronizado; modo público (sem “Sair”) */}
        <MobileMenu items={nav} open={open} onClose={() => setOpen(false)} mode="public" />
      </div>
    </header>
  );
}
