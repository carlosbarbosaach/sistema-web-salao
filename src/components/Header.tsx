// components/Header.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

import Logo from "./Logo";
import Nav from "./Nav";
import MobileMenu from "./MobileMenu";
import ConfirmModal from "./common/ConfirmModal";

type NavItem = { to: string; label: string };

function Header({ brand = "Priscila Alisamentos" }: { brand?: string }) {
  const [open, setOpen] = React.useState(false);
  const [confirmOut, setConfirmOut] = React.useState(false);
  const navigate = useNavigate();

  const nav: NavItem[] = [
    { to: "/agendamento", label: "Agendamento" },
    { to: "/servicos", label: "Serviços" },
    { to: "/analise", label: "Análise" },
  ];

  async function handleSignOut() {
    try {
      await signOut(auth);
    } finally {
      setConfirmOut(false);
      navigate("/login", { replace: true });
    }
  }

  return (
    <header
      className="
        fixed top-0 inset-x-0
        z-[200]
        bg-white/90 supports-[backdrop-filter]:bg-white/70 backdrop-blur
        border-b border-slate-200
        shadow-sm
      "
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Logo name={brand} />

          <Nav items={nav} />

          <div className="flex items-center gap-2">
            {/* CTA Sair (desktop) */}
            <button
              onClick={() => setConfirmOut(true)}
              className="hidden md:inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
              title="Sair"
            >
              Sair
            </button>

            {/* Menu mobile */}
            <button
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
              aria-label="Abrir menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="text-xl">{open ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        {/* Menu mobile com ação de sair padronizada */}
        <MobileMenu
          items={nav}
          open={open}
          onClose={() => setOpen(false)}
          mode="private"
          onLogout={() => setConfirmOut(true)}
        />
      </div>

      {/* Modal de confirmação de saída */}
      <ConfirmModal
        isOpen={confirmOut}
        title="Sair da conta"
        description="Tem certeza que deseja sair?"
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleSignOut}
        onCancel={() => setConfirmOut(false)}
      />
    </header>
  );
}

export default Header;
